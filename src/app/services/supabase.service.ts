import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { PlayerStats, GameResult } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor () {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  // Obtener todas las estadísticas de jugadores
  async getPlayerStats (): Promise<PlayerStats[]> {
    try {
      const { data, error } = await this.supabase
        .from('player_stats')
        .select('*')
        .order('win_percentage', { ascending: false });

      if (error) throw error;

      return data?.map(this.mapPlayerStatsFromDB) || [];
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return [];
    }
  }

  // Buscar jugadores por nombre (para sugerencias)
  async searchPlayers (query: string): Promise<PlayerStats[]> {
    try {
      const { data, error } = await this.supabase
        .from('player_stats')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('total_games', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map(this.mapPlayerStatsFromDB) || [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  // Guardar resultado de partida
  async saveGameResult (gameResult: GameResult): Promise<void> {
    try {
      console.log('Saving game result:', gameResult);

      // Guardar el resultado del juego - NO incluir el ID, dejar que Supabase lo genere
      const gameData = this.mapGameResultToDB(gameResult);
      delete gameData.id; // Eliminar el ID para que Supabase genere uno automáticamente

      const { data, error: gameError } = await this.supabase
        .from('game_results')
        .insert([gameData])
        .select(); // Agregar select para obtener el registro insertado

      if (gameError) {
        console.error('Error inserting game result:', gameError);
        throw gameError;
      }

      console.log('Game result saved successfully:', data);

      // Actualizar estadísticas de cada jugador
      await this.updatePlayerStats(gameResult);
    } catch (error) {
      console.error('Error saving game result:', error);
      throw error;
    }
  }

  // Actualizar estadísticas de jugadores
  private async updatePlayerStats (gameResult: GameResult): Promise<void> {
    for (const playerName of gameResult.players) {
      const isWinner = playerName === gameResult.winner;
      await this.upsertPlayerStats(playerName, gameResult.gameType, isWinner);
    }
  }

  // Insertar o actualizar estadísticas de un jugador
  private async upsertPlayerStats (
    playerName: string,
    gameType: string,
    isWinner: boolean
  ): Promise<void> {
    try {
      console.log(`Updating stats for ${playerName}: winner=${isWinner}, game=${gameType}`);

      // Primero intentar obtener las estadísticas existentes
      const { data: existing, error: fetchError } = await this.supabase
        .from('player_stats')
        .select('*')
        .eq('name', playerName)
        .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar errores si no existe

      if (fetchError) {
        console.error('Error fetching existing player stats:', fetchError);
        throw fetchError;
      }

      if (existing) {
        // Actualizar estadísticas existentes
        console.log('Updating existing player:', existing);

        const gamesByType = existing.games_by_type || {};
        const currentGameStats = gamesByType[gameType] || { played: 0, wins: 0 };

        gamesByType[gameType] = {
          played: currentGameStats.played + 1,
          wins: currentGameStats.wins + (isWinner ? 1 : 0)
        };

        const totalGames = existing.total_games + 1;
        const totalWins = existing.total_wins + (isWinner ? 1 : 0);
        const winPercentage = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

        const { error: updateError } = await this.supabase
          .from('player_stats')
          .update({
            total_games: totalGames,
            total_wins: totalWins,
            win_percentage: winPercentage,
            games_by_type: gamesByType,
            last_played: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating player stats:', updateError);
          throw updateError;
        }

        console.log(`Updated stats for ${playerName}`);
      } else {
        // Crear nuevo registro
        console.log('Creating new player:', playerName);

        const gamesByType = {
          [gameType]: { played: 1, wins: isWinner ? 1 : 0 }
        };

        const { error: insertError } = await this.supabase
          .from('player_stats')
          .insert([{
            name: playerName,
            total_games: 1,
            total_wins: isWinner ? 1 : 0,
            win_percentage: isWinner ? 100 : 0,
            games_by_type: gamesByType,
            last_played: new Date().toISOString(),
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error inserting player stats:', insertError);
          throw insertError;
        }

        console.log(`Created stats for ${playerName}`);
      }
    } catch (error) {
      console.error(`Error updating stats for ${playerName}:`, error);
      throw error;
    }
  }

  // Mapear datos de la base de datos al modelo
  private mapPlayerStatsFromDB (data: any): PlayerStats {
    return {
      id: data.id,
      name: data.name,
      totalGames: data.total_games || 0,
      totalWins: data.total_wins || 0,
      winPercentage: data.win_percentage || 0,
      gamesByType: data.games_by_type || {},
      lastPlayed: new Date(data.last_played),
      createdAt: new Date(data.created_at)
    };
  }

  // Mapear resultado del juego para la base de datos
  private mapGameResultToDB (gameResult: GameResult): any {
    return {
      id: gameResult.id, // Se eliminará antes de insertar
      game_type: gameResult.gameType,
      players: gameResult.players,
      winner: gameResult.winner,
      played_at: gameResult.playedAt.toISOString(),
      duration: gameResult.duration
    };
  }
}

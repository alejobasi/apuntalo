import { Injectable } from '@angular/core';
import { Player, PlayerStats, GameResult } from '../models/player.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PLAYERS_KEY = 'card_game_players';

  constructor (private supabaseService: SupabaseService) { }

  // Métodos existentes para localStorage (como fallback)
  getPlayers (): Player[] {
    try {
      const stored = localStorage.getItem(this.PLAYERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading players from localStorage:', error);
      return [];
    }
  }

  savePlayer (playerName: string): Player {
    try {
      const players = this.getPlayers();
      const existingPlayer = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

      if (existingPlayer) {
        existingPlayer.gamesPlayed++;
        this.savePlayers(players);
        return existingPlayer;
      }

      const newPlayer: Player = {
        id: this.generateUUID(), // Usar UUID válido
        name: playerName,
        createdAt: new Date(),
        gamesPlayed: 1
      };

      players.push(newPlayer);
      this.savePlayers(players);
      return newPlayer;
    } catch (error) {
      console.error('Error saving player:', error);
      return {
        id: this.generateUUID(), // Usar UUID válido
        name: playerName,
        createdAt: new Date(),
        gamesPlayed: 1
      };
    }
  }

  // Nuevos métodos para Supabase
  async getPlayerStatsFromCloud (): Promise<PlayerStats[]> {
    return await this.supabaseService.getPlayerStats();
  }

  async getPlayerSuggestionsFromCloud (query: string): Promise<PlayerStats[]> {
    if (query.length < 2) return [];
    return await this.supabaseService.searchPlayers(query);
  }

  async saveGameResultToCloud (
    gameType: string,
    playerNames: string[],
    winnerName: string
  ): Promise<void> {
    const gameResult: GameResult = {
      id: this.generateUUID(), // Usar UUID válido
      gameType,
      players: playerNames,
      winner: winnerName,
      playedAt: new Date()
    };

    await this.supabaseService.saveGameResult(gameResult);
  }

  private savePlayers (players: Player[]): void {
    try {
      localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players to localStorage:', error);
    }
  }

  // Generador de UUID válido
  private generateUUID (): string {
    // Usar crypto.randomUUID si está disponible (navegadores modernos)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback: generar UUID v4 manualmente
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Método legacy para compatibilidad (puedes eliminarlo después)
  private generateId (): string {
    return this.generateUUID();
  }

  getPlayerSuggestions (query: string): Player[] {
    const players = this.getPlayers();
    return players
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
      .slice(0, 5);
  }

  saveGame (gameType: string, gameData: any): void {
    const key = `${gameType}_current_game`;
    localStorage.setItem(key, JSON.stringify(gameData));
  }

  loadGame (gameType: string): any {
    const key = `${gameType}_current_game`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  removeGame (gameType: string): void {
    const key = `${gameType}_current_game`;
    localStorage.removeItem(key);
  }
}

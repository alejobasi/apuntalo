
import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PLAYERS_KEY = 'card_game_players';

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
        id: this.generateId(),
        name: playerName,
        createdAt: new Date(),
        gamesPlayed: 1
      };

      players.push(newPlayer);
      this.savePlayers(players);
      return newPlayer;
    } catch (error) {
      console.error('Error saving player:', error);
      // Return a temporary player if storage fails
      return {
        id: this.generateId(),
        name: playerName,
        createdAt: new Date(),
        gamesPlayed: 1
      };
    }
  }

  private savePlayers (players: Player[]): void {
    try {
      localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players to localStorage:', error);
    }
  }

  private generateId (): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getPlayerSuggestions (query: string): Player[] {
    const players = this.getPlayers();
    return players
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
      .slice(0, 5);
  }
}

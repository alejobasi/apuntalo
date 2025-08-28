import { Injectable } from '@angular/core';
import { EscobaGame, EscobaScore } from '../models/escoba.model';
import { Player } from '../models/player.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class EscobaService {
  private currentGame: EscobaGame | null = null;

  constructor (private storageService: StorageService) { }

  startNewGame (players: Player[], maxRounds: number = 3): EscobaGame {
    this.currentGame = {
      id: this.generateGameId(),
      players,
      currentRound: 1,
      maxRounds,
      scores: [],
      gameState: 'setup',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveGame();
    return this.currentGame;
  }

  addScore (score: EscobaScore): void {
    if (this.currentGame) {
      this.currentGame.scores.push(score);
      this.currentGame.updatedAt = new Date();
      this.saveGame();
    }
  }

  getCurrentGame (): EscobaGame | null {
    return this.currentGame;
  }

  private generateGameId (): string {
    return 'escoba_' + Date.now().toString();
  }

  private saveGame (): void {
    if (this.currentGame) {
      this.storageService.saveGame('escoba', this.currentGame);
    }
  }
}

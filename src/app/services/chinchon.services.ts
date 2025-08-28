import { Injectable } from '@angular/core';
import { ChinchonGame, ChinchonScore } from '../models/chinchon.model';
import { Player } from '../models/player.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChinchonService {
  private currentGame: ChinchonGame | null = null;

  constructor (private storageService: StorageService) { }

  startNewGame (players: Player[], maxPoints: number = 100): ChinchonGame {
    this.currentGame = {
      id: this.generateGameId(),
      players,
      currentRound: 1,
      maxPoints,
      scores: [],
      gameState: 'setup',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveGame();
    return this.currentGame;
  }

  addScore (score: ChinchonScore): void {
    if (this.currentGame) {
      this.currentGame.scores.push(score);
      this.currentGame.updatedAt = new Date();
      this.saveGame();
    }
  }

  getCurrentGame (): ChinchonGame | null {
    return this.currentGame;
  }

  private generateGameId (): string {
    return 'chinchon_' + Date.now().toString();
  }

  private saveGame (): void {
    if (this.currentGame) {
      this.storageService.saveGame('chinchon', this.currentGame);
    }
  }
}

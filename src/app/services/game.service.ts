import { Injectable } from '@angular/core';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private games: Game[] = [
    {
      id: 'clavito',
      name: 'clavito',
      displayName: 'Clavito',
      description: 'Juego de cartas tradicional español'
    }
  ];

  getAvailableGames (): Game[] {
    return this.games;
  }

  getGameById (id: string): Game | undefined {
    return this.games.find(game => game.id === id);
  }
}

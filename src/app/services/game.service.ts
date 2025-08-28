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
    },
    {
      id: 'escoba',
      name: 'escoba',
      displayName: 'La Escoba',
      description: 'Juego de cartas donde debes capturar cartas sumando 15'
    },
    {
      id: 'chinchon',
      name: 'chinchon',
      displayName: 'El Chinchón',
      description: 'Juego de cartas de escaleras y tríos'
    }
  ];

  getAvailableGames (): Game[] {
    return this.games;
  }

  getGameById (id: string): Game | undefined {
    return this.games.find(game => game.id === id);
  }
}

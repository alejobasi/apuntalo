import { Injectable } from '@angular/core';
import { ClavitoGame, ClavitoPlayer } from '../models/clavito.model';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class ClavitoService {

  createGame (players: Player[]): ClavitoGame {
    const clavitoPlayers: ClavitoPlayer[] = players.map(player => ({
      id: player.id,
      name: player.name,
      currentScore: 0, // Usar 'currentScore'
      hasPellejo: false,
      isEliminated: false,
      createdAt: player.createdAt,
      gamesPlayed: player.gamesPlayed
    }));

    return {
      id: this.generateGameId(),
      players: clavitoPlayers,
      gamePhase: 'playing',
      createdAt: new Date()
    };
  }

  addPointToPlayer (game: ClavitoGame, playerId: string): ClavitoGame {
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return game;

    player.currentScore++; // Usar 'currentScore'

    // Recalcular estados basándose en la puntuación actual
    this.updatePlayerStatus(game);

    return game;
  }

  removePointFromPlayer (game: ClavitoGame, playerId: string): ClavitoGame {
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.currentScore <= 0) return game;

    player.currentScore--; // Usar 'currentScore'

    // Recalcular estados basándose en la puntuación actual
    this.updatePlayerStatus(game);

    return game;
  }

  private updatePlayerStatus (game: ClavitoGame): void {
    // Resetear todos los estados
    game.players.forEach(player => {
      player.hasPellejo = false;
      player.isEliminated = false;
    });

    // Encontrar jugadores con 3 puntos exactamente (para pellejo)
    const playersWithThreePoints = game.players.filter(p => p.currentScore === 3);

    // Si hay jugadores con exactamente 3 puntos, el primero obtiene pellejo
    if (playersWithThreePoints.length > 0) {
      // Ordenar por orden de llegada (puedes ajustar esta lógica según tu preferencia)
      const firstWithThreePoints = playersWithThreePoints[0];
      firstWithThreePoints.hasPellejo = true;
    }

    // Aplicar lógica de eliminación
    game.players.forEach(player => {
      if (player.hasPellejo) {
        // Con pellejo: se elimina con 4+ puntos
        if (player.currentScore >= 4) {
          player.isEliminated = true;
        }
      } else {
        // Sin pellejo: se elimina con 3+ puntos
        if (player.currentScore >= 3) {
          player.isEliminated = true;
        }
      }
    });

    // Verificar ganador
    this.checkWinner(game);
  }

  private checkWinner (game: ClavitoGame): void {
    const activePlayers = game.players.filter(p => !p.isEliminated);

    if (activePlayers.length === 1) {
      game.gamePhase = 'finished';
      game.winner = activePlayers[0];
    } else if (activePlayers.length === 0) {
      // Caso especial: todos eliminados, el último en eliminarse gana
      const lastEliminated = game.players.reduce((latest, current) =>
        current.currentScore < latest.currentScore ? latest : current
      );
      game.gamePhase = 'finished';
      game.winner = lastEliminated;
    } else {
      game.gamePhase = 'playing';
      game.winner = undefined;
    }
  }

  resetGame (game: ClavitoGame): ClavitoGame {
    game.players.forEach(player => {
      player.currentScore = 0; // Usar 'currentScore'
      player.hasPellejo = false;
      player.isEliminated = false;
    });

    game.gamePhase = 'playing';
    game.winner = undefined;

    return game;
  }

  getActivePlayers (game: ClavitoGame): ClavitoPlayer[] {
    return game.players.filter(player => !player.isEliminated);
  }

  private generateGameId (): string {
    return 'clavito_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

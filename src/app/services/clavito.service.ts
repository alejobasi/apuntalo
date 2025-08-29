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
      currentScore: 0,
      hasPellejo: false,
      isEliminated: false,
      createdAt: player.createdAt,
      gamesPlayed: player.gamesPlayed
    }));

    return {
      id: this.generateUUID(), // Usar UUID válido
      players: clavitoPlayers,
      gamePhase: 'playing',
      pellejoUsed: false,
      createdAt: new Date()
    };
  }


  addPlayerToGame (game: ClavitoGame, player: Player): ClavitoGame {
    // Verificar que el jugador no esté ya en el juego
    const existingPlayer = game.players.find(p => p.id === player.id);
    if (existingPlayer) {
      return game; // No añadir si ya existe
    }

    // Encontrar el jugador con más puntos
    const maxScore = Math.max(...game.players.map(p => p.currentScore));
    const playerWithMaxScore = game.players.find(p => p.currentScore === maxScore);

    // Determinar puntos iniciales según la regla
    let initialScore = maxScore;
    if (playerWithMaxScore?.hasPellejo && maxScore >= 3) {
      initialScore = 2; // Si el que más tiene tiene pellejo y 3+ puntos, el nuevo empieza con 2
    }

    // Crear nuevo jugador
    const newClavitoPlayer: ClavitoPlayer = {
      id: player.id,
      name: player.name,
      currentScore: initialScore,
      hasPellejo: false,
      isEliminated: false,
      createdAt: player.createdAt,
      gamesPlayed: player.gamesPlayed
    };

    // Añadir al juego
    game.players.push(newClavitoPlayer);

    // Recalcular estados
    this.updatePlayerStatus(game);

    return game;
  }

  addPointToPlayer (game: ClavitoGame, playerId: string): ClavitoGame {
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return game;

    player.currentScore++;
    this.updatePlayerStatus(game);
    return game;
  }

  removePointFromPlayer (game: ClavitoGame, playerId: string): ClavitoGame {
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.currentScore <= 0) return game;

    player.currentScore--;
    this.updatePlayerStatus(game);
    return game;
  }

  removePlayerFromGame (game: ClavitoGame, playerId: string): ClavitoGame {
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return game;

    game.players.splice(playerIndex, 1);
    this.updatePlayerStatus(game);
    return game;
  }

  private updatePlayerStatus (game: ClavitoGame): void {
    // Solo resetear el estado de eliminación, no el pellejo
    game.players.forEach(player => {
      player.isEliminated = false;
    });

    // Solo otorgar pellejo si nunca se ha otorgado antes
    if (!game.pellejoUsed) {
      const firstWithThreePoints = game.players.find(p => p.currentScore === 3);

      if (firstWithThreePoints && !firstWithThreePoints.hasPellejo) {
        firstWithThreePoints.hasPellejo = true;
        game.pellejoUsed = true;
      }
    }

    // Aplicar lógica de eliminación
    game.players.forEach(player => {
      if (player.hasPellejo) {
        if (player.currentScore >= 4) {
          player.isEliminated = true;
        }
      } else {
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
      player.currentScore = 0;
      player.hasPellejo = false;
      player.isEliminated = false;
    });

    game.gamePhase = 'playing';
    game.winner = undefined;
    game.pellejoUsed = false;
    return game;
  }

  getActivePlayers (game: ClavitoGame): ClavitoPlayer[] {
    return game.players.filter(player => !player.isEliminated);
  }

  private generateUUID (): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Método legacy para compatibilidad
  private generateGameId (): string {
    return this.generateUUID();
  }
}

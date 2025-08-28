import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EscobaService } from '../../services/escoba.service';
import { EscobaGame, EscobaScore } from '../../models/escoba.model';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-escoba',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './escoba.component.html',
  styleUrls: ['./escoba.component.css']
})
export class EscobaComponent implements OnInit {
  game: EscobaGame | null = null;
  players: Player[] = [];
  currentRoundScores: { [playerId: string]: Partial<EscobaScore> } = {};
  gameFinished = false;

  constructor (
    private escobaService: EscobaService,
    private playerService: PlayerService,
    private router: Router
  ) { }

  ngOnInit () {
    this.game = this.escobaService.getCurrentGame();
    if (!this.game) {
      this.players = this.playerService.getAllPlayers();
      if (this.players.length === 0) {
        this.router.navigate(['/']);
        return;
      }
      this.startNewGame();
    } else {
      this.players = this.game.players;
    }
    this.initializeCurrentRoundScores();
  }

  startNewGame () {
    if (this.players.length > 0) {
      this.game = this.escobaService.startNewGame(this.players, 3);
    }
  }

  initializeCurrentRoundScores () {
    if (this.game) {
      this.currentRoundScores = {};
      this.game.players.forEach(player => {
        this.currentRoundScores[player.id] = {
          playerId: player.id,
          round: this.game!.currentRound,
          cards: 0,
          coins: 0,
          sevens: 0,
          sevenOfCoins: false,
          escobas: 0,
          total: 0
        };
      });
    }
  }

  calculateScore (playerId: string) {
    const score = this.currentRoundScores[playerId];
    if (score) {
      let total = 0;

      // Punto por tener más cartas (se calculará al final de la ronda)
      total += score.cards || 0;

      // Punto por tener más oros
      total += score.coins || 0;

      // Punto por tener más sietes
      total += score.sevens || 0;

      // Punto por el siete de oros
      if (score.sevenOfCoins) total += 1;

      // Puntos por escobas
      total += score.escobas || 0;

      score.total = total;
    }
  }

  saveRound () {
    if (!this.game) return;

    // Determinar quién tiene más cartas
    let maxCards = 0;
    let playersWithMaxCards: string[] = [];

    Object.values(this.currentRoundScores).forEach(score => {
      if (score.cards! > maxCards) {
        maxCards = score.cards!;
        playersWithMaxCards = [score.playerId!];
      } else if (score.cards === maxCards) {
        playersWithMaxCards.push(score.playerId!);
      }
    });

    // Solo dar punto por más cartas si no hay empate
    if (playersWithMaxCards.length === 1) {
      this.currentRoundScores[playersWithMaxCards[0]].total! += 1;
    }

    // Guardar las puntuaciones
    Object.values(this.currentRoundScores).forEach(score => {
      this.escobaService.addScore(score as EscobaScore);
    });

    // Verificar si el juego ha terminado
    if (this.game.currentRound >= this.game.maxRounds) {
      this.gameFinished = true;
      this.game.gameState = 'finished';
    } else {
      this.game.currentRound++;
      this.initializeCurrentRoundScores();
    }
  }

  getPlayerTotalScore (playerId: string): number {
    if (!this.game) return 0;
    return this.game.scores
      .filter(score => score.playerId === playerId)
      .reduce((total, score) => total + score.total, 0);
  }

  getWinner (): Player | null {
    if (!this.gameFinished || !this.game) return null;

    let maxScore = -1;
    let winner: Player | null = null;

    this.game.players.forEach(player => {
      const totalScore = this.getPlayerTotalScore(player.id);
      if (totalScore > maxScore) {
        maxScore = totalScore;
        winner = player;
      }
    });

    return winner;
  }

  newGame () {
    this.gameFinished = false;
    this.startNewGame();
    this.initializeCurrentRoundScores();
  }

  goHome () {
    this.router.navigate(['/']);
  }
}

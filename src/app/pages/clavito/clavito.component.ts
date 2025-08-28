import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { ClavitoGame, ClavitoPlayer } from '../../models/clavito.model';
import { ClavitoService } from '../../services/clavito.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-clavito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clavito.component.html',
  styleUrls: ['./clavito.component.css']
})
export class ClavitoComponent implements OnInit {
  game?: ClavitoGame;
  players: Player[] = [];
  showInstructions: boolean = false;
  showAddPlayer: boolean = false;
  newPlayerName: string = '';
  availablePlayers: Player[] = [];

  constructor (
    private router: Router,
    private clavitoService: ClavitoService,
    private playerService: PlayerService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.players = navigation.extras.state['players'] || [];
    }
  }

  ngOnInit (): void {
    if (this.players.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.initializeGame();
    this.loadAvailablePlayers();
  }

  initializeGame (): void {
    this.game = this.clavitoService.createGame(this.players);
  }

  loadAvailablePlayers (): void {
    const allPlayers = this.playerService.getAllPlayers();
    this.availablePlayers = allPlayers.filter(player =>
      !this.game?.players.some(gamePlayer => gamePlayer.id === player.id)
    );
  }

  toggleInstructions (): void {
    this.showInstructions = !this.showInstructions;
  }

  toggleAddPlayer (): void {
    this.showAddPlayer = !this.showAddPlayer;
    if (this.showAddPlayer) {
      this.loadAvailablePlayers();
      this.newPlayerName = '';
    }
  }

  addExistingPlayer (player: Player): void {
    if (!this.game) return;

    this.game = this.clavitoService.addPlayerToGame(this.game, player);
    this.loadAvailablePlayers();
    this.showAddPlayer = false;
  }

  addNewPlayer (): void {
    if (!this.game || !this.newPlayerName.trim()) return;

    const newPlayer = this.playerService.addPlayer(this.newPlayerName.trim());
    this.game = this.clavitoService.addPlayerToGame(this.game, newPlayer);
    this.loadAvailablePlayers();
    this.newPlayerName = '';
    this.showAddPlayer = false;
  }

  removePlayer (playerId: string): void {
    if (!this.game) return;

    const player = this.game.players.find(p => p.id === playerId);
    if (!player) return;

    const confirmed = confirm(`¿Estás seguro de que quieres eliminar a ${player.name} del juego?`);
    if (confirmed) {
      this.game = this.clavitoService.removePlayerFromGame(this.game, playerId);
      this.loadAvailablePlayers();
    }
  }

  addPoint (playerId: string): void {
    if (!this.game) return;
    this.game = this.clavitoService.addPointToPlayer(this.game, playerId);
  }

  removePoint (playerId: string): void {
    if (!this.game) return;
    this.game = this.clavitoService.removePointFromPlayer(this.game, playerId);
  }

  getActivePlayers (): ClavitoPlayer[] {
    return this.game ? this.clavitoService.getActivePlayers(this.game) : [];
  }

  getEliminatedPlayers (): ClavitoPlayer[] {
    return this.game ? this.game.players.filter(p => p.isEliminated) : [];
  }

  getScoreArray (player: ClavitoPlayer): number[] {
    const maxPoints = player.hasPellejo ? 4 : 3;
    return Array.from({ length: maxPoints }, (_, i) => i + 1);
  }

  getRomanNumeral (score: number): string {
    const romanNumerals: { [key: number]: string } = {
      0: '○',
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V'
    };
    return romanNumerals[score] || score.toString();
  }

  getScoreLevel (player: ClavitoPlayer): string {
    const score = player.currentScore;
    const maxScore = player.hasPellejo ? 4 : 3;

    if (player.isEliminated) return 'eliminated';
    if (score === 0) return 'safe';
    if (score === 1) return 'warning';
    if (score === 2) return 'danger';
    if (score === 3) {
      return player.hasPellejo ? 'danger' : 'critical';
    }
    if (score >= maxScore) return 'eliminated';

    return 'safe';
  }

  shouldPulse (player: ClavitoPlayer): boolean {
    return player.hasPellejo || player.currentScore >= 3;
  }

  getPlayerInitialScore (): string {
    if (!this.game) return '0';

    const maxScore = Math.max(...this.game.players.map(p => p.currentScore));
    const playerWithMaxScore = this.game.players.find(p => p.currentScore === maxScore);

    if (playerWithMaxScore?.hasPellejo && maxScore >= 3) {
      return `2 (el líder tiene pellejo con ${maxScore} puntos)`;
    }

    return `${maxScore} (igualado con el líder)`;
  }

  resetGame (): void {
    if (!this.game) return;

    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los puntos.')) {
      this.game = this.clavitoService.resetGame(this.game);
    }
  }

  goBack (): void {
    if (this.game?.gamePhase === 'playing') {
      const confirmed = confirm('¿Estás seguro de que quieres salir? Se perderá la partida actual.');
      if (!confirmed) return;
    }

    this.router.navigate(['/']);
  }

  trackByPlayerId (index: number, player: ClavitoPlayer): string {
    return player.id;
  }
}

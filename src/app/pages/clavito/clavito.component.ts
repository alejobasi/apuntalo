import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { ClavitoGame, ClavitoPlayer } from '../../models/clavito.model';
import { ClavitoService } from '../../services/clavito.service';

@Component({
  selector: 'app-clavito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clavito.component.html',
  styleUrls: ['./clavito.component.css']
})
export class ClavitoComponent implements OnInit {
  game?: ClavitoGame;
  players: Player[] = [];
  showInstructions: boolean = false;

  constructor (
    private router: Router,
    private clavitoService: ClavitoService
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
  }

  initializeGame (): void {
    this.game = this.clavitoService.createGame(this.players);
  }

  toggleInstructions (): void {
    this.showInstructions = !this.showInstructions;
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

  // Función para convertir números a números romanos
  getRomanNumeral (score: number): string {
    const romanNumerals: { [key: number]: string } = {
      0: '○',  // Círculo vacío para 0 puntos
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V'  // Por si acaso
    };
    return romanNumerals[score] || score.toString();
  }

  // Función para determinar el nivel de peligro del jugador
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

  // Función para determinar si debe parpadear
  shouldPulse (player: ClavitoPlayer): boolean {
    return player.hasPellejo || player.currentScore >= 3;
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

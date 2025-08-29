import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerStats } from '../../models/player.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  playerStats: PlayerStats[] = [];
  loading = true;
  error: string | null = null;

  constructor (private storageService: StorageService) { }

  async ngOnInit () {
    await this.loadLeaderboard();
  }

  async loadLeaderboard () {
    try {
      this.loading = true;
      this.error = null;
      this.playerStats = await this.storageService.getPlayerStatsFromCloud();
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.error = 'Error al cargar la clasificación';
    } finally {
      this.loading = false;
    }
  }

  // Método para calcular el total de jugadores
  getTotalPlayers (): number {
    return this.playerStats.length;
  }

  // Método para calcular el total de partidas
  getTotalGames (): number {
    return this.playerStats.reduce((sum, player) => sum + player.totalGames, 0);
  }

  getWinPercentageDisplay (percentage: number): string {
    return percentage.toFixed(1) + '%';
  }

  getPositionEmoji (index: number): string {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}º`;
    }
  }

  trackByPlayerId (index: number, player: PlayerStats): string {
    return player.id;
  }
}

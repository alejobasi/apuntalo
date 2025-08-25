import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { GameService } from '../../services/game.service';
import { Player } from '../../models/player.model';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css']
})
export class GameSetupComponent implements OnInit {
  game?: Game;
  selectedPlayers: Player[] = [];
  newPlayerName: string = '';
  playerSuggestions: Player[] = [];
  showSuggestions: boolean = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private gameService: GameService
  ) { }

  ngOnInit (): void {
    const gameId = this.route.snapshot.paramMap.get('gameId');
    if (gameId) {
      this.game = this.gameService.getGameById(gameId);
      if (!this.game) {
        this.router.navigate(['/']);
      }
    }
  }

  onPlayerNameInput (): void {
    const query = this.newPlayerName.trim();
    if (query.length > 0) {
      this.playerSuggestions = this.storageService.getPlayerSuggestions(query)
        .filter(player => !this.selectedPlayers.some(selected => selected.id === player.id));
      this.showSuggestions = this.playerSuggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion (player: Player): void {
    this.addPlayerToGame(player);
    this.clearInput();
  }

  addNewPlayer (): void {
    const name = this.newPlayerName.trim();
    if (name && !this.selectedPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      const player = this.storageService.savePlayer(name);
      this.addPlayerToGame(player);
      this.clearInput();
    }
  }

  private addPlayerToGame (player: Player): void {
    if (!this.selectedPlayers.find(p => p.id === player.id)) {
      this.selectedPlayers.push(player);
    }
  }

  private clearInput (): void {
    this.newPlayerName = '';
    this.showSuggestions = false;
    this.playerSuggestions = [];
  }

  removePlayer (playerId: string): void {
    this.selectedPlayers = this.selectedPlayers.filter(p => p.id !== playerId);
  }

  canStartGame (): boolean {
    return this.selectedPlayers.length >= 2;
  }

  startGame (): void {
    if (this.canStartGame() && this.game) {
      this.router.navigate(['/game', this.game.id], {
        state: { players: this.selectedPlayers }
      });
    }
  }

  goBack (): void {
    this.router.navigate(['/']);
  }

  onClickOutside (): void {
    this.showSuggestions = false;
  }

  // Track by function para mejor performance
  trackByPlayerId (index: number, player: Player): string {
    return player.id;
  }
}

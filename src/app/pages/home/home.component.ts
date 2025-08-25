import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  games: Game[] = [];

  constructor (private gameService: GameService, private router: Router) {
    this.games = this.gameService.getAvailableGames();
  }

  selectGame (gameId: string): void {
    this.router.navigate(['/game', gameId, 'setup']);
  }
}

export class GameHistoryComponent {
  gameHistory: any[] = [];

  constructor(private gameService: GameService) {
    this.loadGameHistory();
  }

  loadGameHistory() {
    this.gameHistory = this.gameService.getGameHistory();
  }
}
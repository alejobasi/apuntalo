export class PlayerListComponent {
  players: string[] = [];
  newPlayerName: string = '';

  addPlayer() {
    if (this.newPlayerName.trim()) {
      this.players.push(this.newPlayerName.trim());
      this.newPlayerName = '';
    }
  }

  removePlayer(index: number) {
    this.players.splice(index, 1);
  }
}
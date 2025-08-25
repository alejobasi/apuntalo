export class ScoreBoardComponent {
  scores: { player: string; score: number }[] = [];

  constructor() {}

  addScore(player: string, score: number) {
    const existingScore = this.scores.find(s => s.player === player);
    if (existingScore) {
      existingScore.score += score;
    } else {
      this.scores.push({ player, score });
    }
  }

  getScores() {
    return this.scores;
  }

  resetScores() {
    this.scores = [];
  }
}
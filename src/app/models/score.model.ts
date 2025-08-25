export interface Score {
  playerId: string;
  playerName: string;
  points: number;
  round: number;
}

export interface RoundScore {
  round: number;
  scores: { [playerId: string]: number };
  timestamp: Date;
}

export interface Player {
  id: string;
  name: string;
  createdAt: Date;
  gamesPlayed: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  totalGames: number;
  totalWins: number;
  winPercentage: number;
  gamesByType: { [gameType: string]: { played: number; wins: number } };
  lastPlayed: Date;
  createdAt: Date;
}

export interface GameResult {
  id: string;
  gameType: string;
  players: string[]; // Array de nombres de jugadores
  winner: string;    // Nombre del ganador
  playedAt: Date;
  duration?: number; // Duración en minutos (opcional)
}

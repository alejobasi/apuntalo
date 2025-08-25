export interface ClavitoPlayer {
  id: string;
  name: string;
  currentScore: number; // Mantener 'currentScore' como está en tu modelo original
  hasPellejo: boolean;
  isEliminated: boolean;
  // Propiedades heredadas de Player (si las necesitas)
  createdAt?: Date;
  gamesPlayed?: number;
}

export interface ClavitoGame {
  id: string;
  players: ClavitoPlayer[];
  gamePhase: 'playing' | 'finished';
  winner?: ClavitoPlayer;
  createdAt: Date;
}

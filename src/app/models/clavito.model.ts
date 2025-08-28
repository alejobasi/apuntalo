export interface ClavitoPlayer {
  id: string;
  name: string;
  currentScore: number;
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
  pellejoUsed: boolean; // Nueva propiedad para rastrear si ya se otorgó el pellejo
  createdAt: Date;
}

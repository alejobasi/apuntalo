import { Player } from './player.model';

export interface ChinchonGame {
  id: string;
  players: Player[];
  currentRound: number;
  maxPoints: number;
  scores: ChinchonScore[];
  gameState: 'setup' | 'playing' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChinchonScore {
  playerId: string;
  round: number;
  points: number;
  totalPoints: number;
  handType: 'chinchon' | 'normal' | 'closed';
}

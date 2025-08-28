import { Player } from './player.model';

export interface EscobaGame {
  id: string;
  players: Player[];
  currentRound: number;
  maxRounds: number;
  scores: EscobaScore[];
  gameState: 'setup' | 'playing' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface EscobaScore {
  playerId: string;
  round: number;
  cards: number;
  coins: number;
  sevens: number;
  sevenOfCoins: boolean;
  escobas: number;
  total: number;
}

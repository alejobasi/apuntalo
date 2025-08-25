import { Player } from './player.model';

export interface Game {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

export interface GameSession {
  id: string;
  gameType: string;
  players: Player[];
  scores: { [playerId: string]: number };
  createdAt: Date;
  completed: boolean;
}

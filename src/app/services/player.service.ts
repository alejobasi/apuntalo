import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor (private storageService: StorageService) { }

  getAllPlayers (): Player[] {
    return this.storageService.getPlayers();
  }

  addPlayer (name: string): Player {
    return this.storageService.savePlayer(name);
  }

  getPlayerSuggestions (query: string): Player[] {
    return this.storageService.getPlayerSuggestions(query);
  }
  private generateUUID (): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

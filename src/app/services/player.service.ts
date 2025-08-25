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
}

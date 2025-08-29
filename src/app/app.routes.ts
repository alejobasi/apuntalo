import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { ClavitoComponent } from './pages/clavito/clavito.component';
import { EscobaComponent } from './pages/escoba/escoba.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'game/:gameId/setup', component: GameSetupComponent },
  { path: 'game/clavito', component: ClavitoComponent },
  { path: 'game/escoba', component: EscobaComponent },
  { path: '**', redirectTo: '' }
];

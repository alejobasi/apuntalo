import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { ClavitoComponent } from './pages/clavito/clavito.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game/:gameId/setup', component: GameSetupComponent },
  { path: 'game/clavito', component: ClavitoComponent },
  { path: '**', redirectTo: '' }
];

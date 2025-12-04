import { Routes } from '@angular/router';
import { RoomJoinComponent } from './components/room-join/room-join.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
  { path: '', component: RoomJoinComponent },
  { path: 'game/:roomId', component: GameComponent },
  { path: '**', redirectTo: '' }
];

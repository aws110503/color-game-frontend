import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ColorGame } from './pages/color-game/color-game';
import { Lobby } from './pages/lobby/lobby';
import { Play } from './pages/play/play';
import { ProfileDashboard } from './pages/profile-dashboard/profile-dashboard';
import { authGuard } from './auth-guard';
import { adminGuard } from './admin-guard';
import { History } from './pages/history/history';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'lobby', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'game', component: ColorGame, canActivate: [authGuard] },
  { path: 'lobby', component: Lobby, canActivate: [authGuard] },
  { path: 'play', component: Play, canActivate: [authGuard] },
  { path: 'profile', component: ProfileDashboard, canActivate: [authGuard] },
  { path: 'history', component: History, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [adminGuard] },
];
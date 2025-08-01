import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canActivate: [authGuard]
  },
  { 
    path: 'assessment', 
    loadChildren: () => import('./assessment/assessment.module').then(m => m.AssessmentModule),
    canActivate: [authGuard]
  },
  { 
    path: 'content', 
    loadChildren: () => import('./content/content.module').then(m => m.ContentModule),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    redirectTo: '/profile',  // Temporary redirect until dashboard is implemented
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '/auth/login' }
];

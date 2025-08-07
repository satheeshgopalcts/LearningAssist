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
    path: 'adaptive-learning', 
    loadChildren: () => import('./adaptive-learning/adaptive-learning.module').then(m => m.AdaptiveLearningModule),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    redirectTo: '/adaptive-learning/dashboard',  // Redirect to adaptive learning dashboard
    pathMatch: 'full'
  },
  { 
    path: 'progress', 
    loadChildren: () => import('./progress-tracking/progress-tracking.module').then(m => m.ProgressTrackingModule),
    canActivate: [authGuard]
  },
  { 
    path: 'career-goals', 
    loadChildren: () => import('./career-goals/career-goals.module').then(m => m.CareerGoalsModule),
    canActivate: [authGuard]
  },
  { 
    path: 'resource-recommendation', 
    loadChildren: () => import('./resource-recommendation/resource-recommendation.module').then(m => m.ResourceRecommendationModule),
    canActivate: [authGuard]
  },
  { 
    path: 'interactive-learning', 
    loadChildren: () => import('./interactive-learning/interactive-learning.module').then(m => m.InteractiveLearningModule),
    canActivate: [authGuard]
  },
  { 
    path: 'assessment-evaluation', 
    loadChildren: () => import('./assessment-evaluation/assessment-evaluation.module').then(m => m.AssessmentEvaluationModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/auth/login' }
];

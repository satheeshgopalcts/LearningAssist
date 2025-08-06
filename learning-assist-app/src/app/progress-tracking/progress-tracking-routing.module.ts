import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgressDashboardComponent } from './components/progress-dashboard/progress-dashboard.component';
import { AchievementDisplayComponent } from './components/achievement-display/achievement-display.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';

const routes: Routes = [
  { 
    path: '', 
    component: ProgressDashboardComponent,
    children: [
      { path: 'achievements', component: AchievementDisplayComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: '', redirectTo: 'achievements', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgressTrackingRoutingModule { }

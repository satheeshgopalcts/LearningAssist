import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProgressTrackingRoutingModule } from './progress-tracking-routing.module';
import { ProgressDashboardComponent } from './components/progress-dashboard/progress-dashboard.component';
import { AchievementDisplayComponent } from './components/achievement-display/achievement-display.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { GoalProgressComponent } from './components/goal-progress/goal-progress.component';
import { BadgeDisplayComponent } from './components/badge-display/badge-display.component';
import { CertificateDisplayComponent } from './components/certificate-display/certificate-display.component';

@NgModule({
  declarations: [
    ProgressDashboardComponent,
    AchievementDisplayComponent,
    LeaderboardComponent,
    AnalyticsComponent,
    GoalProgressComponent,
    BadgeDisplayComponent,
    CertificateDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ProgressTrackingRoutingModule
  ],
  exports: [
    ProgressDashboardComponent,
    AchievementDisplayComponent,
    LeaderboardComponent,
    AnalyticsComponent,
    GoalProgressComponent,
    BadgeDisplayComponent,
    CertificateDisplayComponent
  ]
})
export class ProgressTrackingModule { }

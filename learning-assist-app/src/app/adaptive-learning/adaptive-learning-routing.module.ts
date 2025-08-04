import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdaptiveDashboardComponent } from './components/adaptive-dashboard/adaptive-dashboard.component';
import { LearningPathViewerComponent } from './components/learning-path-viewer/learning-path-viewer.component';
import { RecommendationPanelComponent } from './components/recommendation-panel/recommendation-panel.component';
import { AnalyticsViewComponent } from './components/analytics-view/analytics-view.component';
import { AdaptiveSettingsComponent } from './components/adaptive-settings/adaptive-settings.component';
import { ProgressPredictionComponent } from './components/progress-prediction/progress-prediction.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdaptiveDashboardComponent },
  { path: 'path', component: LearningPathViewerComponent },
  { path: 'recommendations', component: RecommendationPanelComponent },
  { path: 'analytics', component: AnalyticsViewComponent },
  { path: 'settings', component: AdaptiveSettingsComponent },
  { path: 'predictions', component: ProgressPredictionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdaptiveLearningRoutingModule { }

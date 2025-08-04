import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Routing
import { AdaptiveLearningRoutingModule } from './adaptive-learning-routing.module';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { AdaptiveDashboardComponent } from './components/adaptive-dashboard/adaptive-dashboard.component';
import { LearningPathViewerComponent } from './components/learning-path-viewer/learning-path-viewer.component';
import { RecommendationPanelComponent } from './components/recommendation-panel/recommendation-panel.component';
import { AnalyticsViewComponent } from './components/analytics-view/analytics-view.component';
import { AdaptiveSettingsComponent } from './components/adaptive-settings/adaptive-settings.component';
import { ProgressPredictionComponent } from './components/progress-prediction/progress-prediction.component';

@NgModule({
  declarations: [
    AdaptiveDashboardComponent,
    LearningPathViewerComponent,
    RecommendationPanelComponent,
    AnalyticsViewComponent,
    AdaptiveSettingsComponent,
    ProgressPredictionComponent
  ],
  imports: [
    CommonModule,
    AdaptiveLearningRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    MatMenuModule
  ],
  exports: [
    AdaptiveDashboardComponent,
    LearningPathViewerComponent,
    RecommendationPanelComponent,
    AnalyticsViewComponent,
    AdaptiveSettingsComponent,
    ProgressPredictionComponent
  ]
})
export class AdaptiveLearningModule { }

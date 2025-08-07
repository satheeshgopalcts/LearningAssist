import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

// Routing
import { AssessmentEvaluationRoutingModule } from './assessment-evaluation-routing.module';

// Components
import { AdaptiveTestingComponent } from './components/adaptive-testing/adaptive-testing.component';
import { AutomatedGradingComponent } from './components/automated-grading/automated-grading.component';
import { PerformanceAnalyticsComponent } from './components/performance-analytics/performance-analytics.component';

// Services
import { AssessmentEvaluationService } from './assessment-evaluation.service';

@NgModule({
  imports: [
    // Core modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Routing
    AssessmentEvaluationRoutingModule,
    
    // Angular Material modules
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSliderModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
    
    // Standalone components
    AdaptiveTestingComponent,
    AutomatedGradingComponent,
    PerformanceAnalyticsComponent
  ],
  providers: [
    AssessmentEvaluationService
  ]
})
export class AssessmentEvaluationModule { }

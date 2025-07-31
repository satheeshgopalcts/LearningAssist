import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { LearningStyleQuizComponent } from './learning-style-quiz/learning-style-quiz.component';
import { AiProfilingComponent } from './ai-profiling/ai-profiling.component';
import { SkillGapAnalysisComponent } from './skill-gap-analysis/skill-gap-analysis.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AssessmentRoutingModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
    MatSliderModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    
    // Components (since they're standalone)
    LearningStyleQuizComponent,
    AiProfilingComponent,
    SkillGapAnalysisComponent
  ]
})
export class AssessmentModule { }

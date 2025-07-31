import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearningStyleQuizComponent } from './learning-style-quiz/learning-style-quiz.component';
import { AiProfilingComponent } from './ai-profiling/ai-profiling.component';
import { SkillGapAnalysisComponent } from './skill-gap-analysis/skill-gap-analysis.component';

const routes: Routes = [
  { path: '', redirectTo: 'learning-style-quiz', pathMatch: 'full' },
  { path: 'learning-style-quiz', component: LearningStyleQuizComponent },
  { path: 'ai-profiling', component: AiProfilingComponent },
  { path: 'skill-gap-analysis', component: SkillGapAnalysisComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule { }

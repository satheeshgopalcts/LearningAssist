import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CareerGoalsRoutingModule } from './career-goals-routing.module';
import { CareerDashboardComponent } from './components/career-dashboard/career-dashboard.component';
import { CareerPathBrowserComponent } from './components/career-path-browser/career-path-browser.component';
import { SkillMatrixComponent } from './components/skill-matrix/skill-matrix.component';
import { GoalSettingComponent } from './components/goal-setting/goal-setting.component';
import { GoalTrackingComponent } from './components/goal-tracking/goal-tracking.component';
import { MarketInsightsComponent } from './components/market-insights/market-insights.component';
import { SkillAssessmentComponent } from './components/skill-assessment/skill-assessment.component';
import { CareerGoalsService } from './career-goals.service';

@NgModule({
  declarations: [
    CareerDashboardComponent,
    CareerPathBrowserComponent,
    SkillMatrixComponent,
    GoalSettingComponent,
    GoalTrackingComponent,
    MarketInsightsComponent,
    SkillAssessmentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CareerGoalsRoutingModule
  ],
  providers: [
    CareerGoalsService
  ]
})
export class CareerGoalsModule { }

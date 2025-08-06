import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CareerDashboardComponent } from './components/career-dashboard/career-dashboard.component';
import { CareerPathBrowserComponent } from './components/career-path-browser/career-path-browser.component';
import { SkillMatrixComponent } from './components/skill-matrix/skill-matrix.component';
import { GoalSettingComponent } from './components/goal-setting/goal-setting.component';
import { GoalTrackingComponent } from './components/goal-tracking/goal-tracking.component';
import { MarketInsightsComponent } from './components/market-insights/market-insights.component';
import { SkillAssessmentComponent } from './components/skill-assessment/skill-assessment.component';

const routes: Routes = [
  { path: '', component: CareerDashboardComponent },
  { path: 'dashboard', component: CareerDashboardComponent },
  { path: 'career-paths', component: CareerPathBrowserComponent },
  { path: 'skill-matrix', component: SkillMatrixComponent },
  { path: 'goal-setting', component: GoalSettingComponent },
  { path: 'goal-tracking', component: GoalTrackingComponent },
  { path: 'market-insights', component: MarketInsightsComponent },
  { path: 'skill-assessment', component: SkillAssessmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CareerGoalsRoutingModule { }

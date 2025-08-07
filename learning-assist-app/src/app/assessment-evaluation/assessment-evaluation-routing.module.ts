import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AdaptiveTestingComponent } from './components/adaptive-testing/adaptive-testing.component';
import { AutomatedGradingComponent } from './components/automated-grading/automated-grading.component';
import { PerformanceAnalyticsComponent } from './components/performance-analytics/performance-analytics.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'adaptive-testing',
        component: AdaptiveTestingComponent,
        title: 'Adaptive Testing Engine'
      },
      {
        path: 'automated-grading',
        component: AutomatedGradingComponent,
        title: 'Automated Grading System'
      },
      {
        path: 'performance-analytics',
        component: PerformanceAnalyticsComponent,
        title: 'Performance Analytics'
      },
      {
        path: '',
        redirectTo: 'adaptive-testing',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentEvaluationRoutingModule { }

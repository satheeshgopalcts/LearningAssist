import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveLearningService } from '../../adaptive-learning.service';
import { ProgressPrediction, RiskFactor, InterventionRecommendation } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-progress-prediction',
  templateUrl: './progress-prediction.component.html',
  styleUrls: ['./progress-prediction.component.scss']
})
export class ProgressPredictionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  prediction: ProgressPrediction | null = null;

  constructor(private adaptiveService: AdaptiveLearningService) {}

  ngOnInit(): void {
    this.loadPrediction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPrediction(): void {
    this.adaptiveService.predictLearningProgress('current-user', 'current-course')
      .pipe(takeUntil(this.destroy$))
      .subscribe((prediction: ProgressPrediction) => {
        this.prediction = prediction;
      });
  }

  getRiskColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'low': return 'primary';
      case 'medium': return 'accent';
      case 'high': return 'warn';
      case 'critical': return 'warn';
      default: return 'primary';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'primary';
      case 'medium': return 'accent';
      case 'high': return 'warn';
      case 'urgent': return 'warn';  
      default: return 'primary';
    }
  }
}

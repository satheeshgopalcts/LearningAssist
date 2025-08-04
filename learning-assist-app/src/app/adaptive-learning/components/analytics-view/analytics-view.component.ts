import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveLearningService } from '../../adaptive-learning.service';
import { LearningAnalytics, DifficultyTrend } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-analytics-view',
  templateUrl: './analytics-view.component.html',
  styleUrls: ['./analytics-view.component.scss']
})
export class AnalyticsViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  analytics: LearningAnalytics | null = null;
  
  constructor(private adaptiveService: AdaptiveLearningService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnalytics(): void {
    this.adaptiveService.getLearningAnalytics('current-user')
      .pipe(takeUntil(this.destroy$))
      .subscribe((analytics: LearningAnalytics) => {
        this.analytics = analytics;
      });
  }

  getEngagementLevel(rate: number): string {
    if (rate >= 0.8) return 'Excellent';
    if (rate >= 0.6) return 'Good';
    if (rate >= 0.4) return 'Fair';
    return 'Needs Improvement';
  }

  getEngagementColor(rate: number): string {
    if (rate >= 0.8) return 'primary';
    if (rate >= 0.6) return 'accent';
    if (rate >= 0.4) return 'warn';
    return 'warn';
  }
}

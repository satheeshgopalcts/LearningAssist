import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveLearningService } from '../../adaptive-learning.service';
import { LearningPath, ContentRecommendation, LearningAnalytics, LearningStep } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-adaptive-dashboard',
  templateUrl: './adaptive-dashboard.component.html',
  styleUrls: ['./adaptive-dashboard.component.scss']
})
export class AdaptiveDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentPath: LearningPath | null = null;
  recommendations: ContentRecommendation[] = [];
  analytics: LearningAnalytics | null = null;
  activeSteps: LearningStep[] = [];
  completedSteps: LearningStep[] = [];
  upcomingSteps: LearningStep[] = [];
  
  // Dashboard stats
  overallProgress = 0;
  estimatedCompletion = '';
  currentStreak = 0;
  weeklyGoalProgress = 0;
  
  constructor(
    private adaptiveService: AdaptiveLearningService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Load current learning path
    this.adaptiveService.getCurrentLearningPath()
      .pipe(takeUntil(this.destroy$))
      .subscribe((path: LearningPath | null) => {
        this.currentPath = path;
        if (path) {
          this.processPathSteps(path);
          this.calculateProgress(path);
        }
      });

    // Load recommendations
    this.adaptiveService.getRecommendations(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe((recommendations: ContentRecommendation[]) => {
        this.recommendations = recommendations;
      });

    // Load analytics
    this.adaptiveService.getLearningAnalytics('current-user') // TODO: Get actual user ID
      .pipe(takeUntil(this.destroy$))
      .subscribe((analytics: LearningAnalytics) => {
        this.analytics = analytics;
        if (analytics) {
          this.updateDashboardStats(analytics);
        }
      });
  }

  private processPathSteps(path: LearningPath): void {
    this.activeSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'active');
    this.completedSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'completed');
    this.upcomingSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'pending').slice(0, 3);
  }

  private calculateProgress(path: LearningPath): void {
    const totalSteps = path.courseSequence.length;
    const completedSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'completed').length;
    this.overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Estimate completion time based on current pace
    const remainingSteps = totalSteps - completedSteps;
    if (remainingSteps > 0 && this.analytics) {
      const avgTimePerStep = this.analytics.averageSessionDuration;
      const estimatedHours = remainingSteps * (avgTimePerStep / 60);
      this.estimatedCompletion = this.formatEstimatedTime(estimatedHours);
    }
  }

  private updateDashboardStats(analytics: LearningAnalytics): void {
    this.currentStreak = analytics.streakDays;
    this.weeklyGoalProgress = Math.min(100, (analytics.weeklyLearningHours / 10) * 100); // Assuming 10h weekly goal
  }

  private formatEstimatedTime(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours)} hours`;
    } else {
      const days = Math.round(hours / 24);
      return `${days} days`;
    }
  }

  onStepClick(step: LearningStep): void {
    if (step.status === 'active' || step.status === 'completed') {
      // Navigate to the specific content
      this.router.navigate(['/content', step.contentId]);
    }
  }

  onRecommendationClick(recommendation: ContentRecommendation): void {
    // Track interaction and navigate
    this.adaptiveService.trackRecommendationInteraction(recommendation.id, 'clicked');
    this.router.navigate(['/content', recommendation.contentId]);
  }

  onStartLearning(): void {
    if (this.activeSteps.length > 0) {
      const nextStep = this.activeSteps[0];
      this.router.navigate(['/content', nextStep.contentId]);
    } else if (this.recommendations.length > 0) {
      const topRecommendation = this.recommendations[0];
      this.onRecommendationClick(topRecommendation);
    }
  }

  onViewFullPath(): void {
    this.router.navigate(['/adaptive-learning/path']);
  }

  onViewAnalytics(): void {
    this.router.navigate(['/adaptive-learning/analytics']);
  }

  onManageSettings(): void {
    this.router.navigate(['/adaptive-learning/settings']);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'primary';
      case 'intermediate': return 'accent';
      case 'advanced': return 'warn';
      default: return 'primary';
    }
  }

  getConfidenceIcon(confidence: number): string {
    if (confidence >= 0.8) return 'thumb_up';
    if (confidence >= 0.6) return 'thumbs_up_down';
    return 'thumb_down';
  }
}

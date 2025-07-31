import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AssessmentService } from '../assessment.service';
import { 
  UserProfile, 
  BehaviorPattern, 
  AIRecommendation,
  LearningStyleAssessment 
} from '../../models/assessment.model';

@Component({
  selector: 'app-ai-profiling',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './ai-profiling.component.html',
  styleUrls: ['./ai-profiling.component.scss']
})
export class AiProfilingComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  latestAssessment: LearningStyleAssessment | null = null;
  recommendations: AIRecommendation[] = [];
  isLoading = false;
  isGeneratingProfile = false;
  private destroy$ = new Subject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadLatestAssessment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.assessmentService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile || this.createDefaultProfile();
          this.generateRecommendations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.userProfile = this.createDefaultProfile();
          this.isLoading = false;
        }
      });
  }

  loadLatestAssessment(): void {
    // In a real app, get the actual user ID from auth service
    const userId = 'current-user';
    
    this.assessmentService.getLatestAssessment(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assessment) => {
          this.latestAssessment = assessment;
          this.generateRecommendations();
        },
        error: (error) => {
          console.error('Error loading latest assessment:', error);
        }
      });
  }

  generateRecommendations(): void {
    if (this.userProfile) {
      this.assessmentService.generateRecommendations(this.userProfile, this.latestAssessment)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (recommendations) => {
            this.recommendations = recommendations;
          },
          error: (error) => {
            console.error('Error generating recommendations:', error);
          }
        });
    }
  }

  simulateProfileGeneration(): void {
    this.isGeneratingProfile = true;
    
    // Simulate AI analysis
    setTimeout(() => {
      const newProfile = this.generateMockProfile();
      this.assessmentService.updateUserProfile(newProfile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            this.userProfile = profile;
            this.generateRecommendations();
            this.isGeneratingProfile = false;
            this.snackBar.open('AI profile updated successfully!', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.isGeneratingProfile = false;
            this.snackBar.open('Error updating AI profile', 'Close', { duration: 3000 });
          }
        });
    }, 2000);
  }

  private createDefaultProfile(): UserProfile {
    return {
      learningSpeed: 5,
      engagementLevel: 6,
      knowledgeRetention: 75,
      behaviorPatterns: [],
      lastUpdated: new Date()
    };
  }

  private generateMockProfile(): UserProfile {
    const patterns: BehaviorPattern[] = [
      {
        pattern: 'Prefers morning study sessions',
        frequency: 8,
        impact: 7.5,
        category: 'timing'
      },
      {
        pattern: 'Completes exercises quickly',
        frequency: 6,
        impact: 6.0,
        category: 'completion'
      },
      {
        pattern: 'Frequently reviews previous content',
        frequency: 7,
        impact: 8.0,
        category: 'content-interaction'
      },
      {
        pattern: 'Uses multiple tabs while learning',
        frequency: 9,
        impact: 5.5,
        category: 'navigation'
      }
    ];

    return {
      learningSpeed: Math.floor(Math.random() * 4) + 6, // 6-10
      engagementLevel: Math.floor(Math.random() * 3) + 7, // 7-10
      knowledgeRetention: Math.floor(Math.random() * 20) + 75, // 75-95
      behaviorPatterns: patterns,
      lastUpdated: new Date()
    };
  }

  getEngagementLevelText(): string {
    if (!this.userProfile) return 'Unknown';
    
    const level = this.userProfile.engagementLevel;
    if (level >= 8) return 'Highly Engaged';
    if (level >= 6) return 'Moderately Engaged';
    if (level >= 4) return 'Somewhat Engaged';
    return 'Needs Improvement';
  }

  getLearningSpeedText(): string {
    if (!this.userProfile) return 'Unknown';
    
    const speed = this.userProfile.learningSpeed;
    if (speed >= 8) return 'Very Fast';
    if (speed >= 6) return 'Fast';
    if (speed >= 4) return 'Moderate';
    return 'Slow';
  }

  getRetentionLevelText(): string {
    if (!this.userProfile) return 'Unknown';
    
    const retention = this.userProfile.knowledgeRetention;
    if (retention >= 90) return 'Excellent';
    if (retention >= 80) return 'Good';
    if (retention >= 70) return 'Average';
    return 'Needs Improvement';
  }

  getScoreColor(score: number, maxScore: number = 10): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  getRetentionColor(retention: number): string {
    if (retention >= 85) return '#4caf50'; // Green
    if (retention >= 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  getBehaviorPatternIcon(category: string): string {
    switch (category) {
      case 'timing': return 'schedule';
      case 'completion': return 'task_alt';
      case 'content-interaction': return 'touch_app';
      case 'navigation': return 'explore';
      default: return 'analytics';
    }
  }

  getBehaviorPatternColor(impact: number): string {
    if (impact >= 7) return '#4caf50'; // High impact - Green
    if (impact >= 5) return '#ff9800'; // Medium impact - Orange
    return '#2196f3'; // Low impact - Blue
  }

  getRecommendationIcon(type: string): string {
    switch (type) {
      case 'content': return 'library_books';
      case 'learning-path': return 'map';
      case 'study-method': return 'school';
      case 'schedule': return 'event';
      default: return 'lightbulb';
    }
  }

  getRecommendationColor(priority: number): string {
    if (priority >= 8) return '#f44336'; // High priority - Red
    if (priority >= 6) return '#ff9800'; // Medium priority - Orange
    return '#4caf50'; // Low priority - Green
  }

  formatConfidence(confidence: number): string {
    return Math.round(confidence * 100) + '%';
  }

  trackBehavior(pattern: string, category: string): void {
    const behaviorPattern: BehaviorPattern = {
      pattern,
      frequency: 1,
      impact: 5,
      category: category as any
    };
    
    this.assessmentService.trackBehavior(behaviorPattern);
    this.snackBar.open('Behavior tracked for AI learning', 'Close', { duration: 2000 });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { AssessmentEvaluationService } from '../../assessment-evaluation.service';
import { ReplacePipe } from '../../pipes/replace.pipe';
import {
  PerformanceAnalytics,
  BenchmarkData,
  StrengthLevel,
  RecommendationType,
  RecommendationPriority,
  ComparisonGroup
} from '../../../models/assessment-evaluation.model';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    ReplacePipe
  ],
  templateUrl: './performance-analytics.component.html',
  styleUrls: ['./performance-analytics.component.scss']
})
export class PerformanceAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Public enums for template access
  StrengthLevel = StrengthLevel;
  RecommendationType = RecommendationType;
  RecommendationPriority = RecommendationPriority;
  ComparisonGroup = ComparisonGroup;

  // Component state
  performanceData: PerformanceAnalytics | null = null;
  benchmarkData: BenchmarkData[] = [];
  selectedUserId = 'current-user';
  selectedTestId = 'all';
  isLoading = false;

  // Filter form
  filterForm: FormGroup;

  // Available options
  testOptions = [
    { value: 'all', label: 'All Tests' },
    { value: '1', label: 'JavaScript Fundamentals' },
    { value: '2', label: 'Data Structures & Algorithms' }
  ];

  categories = ['Algorithms', 'Data Structures', 'System Design', 'Programming Languages', 'Software Engineering'];

  constructor(
    private assessmentService: AssessmentEvaluationService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadPerformanceData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      userId: [this.selectedUserId],
      testId: [this.selectedTestId]
    });
  }

  loadPerformanceData(): void {
    this.isLoading = true;
    
    const performanceRequest = this.assessmentService.getPerformanceAnalytics(
      this.selectedUserId, 
      this.selectedTestId === 'all' ? undefined : this.selectedTestId
    );

    const benchmarkRequests = this.categories.map(category =>
      this.assessmentService.getBenchmarkData(this.selectedUserId, category)
    );

    forkJoin({
      performance: performanceRequest,
      benchmarks: forkJoin(benchmarkRequests)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.performanceData = data.performance;
        this.benchmarkData = data.benchmarks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading performance data:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    this.selectedUserId = formValue.userId;
    this.selectedTestId = formValue.testId;
    this.loadPerformanceData();
  }

  getStrengthColor(level: StrengthLevel): string {
    const colors = {
      [StrengthLevel.WEAK]: '#f44336',
      [StrengthLevel.DEVELOPING]: '#ff9800',
      [StrengthLevel.PROFICIENT]: '#2196f3',
      [StrengthLevel.ADVANCED]: '#4caf50',
      [StrengthLevel.MASTERY]: '#9c27b0'
    };
    return colors[level] || '#666';
  }

  getStrengthIcon(level: StrengthLevel): string {
    const icons = {
      [StrengthLevel.WEAK]: 'trending_down',
      [StrengthLevel.DEVELOPING]: 'trending_flat',
      [StrengthLevel.PROFICIENT]: 'trending_up',
      [StrengthLevel.ADVANCED]: 'star',
      [StrengthLevel.MASTERY]: 'emoji_events'
    };
    return icons[level] || 'help';
  }

  getPriorityColor(priority: RecommendationPriority): string {
    const colors = {
      [RecommendationPriority.LOW]: '#4caf50',
      [RecommendationPriority.MEDIUM]: '#ff9800',
      [RecommendationPriority.HIGH]: '#f44336',
      [RecommendationPriority.CRITICAL]: '#9c27b0'
    };
    return colors[priority] || '#666';
  }

  getRecommendationIcon(type: RecommendationType): string {
    const icons = {
      [RecommendationType.STUDY_FOCUS]: 'school',
      [RecommendationType.PRACTICE_MORE]: 'fitness_center',
      [RecommendationType.REVIEW_BASICS]: 'replay',
      [RecommendationType.ADVANCED_TOPICS]: 'rocket_launch',
      [RecommendationType.TIME_MANAGEMENT]: 'schedule',
      [RecommendationType.TEST_STRATEGIES]: 'psychology'
    };
    return icons[type] || 'lightbulb';
  }

  getBenchmarkIcon(comparison: ComparisonGroup): string {
    const icons = {
      [ComparisonGroup.ALL_USERS]: 'groups',
      [ComparisonGroup.SAME_LEVEL]: 'equalizer',
      [ComparisonGroup.SAME_INSTITUTION]: 'business',
      [ComparisonGroup.INDUSTRY_PEERS]: 'work',
      [ComparisonGroup.CERTIFICATION_CANDIDATES]: 'verified'
    };
    return icons[comparison] || 'people';
  }

  getPercentileColor(percentile: number): string {
    if (percentile >= 90) return '#4caf50';
    if (percentile >= 75) return '#8bc34a';
    if (percentile >= 50) return '#ff9800';
    if (percentile >= 25) return '#ff5722';
    return '#f44336';
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  }

  getOverallGrade(): string {
    if (!this.performanceData) return 'N/A';
    
    const percentage = this.performanceData.overallScore;
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  }

  trackByCategory(index: number, item: any): string {
    return item.category;
  }

  trackByRecommendationTitle(index: number, item: any): string {
    return item.title;
  }

  trackByBenchmarkCategory(index: number, item: BenchmarkData): string {
    return item.category;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveLearningService } from '../../adaptive-learning.service';
import { LearningPath, LearningStep, DifficultyLevel } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-learning-path-viewer',
  templateUrl: './learning-path-viewer.component.html',
  styleUrls: ['./learning-path-viewer.component.scss']
})
export class LearningPathViewerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  learningPaths: LearningPath[] = [];
  selectedPath: LearningPath | null = null;
  completedSteps: LearningStep[] = [];
  activeSteps: LearningStep[] = [];
  upcomingSteps: LearningStep[] = [];
  
  constructor(
    private adaptiveService: AdaptiveLearningService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLearningPaths();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLearningPaths(): void {
    this.adaptiveService.learningPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe((paths: LearningPath[]) => {
        this.learningPaths = paths;
        if (paths.length > 0 && !this.selectedPath) {
          this.selectPath(paths[0]);
        }
      });
  }

  selectPath(path: LearningPath): void {
    this.selectedPath = path;
    this.categorizeSteps(path);
  }

  private categorizeSteps(path: LearningPath): void {
    this.completedSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'completed');
    this.activeSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'active');
    this.upcomingSteps = path.courseSequence.filter((step: LearningStep) => step.status === 'pending');
  }

  onStepClick(step: LearningStep): void {
    if (step.status === 'active' || step.status === 'completed') {
      this.router.navigate(['/content', step.contentId]);
    }
  }

  getDifficultyColor(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER: return 'primary';
      case DifficultyLevel.INTERMEDIATE: return 'accent';
      case DifficultyLevel.ADVANCED: return 'warn';
      case DifficultyLevel.EXPERT: return 'warn';
      default: return 'primary';
    }
  }

  getStepIcon(step: LearningStep): string {
    switch (step.type) {
      case 'lesson': return 'school';
      case 'quiz': return 'quiz';
      case 'assignment': return 'assignment';
      case 'project': return 'work';
      case 'assessment': return 'assessment';
      default: return 'article';
    }
  }

  getStepProgress(path: LearningPath): number {
    const total = path.courseSequence.length;
    const completed = this.completedSteps.length;
    return total > 0 ? (completed / total) * 100 : 0;
  }

  onGoToDashboard(): void {
    this.router.navigate(['/adaptive-learning/dashboard']);
  }
}

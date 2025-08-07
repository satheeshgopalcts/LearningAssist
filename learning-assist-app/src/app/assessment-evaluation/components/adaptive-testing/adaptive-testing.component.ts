import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';

import { AssessmentEvaluationService } from '../../assessment-evaluation.service';
import { ReplacePipe } from '../../pipes/replace.pipe';
import {
  AdaptiveTest,
  TestSession,
  Question,
  TestResponse,
  DifficultyLevel,
  QuestionType,
  TestStatus
} from '../../../models/assessment-evaluation.model';

@Component({
  selector: 'app-adaptive-testing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    ReplacePipe
  ],
  templateUrl: './adaptive-testing.component.html',
  styleUrls: ['./adaptive-testing.component.scss']
})
export class AdaptiveTestingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;

  // Public properties for template access
  DifficultyLevel = DifficultyLevel;
  QuestionType = QuestionType;
  TestStatus = TestStatus;

  // Component state
  adaptiveTests: AdaptiveTest[] = [];
  currentSession: TestSession | null = null;
  currentQuestion: Question | null = null;
  selectedTest: AdaptiveTest | null = null;
  isTestInProgress = false;
  isLoading = false;

  // Form controls
  testSelectionForm: FormGroup;
  responseForm: FormGroup;

  // Test progress
  questionNumber = 0;
  estimatedProgress = 0;
  timeRemaining = 0;
  totalTimeSpent = 0;

  // UI state
  showInstructions = false;
  showResults = false;
  testResults: any = null;

  constructor(
    private assessmentService: AssessmentEvaluationService,
    private fb: FormBuilder
  ) {
    this.testSelectionForm = this.createTestSelectionForm();
    this.responseForm = this.createResponseForm();
  }

  ngOnInit(): void {
    this.loadAdaptiveTests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
  }

  private createTestSelectionForm(): FormGroup {
    return this.fb.group({
      selectedTestId: ['', [Validators.required]]
    });
  }

  private createResponseForm(): FormGroup {
    return this.fb.group({
      answer: ['', [Validators.required]],
      confidence: [3]
    });
  }

  loadAdaptiveTests(): void {
    this.isLoading = true;
    this.assessmentService.getAdaptiveTests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tests) => {
          this.adaptiveTests = tests;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading adaptive tests:', error);
          this.isLoading = false;
        }
      });
  }

  selectTest(testId: string): void {
    this.selectedTest = this.adaptiveTests.find(test => test.id === testId) || null;
    this.showInstructions = true;
  }

  startTest(): void {
    if (!this.selectedTest) return;

    this.isLoading = true;
    this.assessmentService.startAdaptiveTest(this.selectedTest.id, 'current-user')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          this.currentSession = session;
          this.isTestInProgress = true;
          this.showInstructions = false;
          this.questionNumber = 0;
          this.totalTimeSpent = 0;
          this.loadNextQuestion();
          this.startTimer();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error starting test:', error);
          this.isLoading = false;
        }
      });
  }

  loadNextQuestion(): void {
    if (!this.currentSession) return;

    this.isLoading = true;
    this.assessmentService.getNextQuestion(this.currentSession.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (question) => {
          if (question) {
            this.currentQuestion = question;
            this.questionNumber++;
            this.responseForm.reset();
            this.responseForm.patchValue({ confidence: 3 });
            this.calculateProgress();
          } else {
            this.completeTest();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading next question:', error);
          this.isLoading = false;
        }
      });
  }

  submitResponse(): void {
    if (!this.currentSession || !this.currentQuestion || this.responseForm.invalid) return;

    const formValue = this.responseForm.value;
    const response: TestResponse = {
      questionId: this.currentQuestion.id,
      answer: formValue.answer,
      timeSpent: this.getQuestionTimeSpent(),
      timestamp: new Date(),
      confidence: formValue.confidence / 5, // Convert to 0-1 scale
      flaggedForReview: false
    };

    this.isLoading = true;
    this.assessmentService.submitResponse(this.currentSession.id, response)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.totalTimeSpent += response.timeSpent;
          this.checkTestCompletion();
        },
        error: (error) => {
          console.error('Error submitting response:', error);
          this.isLoading = false;
        }
      });
  }

  checkTestCompletion(): void {
    if (!this.selectedTest || !this.currentSession) return;

    // Check termination criteria
    const shouldTerminate = 
      this.questionNumber >= this.selectedTest.maxQuestions ||
      (this.questionNumber >= this.selectedTest.minQuestions && this.currentSession.standardError < 0.3);

    if (shouldTerminate) {
      this.completeTest();
    } else {
      this.loadNextQuestion();
    }
  }

  completeTest(): void {
    if (!this.currentSession) return;

    this.isLoading = true;
    this.stopTimer();
    
    this.assessmentService.completeTest(this.currentSession.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (completedSession) => {
          this.currentSession = completedSession;
          this.testResults = completedSession.score;
          this.isTestInProgress = false;
          this.showResults = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error completing test:', error);
          this.isLoading = false;
        }
      });
  }

  retakeTest(): void {
    this.resetTestState();
    this.startTest();
  }

  selectNewTest(): void {
    this.resetTestState();
    this.selectedTest = null;
    this.showInstructions = false;
    this.showResults = false;
  }

  private resetTestState(): void {
    this.currentSession = null;
    this.currentQuestion = null;
    this.isTestInProgress = false;
    this.questionNumber = 0;
    this.estimatedProgress = 0;
    this.timeRemaining = 0;
    this.totalTimeSpent = 0;
    this.testResults = null;
    this.responseForm.reset();
    this.stopTimer();
  }

  private startTimer(): void {
    if (this.selectedTest?.timeLimit) {
      this.timeRemaining = this.selectedTest.timeLimit;
      this.timerSubscription = interval(1000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.timeRemaining--;
          if (this.timeRemaining <= 0) {
            this.completeTest();
          }
        });
    }
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  private getQuestionTimeSpent(): number {
    // In a real implementation, this would track actual time spent on the question
    return Math.floor(Math.random() * 120) + 30; // 30-150 seconds
  }

  private calculateProgress(): void {
    if (!this.selectedTest) return;
    
    const minQuestions = this.selectedTest.minQuestions;
    const maxQuestions = this.selectedTest.maxQuestions;
    
    if (this.questionNumber <= minQuestions) {
      this.estimatedProgress = (this.questionNumber / minQuestions) * 60;
    } else {
      const remaining = maxQuestions - minQuestions;
      const completed = this.questionNumber - minQuestions;
      this.estimatedProgress = 60 + (completed / remaining) * 40;
    }
  }

  // Helper methods for templates
  getDifficultyIcon(difficulty: DifficultyLevel): string {
    const icons = {
      [DifficultyLevel.BEGINNER]: 'star_border',
      [DifficultyLevel.INTERMEDIATE]: 'star_half',
      [DifficultyLevel.ADVANCED]: 'star',
      [DifficultyLevel.EXPERT]: 'star_purple500'
    };
    return icons[difficulty] || 'help';
  }

  getDifficultyColor(difficulty: DifficultyLevel): string {
    const colors = {
      [DifficultyLevel.BEGINNER]: 'green',
      [DifficultyLevel.INTERMEDIATE]: 'orange',
      [DifficultyLevel.ADVANCED]: 'red',
      [DifficultyLevel.EXPERT]: 'purple'
    };
    return colors[difficulty] || 'gray';
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  getPassingStatusColor(status: string): string {
    const colors = {
      'pass': 'green',
      'fail': 'red',
      'conditional_pass': 'orange',
      'under_review': 'blue'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  trackByTestId(index: number, test: AdaptiveTest): string {
    return test.id;
  }

  trackByOptionId(index: number, option: any): string {
    return option.id;
  }
}

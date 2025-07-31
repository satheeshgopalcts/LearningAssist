import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AssessmentService } from '../assessment.service';
import { 
  LearningStyleQuestion, 
  LearningStyleResult, 
  LearningStyleAssessment,
  LearningStyleType 
} from '../../models/assessment.model';

@Component({
  selector: 'app-learning-style-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './learning-style-quiz.component.html',
  styleUrls: ['./learning-style-quiz.component.scss']
})
export class LearningStyleQuizComponent implements OnInit {
  questions: LearningStyleQuestion[] = [];
  currentQuestionIndex = 0;
  quizForm: FormGroup;
  isLoading = false;
  isCompleted = false;
  result: LearningStyleResult | null = null;
  Math = Math; // Expose Math to template
  
  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.quizForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.assessmentService.getLearningStyleQuestions().subscribe({
      next: (questions) => {
        this.questions = questions;
        this.initializeForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.snackBar.open('Error loading quiz questions', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  initializeForm(): void {
    const formControls: { [key: string]: any } = {};
    this.questions.forEach(question => {
      formControls[`question_${question.id}`] = ['', Validators.required];
    });
    this.quizForm = this.fb.group(formControls);
  }

  get currentQuestion(): LearningStyleQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  getCurrentAnswer(): string | null {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return null;
    
    return this.quizForm.get(`question_${currentQuestion.id}`)?.value || null;
  }

  isCurrentQuestionAnswered(): boolean {
    return this.getCurrentAnswer() !== null && this.getCurrentAnswer() !== '';
  }

  submitQuiz(): void {
    if (this.quizForm.invalid) {
      this.snackBar.open('Please answer all questions before submitting', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    
    // Convert form values to answers format
    const answers: { [questionId: number]: string } = {};
    this.questions.forEach(question => {
      const formValue = this.quizForm.get(`question_${question.id}`)?.value;
      if (formValue) {
        answers[question.id] = formValue;
      }
    });

    // Calculate results
    this.assessmentService.calculateLearningStyleResult(answers).subscribe({
      next: (result) => {
        this.result = result;
        
        // Save assessment
        const assessment: LearningStyleAssessment = {
          userId: 'current-user', // This should come from auth service
          answers,
          result,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.assessmentService.saveAssessment(assessment).subscribe({
          next: () => {
            this.isCompleted = true;
            this.isLoading = false;
            this.snackBar.open('Assessment completed successfully!', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error saving assessment:', error);
            this.snackBar.open('Assessment completed but could not be saved', 'Close', { duration: 3000 });
            this.isCompleted = true;
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error calculating results:', error);
        this.snackBar.open('Error calculating results', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  retakeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.isCompleted = false;
    this.result = null;
    this.quizForm.reset();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getLearningStyleIcon(style: LearningStyleType): string {
    switch (style) {
      case LearningStyleType.VISUAL:
        return 'visibility';
      case LearningStyleType.AUDITORY:
        return 'hearing';
      case LearningStyleType.KINESTHETIC:
        return 'pan_tool';
      case LearningStyleType.READING_WRITING:
        return 'edit';
      default:
        return 'help';
    }
  }

  getLearningStyleColor(style: LearningStyleType): string {
    switch (style) {
      case LearningStyleType.VISUAL:
        return '#2196F3'; // Blue
      case LearningStyleType.AUDITORY:
        return '#4CAF50'; // Green
      case LearningStyleType.KINESTHETIC:
        return '#FF9800'; // Orange
      case LearningStyleType.READING_WRITING:
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  }

  formatLearningStyleName(style: LearningStyleType): string {
    switch (style) {
      case LearningStyleType.VISUAL:
        return 'Visual';
      case LearningStyleType.AUDITORY:
        return 'Auditory';
      case LearningStyleType.KINESTHETIC:
        return 'Kinesthetic';
      case LearningStyleType.READING_WRITING:
        return 'Reading/Writing';
      default:
        return 'Unknown';
    }
  }

  getScoreForStyle(style: LearningStyleType): number {
    if (!this.result) return 0;
    
    switch (style) {
      case LearningStyleType.VISUAL:
        return this.result.visualScore;
      case LearningStyleType.AUDITORY:
        return this.result.auditoryScore;
      case LearningStyleType.KINESTHETIC:
        return this.result.kinestheticScore;
      case LearningStyleType.READING_WRITING:
        return this.result.readingWritingScore;
      default:
        return 0;
    }
  }

  getAllStyles(): LearningStyleType[] {
    return [
      LearningStyleType.VISUAL,
      LearningStyleType.AUDITORY,
      LearningStyleType.KINESTHETIC,
      LearningStyleType.READING_WRITING
    ];
  }

  getMaxScore(): number {
    if (!this.result) return 1;
    
    return Math.max(
      this.result.visualScore,
      this.result.auditoryScore,
      this.result.kinestheticScore,
      this.result.readingWritingScore
    );
  }
}

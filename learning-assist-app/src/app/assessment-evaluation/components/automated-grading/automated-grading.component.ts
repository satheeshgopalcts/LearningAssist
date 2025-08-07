import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AssessmentEvaluationService } from '../../assessment-evaluation.service';
import { ReplacePipe } from '../../pipes/replace.pipe';
import { AutoGradingResult, GradingMethod, GradingRubric } from '../../../models/assessment-evaluation.model';

@Component({
  selector: 'app-automated-grading',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    ReplacePipe
  ],
  templateUrl: './automated-grading.component.html',
  styleUrls: ['./automated-grading.component.scss']
})
export class AutomatedGradingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Public enums for template access
  GradingMethod = GradingMethod;

  // Component state
  gradingRubrics: GradingRubric[] = [];
  gradingResult: AutoGradingResult | null = null;
  isLoading = false;

  // Forms
  textGradingForm: FormGroup;
  codeGradingForm: FormGroup;
  rubricForm: FormGroup;

  // Demo questions
  sampleQuestions = [
    {
      id: 'q1',
      text: 'Explain the concept of polymorphism in object-oriented programming.',
      type: 'essay',
      expectedKeywords: ['inheritance', 'method overriding', 'interfaces', 'abstract classes']
    },
    {
      id: 'q2',
      text: 'Write a function to reverse a string in JavaScript.',
      type: 'coding',
      language: 'javascript'
    }
  ];

  selectedQuestion = this.sampleQuestions[0];

  constructor(
    private assessmentService: AssessmentEvaluationService,
    private fb: FormBuilder
  ) {
    this.textGradingForm = this.createTextGradingForm();
    this.codeGradingForm = this.createCodeGradingForm();
    this.rubricForm = this.createRubricForm();
  }

  ngOnInit(): void {
    this.loadGradingRubrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createTextGradingForm(): FormGroup {
    return this.fb.group({
      questionId: ['q1'],
      studentResponse: ['', [Validators.required, Validators.minLength(50)]],
      gradingMethod: [GradingMethod.SEMANTIC_ANALYSIS, [Validators.required]]
    });
  }

  private createCodeGradingForm(): FormGroup {
    return this.fb.group({
      questionId: ['q2'],
      codeResponse: ['', [Validators.required]],
      language: ['javascript', [Validators.required]]
    });
  }

  private createRubricForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      totalPoints: [100, [Validators.required, Validators.min(1)]]
    });
  }

  loadGradingRubrics(): void {
    this.assessmentService.getGradingRubrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rubrics) => {
          this.gradingRubrics = rubrics;
        },
        error: (error) => {
          console.error('Error loading rubrics:', error);
        }
      });
  }

  gradeTextResponse(): void {
    if (this.textGradingForm.invalid) return;

    const formValue = this.textGradingForm.value;
    this.isLoading = true;

    this.assessmentService.gradeResponse(
      formValue.questionId,
      formValue.studentResponse,
      formValue.gradingMethod
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.gradingResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error grading response:', error);
        this.isLoading = false;
      }
    });
  }

  gradeCodeResponse(): void {
    if (this.codeGradingForm.invalid) return;

    const formValue = this.codeGradingForm.value;
    this.isLoading = true;

    this.assessmentService.gradeCodeResponse(
      formValue.questionId,
      formValue.codeResponse
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.gradingResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error grading code:', error);
        this.isLoading = false;
      }
    });
  }

  createRubric(): void {
    if (this.rubricForm.invalid) return;

    const formValue = this.rubricForm.value;
    this.isLoading = true;

    this.assessmentService.createGradingRubric(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rubric) => {
          this.gradingRubrics.push(rubric);
          this.rubricForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating rubric:', error);
          this.isLoading = false;
        }
      });
  }

  selectQuestion(question: any): void {
    this.selectedQuestion = question;
    this.gradingResult = null;
    
    if (question.type === 'essay') {
      this.textGradingForm.patchValue({ questionId: question.id });
    } else {
      this.codeGradingForm.patchValue({ questionId: question.id });
    }
  }

  getGradingMethodIcon(method: GradingMethod): string {
    const icons = {
      [GradingMethod.EXACT_MATCH]: 'search',
      [GradingMethod.PATTERN_MATCHING]: 'pattern',
      [GradingMethod.SEMANTIC_ANALYSIS]: 'psychology',
      [GradingMethod.CODE_EXECUTION]: 'code',
      [GradingMethod.RUBRIC_BASED]: 'rule',
      [GradingMethod.ML_CLASSIFICATION]: 'smart_toy'
    };
    return icons[method] || 'help';
  }

  getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'lightgreen';
    if (percentage >= 70) return 'orange';
    if (percentage >= 60) return 'orangered';
    return 'red';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return 'green';
    if (confidence >= 0.7) return 'orange';
    return 'red';
  }

  trackByRubricId(index: number, rubric: GradingRubric): string {
    return rubric.id;
  }

  trackByQuestionId(index: number, question: any): string {
    return question.id;
  }
}

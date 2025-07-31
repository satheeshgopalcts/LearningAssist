import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { QuizContent, QuizQuestion, QuestionType } from '../../models/content.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-quiz-builder',
  templateUrl: './quiz-builder.component.html',
  styleUrls: ['./quiz-builder.component.scss']
})
export class QuizBuilderComponent implements OnInit {
  @Input() quiz: QuizContent | null = null;
  @Output() quizSaved = new EventEmitter<QuizContent>();
  @Output() cancelled = new EventEmitter<void>();

  quizForm: FormGroup;
  questionTypes = Object.values(QuestionType);

  constructor(private fb: FormBuilder) {
    this.quizForm = this.createQuizForm();
  }

  ngOnInit() {
    if (this.quiz) {
      this.loadQuiz(this.quiz);
    } else {
      this.addQuestion();
    }
  }

  private createQuizForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      instructions: [''],
      timeLimit: [null],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      allowRetakes: [true],
      maxAttempts: [null],
      questions: this.fb.array([])
    });
  }

  private loadQuiz(quiz: QuizContent) {
    this.quizForm.patchValue({
      title: quiz.title,
      instructions: quiz.instructions,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      allowRetakes: quiz.allowRetakes,
      maxAttempts: quiz.maxAttempts
    });

    const questionsArray = this.questions;
    questionsArray.clear();

    quiz.questions.forEach(question => {
      questionsArray.push(this.createQuestionForm(question));
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  private createQuestionForm(question?: QuizQuestion): FormGroup {
    const form = this.fb.group({
      type: [question?.type || QuestionType.MULTIPLE_CHOICE, Validators.required],
      question: [question?.question || '', Validators.required],
      options: this.fb.array(question?.options?.map(opt => this.fb.control(opt)) || []),
      correctAnswers: this.fb.array(question?.correctAnswers?.map(ans => this.fb.control(ans)) || []),
      explanation: [question?.explanation || ''],
      points: [question?.points || 1, [Validators.required, Validators.min(1)]]
    });

    // Ensure options and correct answers for multiple choice questions
    if (!question || question.type === QuestionType.MULTIPLE_CHOICE) {
      this.ensureMinimumOptions(form);
    }

    return form;
  }

  addQuestion() {
    const questionForm = this.createQuestionForm();
    this.questions.push(questionForm);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  onQuestionTypeChange(questionIndex: number) {
    const questionForm = this.questions.at(questionIndex) as FormGroup;
    const type = questionForm.get('type')?.value;
    
    // Clear and reset options/answers based on question type
    const optionsArray = questionForm.get('options') as FormArray;
    const correctAnswersArray = questionForm.get('correctAnswers') as FormArray;
    
    optionsArray.clear();
    correctAnswersArray.clear();

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        this.ensureMinimumOptions(questionForm);
        break;
      case QuestionType.TRUE_FALSE:
        optionsArray.push(this.fb.control('True'));
        optionsArray.push(this.fb.control('False'));
        break;
      case QuestionType.SHORT_ANSWER:
      case QuestionType.ESSAY:
      case QuestionType.FILL_IN_BLANK:
        // No options needed
        break;
    }
  }

  private ensureMinimumOptions(questionForm: FormGroup) {
    const optionsArray = questionForm.get('options') as FormArray;
    while (optionsArray.length < 4) {
      optionsArray.push(this.fb.control(''));
    }
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  getCorrectAnswersArray(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('correctAnswers') as FormArray;
  }

  addOption(questionIndex: number) {
    const optionsArray = this.getOptionsArray(questionIndex);
    optionsArray.push(this.fb.control(''));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const optionsArray = this.getOptionsArray(questionIndex);
    if (optionsArray.length > 2) { // Keep minimum 2 options
      optionsArray.removeAt(optionIndex);
    }
  }

  toggleCorrectAnswer(questionIndex: number, optionIndex: number) {
    const correctAnswersArray = this.getCorrectAnswersArray(questionIndex);
    const optionsArray = this.getOptionsArray(questionIndex);
    const optionValue = optionsArray.at(optionIndex).value;
    
    const existingIndex = correctAnswersArray.controls.findIndex(
      control => control.value === optionValue
    );

    if (existingIndex >= 0) {
      correctAnswersArray.removeAt(existingIndex);
    } else {
      correctAnswersArray.push(this.fb.control(optionValue));
    }
  }

  isCorrectAnswer(questionIndex: number, optionIndex: number): boolean {
    const correctAnswersArray = this.getCorrectAnswersArray(questionIndex);
    const optionsArray = this.getOptionsArray(questionIndex);
    const optionValue = optionsArray.at(optionIndex).value;
    
    return correctAnswersArray.controls.some(control => control.value === optionValue);
  }

  onQuestionReorder(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
    this.questions.updateValueAndValidity();
  }

  saveQuiz() {
    if (this.quizForm.valid) {
      const formValue = this.quizForm.value;
      
      const quiz: QuizContent = {
        id: this.quiz?.id || this.generateId(),
        title: formValue.title,
        instructions: formValue.instructions,
        timeLimit: formValue.timeLimit,
        passingScore: formValue.passingScore,
        allowRetakes: formValue.allowRetakes,
        maxAttempts: formValue.maxAttempts,
        questions: formValue.questions.map((q: any, index: number) => ({
          id: this.quiz?.questions[index]?.id || this.generateId(),
          type: q.type,
          question: q.question,
          options: q.options?.filter((opt: string) => opt.trim()) || [],
          correctAnswers: q.correctAnswers || [],
          explanation: q.explanation,
          points: q.points
        }))
      };

      this.quizSaved.emit(quiz);
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  previewQuiz() {
    // Implement quiz preview functionality
    console.log('Quiz preview:', this.quizForm.value);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getTotalPoints(): number {
    return this.questions.controls.reduce((total, question) => {
      return total + (question.get('points')?.value || 0);
    }, 0);
  }

  getQuestionTypeDisplay(type: QuestionType): string {
    const typeMap = {
      [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
      [QuestionType.TRUE_FALSE]: 'True/False',
      [QuestionType.SHORT_ANSWER]: 'Short Answer',
      [QuestionType.ESSAY]: 'Essay',
      [QuestionType.FILL_IN_BLANK]: 'Fill in the Blank',
      [QuestionType.DRAG_AND_DROP]: 'Drag and Drop',
      [QuestionType.MATCHING]: 'Matching'
    };
    return typeMap[type] || type;
  }

  updateCorrectAnswer(questionIndex: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const correctAnswersArray = this.getCorrectAnswersArray(questionIndex);
    
    if (correctAnswersArray.length === 0) {
      correctAnswersArray.push(this.fb.control(value));
    } else {
      correctAnswersArray.at(0)?.setValue(value);
    }
  }
}

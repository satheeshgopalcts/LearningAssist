import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Assignment, SubmissionType, AssignmentRubric, RubricCriterion, RubricLevel } from '../../models/content.model';

@Component({
  selector: 'app-assignment-creator',
  templateUrl: './assignment-creator.component.html',
  styleUrls: ['./assignment-creator.component.scss']
})
export class AssignmentCreatorComponent implements OnInit {
  @Input() assignment: Assignment | null = null;
  @Output() assignmentSaved = new EventEmitter<Assignment>();
  @Output() assignmentCancelled = new EventEmitter<void>();

  assignmentForm!: FormGroup;
  submissionTypes = Object.values(SubmissionType);
  showRubric = false;

  submissionTypeLabels = {
    [SubmissionType.TEXT]: 'Text Entry',
    [SubmissionType.FILE_UPLOAD]: 'File Upload',
    [SubmissionType.ONLINE]: 'Online Submission',
    [SubmissionType.NONE]: 'No Submission Required'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.assignmentForm = this.fb.group({
      title: [this.assignment?.title || '', Validators.required],
      description: [this.assignment?.description || '', Validators.required],
      instructions: [this.assignment?.instructions || '', Validators.required],
      dueDate: [this.assignment?.dueDate || null],
      maxPoints: [this.assignment?.maxPoints || 100, [Validators.required, Validators.min(1)]],
      submissionType: [this.assignment?.submissionType || SubmissionType.TEXT, Validators.required],
      autoGrade: [this.assignment?.autoGrade || false],
      rubric: this.createRubricForm(this.assignment?.rubric)
    });

    this.showRubric = !!this.assignment?.rubric;
  }

  private createRubricForm(rubric?: AssignmentRubric): FormGroup {
    return this.fb.group({
      id: [rubric?.id || this.generateId()],
      criteria: this.fb.array(
        rubric?.criteria?.map(criterion => this.createCriterionForm(criterion)) || []
      )
    });
  }

  private createCriterionForm(criterion?: RubricCriterion): FormGroup {
    return this.fb.group({
      id: [criterion?.id || this.generateId()],
      name: [criterion?.name || '', Validators.required],
      description: [criterion?.description || ''],
      maxPoints: [criterion?.maxPoints || 10, [Validators.required, Validators.min(1)]],
      levels: this.fb.array(
        criterion?.levels?.map(level => this.createLevelForm(level)) || []
      )
    });
  }

  private createLevelForm(level?: RubricLevel): FormGroup {
    return this.fb.group({
      id: [level?.id || this.generateId()],
      name: [level?.name || '', Validators.required],
      description: [level?.description || ''],
      points: [level?.points || 0, [Validators.required, Validators.min(0)]]
    });
  }

  get rubricForm(): FormGroup {
    return this.assignmentForm.get('rubric') as FormGroup;
  }

  get criteriaArray(): FormArray {
    return this.rubricForm.get('criteria') as FormArray;
  }

  getCriterionLevelsArray(criterionIndex: number): FormArray {
    return this.criteriaArray.at(criterionIndex).get('levels') as FormArray;
  }

  toggleRubric() {
    this.showRubric = !this.showRubric;
    if (!this.showRubric) {
      // Clear rubric data
      this.assignmentForm.setControl('rubric', this.createRubricForm());
    } else if (this.criteriaArray.length === 0) {
      // Add default criterion if none exist
      this.addCriterion();
    }
  }

  addCriterion() {
    const criterion = this.createCriterionForm();
    this.criteriaArray.push(criterion);
    
    // Add default levels
    const levelsArray = this.getCriterionLevelsArray(this.criteriaArray.length - 1);
    const defaultLevels = [
      { id: this.generateId(), name: 'Excellent', description: 'Exceeds expectations', points: 4 },
      { id: this.generateId(), name: 'Good', description: 'Meets expectations', points: 3 },
      { id: this.generateId(), name: 'Satisfactory', description: 'Partially meets expectations', points: 2 },
      { id: this.generateId(), name: 'Needs Improvement', description: 'Does not meet expectations', points: 1 }
    ];
    
    defaultLevels.forEach(level => {
      levelsArray.push(this.createLevelForm(level));
    });
  }

  removeCriterion(index: number) {
    this.criteriaArray.removeAt(index);
  }

  addLevel(criterionIndex: number) {
    const levelsArray = this.getCriterionLevelsArray(criterionIndex);
    levelsArray.push(this.createLevelForm());
  }

  removeLevel(criterionIndex: number, levelIndex: number) {
    const levelsArray = this.getCriterionLevelsArray(criterionIndex);
    levelsArray.removeAt(levelIndex);
  }

  saveAssignment() {
    if (this.assignmentForm.valid) {
      const formValue = this.assignmentForm.value;
      
      const assignmentData: Assignment = {
        id: this.assignment?.id || this.generateId(),
        title: formValue.title,
        description: formValue.description,
        instructions: formValue.instructions,
        dueDate: formValue.dueDate,
        maxPoints: formValue.maxPoints,
        submissionType: formValue.submissionType,
        autoGrade: formValue.autoGrade,
        rubric: this.showRubric && formValue.rubric.criteria.length > 0 ? formValue.rubric : undefined
      };

      this.assignmentSaved.emit(assignmentData);
    }
  }

  cancel() {
    this.assignmentCancelled.emit();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

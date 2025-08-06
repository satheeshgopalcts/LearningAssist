import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CareerGoalsService } from '../../career-goals.service';
import { CareerPath, CareerGoal, GoalPriority, SkillGap } from '../../../models/career-goals.model';

@Component({
  selector: 'app-goal-setting',
  templateUrl: './goal-setting.component.html',
  styleUrls: ['./goal-setting.component.scss']
})
export class GoalSettingComponent implements OnInit, OnDestroy {
  goalForm: FormGroup;
  careerPaths: CareerPath[] = [];
  loading = false;
  submitting = false;
  selectedCareerPath: CareerPath | null = null;
  skillGaps: SkillGap[] = [];
  
  // Current date in YYYY-MM-DD format for date input min attribute
  minDate = new Date().toISOString().split('T')[0];
  
  priorities = [
    { value: GoalPriority.LOW, label: 'Low' },
    { value: GoalPriority.MEDIUM, label: 'Medium' },
    { value: GoalPriority.HIGH, label: 'High' },
    { value: GoalPriority.CRITICAL, label: 'Critical' }
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private careerGoalsService: CareerGoalsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.goalForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.checkForPreselectedPath();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      careerPathId: ['', Validators.required],
      targetDate: ['', Validators.required],
      priority: [GoalPriority.MEDIUM, Validators.required],
      motivationLevel: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      estimatedTimeToComplete: [12, [Validators.required, Validators.min(1)]]
    });
  }

  private loadData(): void {
    this.loading = true;
    
    const pathsSub = this.careerGoalsService.getCareerPaths().subscribe({
      next: (paths) => {
        this.careerPaths = paths;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading career paths:', error);
        this.loading = false;
      }
    });

    const gapsSub = this.careerGoalsService.getSkillGaps().subscribe({
      next: (gaps) => {
        this.skillGaps = gaps;
      }
    });
    
    this.subscriptions.push(pathsSub, gapsSub);
  }

  private checkForPreselectedPath(): void {
    const careerPathId = this.route.snapshot.queryParams['careerPathId'];
    if (careerPathId) {
      this.goalForm.patchValue({ careerPathId });
      this.onCareerPathChange(careerPathId);
    }
  }

  onCareerPathChange(pathId: string): void {
    this.selectedCareerPath = this.careerPaths.find(path => path.id === pathId) || null;
    if (this.selectedCareerPath) {
      // Auto-populate some fields based on selected career path
      this.goalForm.patchValue({
        title: `Become a ${this.selectedCareerPath.title}`,
        estimatedTimeToComplete: this.selectedCareerPath.timeToAchieve || 12
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.goalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.goalForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `Value is too small`;
      if (field.errors['max']) return `Value is too large`;
    }
    return '';
  }

  validateSmartGoal(): boolean {
    const formValue = this.goalForm.value;
    
    // Basic SMART criteria validation
    const hasSpecificTitle = formValue.title && formValue.title.length >= 3;
    const hasMeasurableTarget = formValue.careerPathId && formValue.targetDate;
    const hasAchievableTimeframe = formValue.estimatedTimeToComplete >= 1;
    const isRelevant = formValue.description && formValue.description.length >= 10;
    const isTimeBound = formValue.targetDate;
    
    return hasSpecificTitle && hasMeasurableTarget && hasAchievableTimeframe && isRelevant && isTimeBound;
  }

  onSubmit(): void {
    if (this.goalForm.valid && this.validateSmartGoal()) {
      this.submitting = true;
      
      const formValue = this.goalForm.value;
      const newGoal: Partial<CareerGoal> = {
        title: formValue.title,
        description: formValue.description,
        targetCareerPath: this.selectedCareerPath!,
        targetDate: new Date(formValue.targetDate),
        priority: formValue.priority,
        motivationLevel: formValue.motivationLevel,
        estimatedTimeToComplete: formValue.estimatedTimeToComplete,
        isSmartGoal: this.validateSmartGoal()
      };

      // Simulate API call
      setTimeout(() => {
        console.log('Creating career goal:', newGoal);
        this.submitting = false;
        this.router.navigate(['/career-goals/goal-tracking']);
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.goalForm.controls).forEach(key => {
      const control = this.goalForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/career-goals']);
  }

  getRelatedSkillGaps(): SkillGap[] {
    if (!this.selectedCareerPath) return [];
    
    // Filter skill gaps related to the selected career path
    return this.skillGaps.filter(gap => 
      this.selectedCareerPath!.requiredSkills.some(skill => skill.id === gap.skillId)
    ).slice(0, 5);
  }

  getPriorityColor(priority: GoalPriority): string {
    switch (priority) {
      case GoalPriority.CRITICAL: return 'critical';
      case GoalPriority.HIGH: return 'high';
      case GoalPriority.MEDIUM: return 'medium';
      default: return 'low';
    }
  }
}

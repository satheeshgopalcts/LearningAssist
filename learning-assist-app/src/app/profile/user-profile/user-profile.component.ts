import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth.service';
import { User, LearningStyle, ContentType, DifficultyLevel, StudyTime } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  notificationForm!: FormGroup;
  user: User | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  profilePictureUrl = '';

  learningStyles = Object.values(LearningStyle);
  contentTypes = Object.values(ContentType);
  difficultyLevels = Object.values(DifficultyLevel);
  studyTimes = Object.values(StudyTime);

  availableCareerGoals = [
    'Software Developer', 'Data Scientist', 'Product Manager', 'UX Designer',
    'DevOps Engineer', 'Business Analyst', 'Project Manager', 'Full-Stack Developer',
    'Machine Learning Engineer', 'Cybersecurity Specialist', 'Cloud Architect',
    'Mobile Developer', 'Frontend Developer', 'Backend Developer'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initializeForms();
    this.loadUserData();
  }

  private initializeForms(): void {
    // Profile Information Form
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      careerGoals: [[]]
    });

    // Learning Preferences Form
    this.preferencesForm = this.formBuilder.group({
      learningStyle: ['', Validators.required],
      preferredContentTypes: [[]],
      difficultyLevel: ['', Validators.required],
      studyTimePreference: ['', Validators.required]
    });

    // Notification Settings Form
    this.notificationForm = this.formBuilder.group({
      emailNotifications: [true],
      pushNotifications: [true],
      weeklyProgress: [true],
      courseUpdates: [true],
      achievementAlerts: [true]
    });
  }

  private loadUserData(): void {
    if (this.user) {
      // Load profile data
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        careerGoals: this.user.careerGoals
      });

      // Load preferences data
      this.preferencesForm.patchValue({
        learningStyle: this.user.learningPreferences.learningStyle,
        preferredContentTypes: this.user.learningPreferences.preferredContentTypes,
        difficultyLevel: this.user.learningPreferences.difficultyLevel,
        studyTimePreference: this.user.learningPreferences.studyTimePreference
      });

      // Load notification settings
      this.notificationForm.patchValue(this.user.learningPreferences.notificationSettings);

      // Set profile picture
      this.profilePictureUrl = this.user.profilePicture || '/assets/default-avatar.png';
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Simulate API call
      setTimeout(() => {
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      }, 1000);
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onPreferencesSubmit(): void {
    if (this.preferencesForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Simulate API call
      setTimeout(() => {
        this.loading = false;
        this.successMessage = 'Learning preferences updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      }, 1000);
    } else {
      this.markFormGroupTouched(this.preferencesForm);
    }
  }

  onNotificationSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Notification settings updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.isValidImageFile(file)) {
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profilePictureUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        // Here you would upload the file to your server
        this.uploadProfilePicture(file);
      } else {
        this.errorMessage = 'Please select a valid image file (JPG, PNG, GIF)';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  private uploadProfilePicture(file: File): void {
    this.loading = true;
    // Simulate file upload
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Profile picture updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }, 1500);
  }

  addCareerGoal(goal: string): void {
    const currentGoals = this.profileForm.get('careerGoals')?.value || [];
    if (!currentGoals.includes(goal)) {
      this.profileForm.patchValue({
        careerGoals: [...currentGoals, goal]
      });
    }
  }

  removeCareerGoal(goal: string): void {
    const currentGoals = this.profileForm.get('careerGoals')?.value || [];
    this.profileForm.patchValue({
      careerGoals: currentGoals.filter((g: string) => g !== goal)
    });
  }

  addContentType(type: ContentType): void {
    const currentTypes = this.preferencesForm.get('preferredContentTypes')?.value || [];
    if (!currentTypes.includes(type)) {
      this.preferencesForm.patchValue({
        preferredContentTypes: [...currentTypes, type]
      });
    }
  }

  removeContentType(type: ContentType): void {
    const currentTypes = this.preferencesForm.get('preferredContentTypes')?.value || [];
    this.preferencesForm.patchValue({
      preferredContentTypes: currentTypes.filter((t: ContentType) => t !== type)
    });
  }

  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  formatEnumValue(value: string): string {
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}

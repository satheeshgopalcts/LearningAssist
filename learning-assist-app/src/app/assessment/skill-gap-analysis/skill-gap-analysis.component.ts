import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';

import { AssessmentService } from '../assessment.service';
import { SkillAssessment, SkillGapAnalysis } from '../../models/assessment.model';

interface SkillCategory {
  name: string;
  skills: string[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-skill-gap-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTabsModule
  ],
  templateUrl: './skill-gap-analysis.component.html',
  styleUrls: ['./skill-gap-analysis.component.scss']
})
export class SkillGapAnalysisComponent implements OnInit {
  assessmentForm: FormGroup;
  analysisResult: SkillGapAnalysis | null = null;
  isLoading = false;
  isCompleted = false;
  selectedCategory: string = '';

  // Add priority levels array
  priorityLevels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

  skillCategories: SkillCategory[] = [
    {
      name: 'Programming',
      icon: 'code',
      color: '#2196f3',
      skills: [
        'JavaScript/TypeScript',
        'Python',
        'Java',
        'C#',
        'React/Angular/Vue',
        'Node.js',
        'HTML/CSS',
        'SQL',
        'Git Version Control',
        'API Development'
      ]
    },
    {
      name: 'Data Science',
      icon: 'analytics',
      color: '#4caf50',
      skills: [
        'Data Analysis',
        'Machine Learning',
        'Statistics',
        'Data Visualization',
        'Python (Pandas/NumPy)',
        'R Programming',
        'SQL for Data',
        'Tableau/Power BI',
        'Deep Learning',
        'Big Data Technologies'
      ]
    },
    {
      name: 'Design',
      icon: 'palette',
      color: '#ff9800',
      skills: [
        'UI/UX Design',
        'Figma/Sketch',
        'Adobe Creative Suite',
        'Prototyping',
        'User Research',
        'Wireframing',
        'Design Systems',
        'Responsive Design',
        'Accessibility',
        'Visual Design'
      ]
    },
    {
      name: 'Business',
      icon: 'business',
      color: '#9c27b0',
      skills: [
        'Project Management',
        'Agile/Scrum',
        'Leadership',
        'Communication',
        'Strategic Planning',
        'Financial Analysis',
        'Marketing',
        'Sales',
        'Operations Management',
        'Business Analysis'
      ]
    },
    {
      name: 'Digital Marketing',
      icon: 'campaign',
      color: '#f44336',
      skills: [
        'SEO/SEM',
        'Social Media Marketing',
        'Content Marketing',
        'Email Marketing',
        'Google Analytics',
        'PPC Advertising',
        'Conversion Optimization',
        'Brand Management',
        'Influencer Marketing',
        'Marketing Automation'
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private snackBar: MatSnackBar
  ) {
    this.assessmentForm = this.fb.group({
      skills: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  get skillsArray(): FormArray {
    return this.assessmentForm.get('skills') as FormArray;
  }

  initializeForm(): void {
    // Initialize with some default skills from programming category
    const defaultSkills = this.skillCategories[0].skills.slice(0, 5);
    defaultSkills.forEach(skill => this.addSkill(skill));
  }

  addSkill(skillName: string = ''): void {
    const skillGroup = this.fb.group({
      skillName: [skillName, Validators.required],
      currentLevel: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      targetLevel: [8, [Validators.required, Validators.min(1), Validators.max(10)]],
      importance: ['medium', Validators.required]
    });

    this.skillsArray.push(skillGroup);
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  addSkillFromCategory(skillName: string): void {
    // Check if skill already exists
    const existingSkills = this.skillsArray.value.map((s: any) => s.skillName.toLowerCase());
    if (!existingSkills.includes(skillName.toLowerCase())) {
      this.addSkill(skillName);
      this.snackBar.open(`${skillName} added to assessment`, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open(`${skillName} is already in your assessment`, 'Close', { duration: 2000 });
    }
  }

  performAnalysis(): void {
    if (this.assessmentForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    
    const formData = this.assessmentForm.value;
    const skills: SkillAssessment[] = formData.skills.map((skill: any, index: number) => ({
      skillId: `skill_${index}`,
      skillName: skill.skillName,
      currentLevel: skill.currentLevel,
      targetLevel: skill.targetLevel,
      gap: skill.targetLevel - skill.currentLevel,
      priority: this.mapImportanceToPriority(skill.importance),
      recommendations: [],
      assessedAt: new Date()
    }));

    this.assessmentService.performSkillGapAnalysis(skills).subscribe({
      next: (analysis) => {
        this.analysisResult = analysis;
        this.isCompleted = true;
        this.isLoading = false;
        this.snackBar.open('Skill gap analysis completed!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error performing analysis:', error);
        this.snackBar.open('Error performing analysis', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private mapImportanceToPriority(importance: string): 'high' | 'medium' | 'low' {
    switch (importance) {
      case 'high': return 'high';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  restartAnalysis(): void {
    this.isCompleted = false;
    this.analysisResult = null;
    this.skillsArray.clear();
    this.initializeForm();
  }

  getSkillsByPriority(priority: 'high' | 'medium' | 'low'): SkillAssessment[] {
    if (!this.analysisResult) return [];
    return this.analysisResult.skills.filter(skill => skill.priority === priority);
  }

  getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  }

  getPriorityIcon(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'drag_handle';
      case 'low': return 'low_priority';
      default: return 'help';
    }
  }

  getGapLevelText(gap: number): string {
    if (gap <= 0) return 'Proficient';
    if (gap <= 2) return 'Minor Gap';
    if (gap <= 4) return 'Moderate Gap';
    return 'Significant Gap';
  }

  getGapColor(gap: number): string {
    if (gap <= 0) return '#4caf50';
    if (gap <= 2) return '#8bc34a';
    if (gap <= 4) return '#ff9800';
    return '#f44336';
  }

  formatCurrentLevel(level: number): string {
    const levels = [
      '', 'Beginner', 'Novice', 'Basic', 'Intermediate', 'Competent',
      'Proficient', 'Advanced', 'Expert', 'Mastery', 'World-class'
    ];
    return levels[level] || 'Unknown';
  }

  getCategoryBySkillName(skillName: string): SkillCategory | null {
    return this.skillCategories.find(category => 
      category.skills.some(skill => 
        skill.toLowerCase().includes(skillName.toLowerCase()) || 
        skillName.toLowerCase().includes(skill.toLowerCase())
      )
    ) || null;
  }

  getOverallGapLevel(): string {
    if (!this.analysisResult) return 'Unknown';
    
    const score = this.analysisResult.overallScore;
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Needs Improvement';
  }

  getSkillsNeedingAttention(): SkillAssessment[] {
    if (!this.analysisResult) return [];
    return this.analysisResult.skills
      .filter(skill => skill.gap >= 3)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);
  }

  getTopStrengths(): SkillAssessment[] {
    if (!this.analysisResult) return [];
    return this.analysisResult.skills
      .filter(skill => skill.gap <= 1)
      .sort((a, b) => b.currentLevel - a.currentLevel)
      .slice(0, 5);
  }
}

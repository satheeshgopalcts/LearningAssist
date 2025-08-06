import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CareerGoalsService } from '../../career-goals.service';
import { SkillMatrix, Skill, SkillLevel, SkillCategory, SkillAssessment } from '../../../models/career-goals.model';

@Component({
  selector: 'app-skill-matrix',
  templateUrl: './skill-matrix.component.html',
  styleUrls: ['./skill-matrix.component.scss']
})
export class SkillMatrixComponent implements OnInit, OnDestroy {
  skillMatrix: SkillMatrix | null = null;
  loading = true;
  selectedCategory: SkillCategory | 'all' = 'all';
  
  // Filter options
  categories: SkillCategory[] = [
    SkillCategory.TECHNICAL,
    SkillCategory.SOFT_SKILLS,
    SkillCategory.DOMAIN_KNOWLEDGE,
    SkillCategory.TOOLS,
    SkillCategory.FRAMEWORKS
  ];
  
  skillLevels = [
    { level: 'none', label: 'None', color: '#a0aec0' },
    { level: 'beginner', label: 'Beginner', color: '#e53e3e' },
    { level: 'novice', label: 'Novice', color: '#dd6b20' },
    { level: 'intermediate', label: 'Intermediate', color: '#d69e2e' },
    { level: 'advanced', label: 'Advanced', color: '#38a169' },
    { level: 'expert', label: 'Expert', color: '#3182ce' }
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(private careerGoalsService: CareerGoalsService) {}

  ngOnInit(): void {
    this.loadSkillMatrix();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadSkillMatrix(): void {
    this.loading = true;
    
    const matrixSub = this.careerGoalsService.getSkillMatrix('user-123').subscribe({
      next: (matrix) => {
        this.skillMatrix = matrix;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading skill matrix:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.push(matrixSub);
  }

  getFilteredSkills(): SkillAssessment[] {
    if (!this.skillMatrix) return [];
    
    // For now, return all skill assessments as we need to join with actual skill data
    // to get categories. This would ideally be done in the service.
    return this.skillMatrix.skills;
  }

  onCategoryChange(category: SkillCategory | 'all'): void {
    this.selectedCategory = category;
  }

  getSkillLevelColor(level: SkillLevel): string {
    const levelMap: { [key in SkillLevel]: string } = {
      [SkillLevel.NONE]: '#a0aec0',
      [SkillLevel.BEGINNER]: '#e53e3e',
      [SkillLevel.NOVICE]: '#dd6b20',
      [SkillLevel.INTERMEDIATE]: '#d69e2e',
      [SkillLevel.ADVANCED]: '#38a169',
      [SkillLevel.EXPERT]: '#3182ce'
    };
    return levelMap[level] || '#a0aec0';
  }

  getSkillLevelWidth(level: SkillLevel): number {
    const levelMap: { [key in SkillLevel]: number } = {
      [SkillLevel.NONE]: 0,
      [SkillLevel.BEGINNER]: 20,
      [SkillLevel.NOVICE]: 35,
      [SkillLevel.INTERMEDIATE]: 50,
      [SkillLevel.ADVANCED]: 75,
      [SkillLevel.EXPERT]: 100
    };
    return levelMap[level] || 0;
  }

  getCategoryIcon(category: SkillCategory): string {
    const iconMap: { [key in SkillCategory]: string } = {
      [SkillCategory.TECHNICAL]: '💻',
      [SkillCategory.SOFT_SKILLS]: '🤝',
      [SkillCategory.DOMAIN_KNOWLEDGE]: '📚',
      [SkillCategory.TOOLS]: '🛠️',
      [SkillCategory.FRAMEWORKS]: '🏗️',
      [SkillCategory.LANGUAGES]: '💬',
      [SkillCategory.CERTIFICATIONS]: '🏆',
      [SkillCategory.METHODOLOGIES]: '�'
    };
    return iconMap[category] || '📊';
  }

  getCategoryLabel(category: SkillCategory): string {
    const labelMap: { [key in SkillCategory]: string } = {
      [SkillCategory.TECHNICAL]: 'Technical Skills',
      [SkillCategory.SOFT_SKILLS]: 'Soft Skills',
      [SkillCategory.DOMAIN_KNOWLEDGE]: 'Domain Knowledge',
      [SkillCategory.TOOLS]: 'Tools',
      [SkillCategory.FRAMEWORKS]: 'Frameworks',
      [SkillCategory.LANGUAGES]: 'Languages',
      [SkillCategory.CERTIFICATIONS]: 'Certifications',
      [SkillCategory.METHODOLOGIES]: 'Methodologies'
    };
    return labelMap[category] || category;
  }

  getSkillImportanceColor(importance: string): string {
    switch (importance.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  calculateCategoryProgress(category: SkillCategory): number {
    if (!this.skillMatrix) return 0;
    
    // For now, return a placeholder since we need to join with Skill data
    // This would ideally be calculated in the service
    return 50; // Placeholder
  }

  getOverallProgress(): number {
    if (!this.skillMatrix) return 0;
    
    const totalSkills = this.skillMatrix.skills.length;
    if (totalSkills === 0) return 0;
    
    const totalProgress = this.skillMatrix.skills.reduce((sum, skillAssessment) => {
      return sum + this.getSkillLevelWidth(skillAssessment.currentLevel);
    }, 0);
    
    return Math.round(totalProgress / totalSkills);
  }

  startAssessment(skillAssessment?: SkillAssessment): void {
    // Navigate to skill assessment
    if (skillAssessment) {
      console.log('Starting assessment for skill ID:', skillAssessment.skillId);
    } else {
      console.log('Starting general skill assessment');
      // Navigate to general assessment page or show skill selection
    }
  }

  viewLearningResources(skillAssessment: SkillAssessment): void {
    // Show learning resources for the skill
    console.log('Viewing resources for skill ID:', skillAssessment.skillId);
  }

  getSkillLevelLabel(level: SkillLevel): string {
    switch(level) {
      case SkillLevel.NONE: return 'None';
      case SkillLevel.BEGINNER: return 'Beginner';
      case SkillLevel.NOVICE: return 'Novice';
      case SkillLevel.INTERMEDIATE: return 'Intermediate';
      case SkillLevel.ADVANCED: return 'Advanced';
      case SkillLevel.EXPERT: return 'Expert';
      default: return 'Unknown';
    }
  }
}

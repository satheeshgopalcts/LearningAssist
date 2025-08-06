import { Component, OnInit } from '@angular/core';
import { CareerGoalsService } from '../../career-goals.service';
import { SkillAssessment, SkillLevel } from '../../../models/career-goals.model';

@Component({
  selector: 'app-skill-assessment',
  templateUrl: './skill-assessment.component.html',
  styleUrls: ['./skill-assessment.component.scss']
})
export class SkillAssessmentComponent implements OnInit {
  assessments: SkillAssessment[] = [];
  loading = true;

  constructor(private careerGoalsService: CareerGoalsService) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  private loadAssessments(): void {
    this.careerGoalsService.getSkillAssessments().subscribe({
      next: (assessments) => {
        this.assessments = assessments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assessments:', error);
        this.loading = false;
      }
    });
  }

  startNewAssessment(): void {
    console.log('Starting new skill assessment...');
  }

  retakeAssessment(assessment: SkillAssessment): void {
    console.log('Retaking assessment:', assessment.id);
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

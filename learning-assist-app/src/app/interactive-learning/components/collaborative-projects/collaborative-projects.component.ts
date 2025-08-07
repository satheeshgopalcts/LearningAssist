import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { InteractiveLearningService } from '../../interactive-learning.service';
import {
  CollaborativeProject,
  ProjectTeam,
  TeamMember,
  ProjectStatus,
  TeamRole
} from '../../../models/interactive-learning.model';

@Component({
  selector: 'app-collaborative-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './collaborative-projects.component.html',
  styleUrls: ['./collaborative-projects.component.scss']
})
export class CollaborativeProjectsComponent implements OnInit {
  projects$: Observable<CollaborativeProject[]>;
  selectedProject: CollaborativeProject | null = null;
  selectedTeam: ProjectTeam | null = null;
  viewMode: 'list' | 'project' | 'team' = 'list';
  
  // Form models
  newProjectTitle = '';
  newProjectDescription = '';
  newProjectDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  newProjectMaxTeamSize = 4;
  newProjectMinTeamSize = 2;
  
  newTeamName = '';
  newTeamDescription = '';
  
  // Constants
  readonly ProjectStatus = ProjectStatus;
  readonly TeamRole = TeamRole;

  constructor(
    private interactiveLearningService: InteractiveLearningService,
    private snackBar: MatSnackBar
  ) {
    this.projects$ = this.interactiveLearningService.getProjects();
  }

  ngOnInit(): void {}

  // Project Management
  createProject(): void {
    if (!this.newProjectTitle.trim() || !this.newProjectDescription.trim()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const projectData = {
      title: this.newProjectTitle,
      description: this.newProjectDescription,
      deadline: this.newProjectDeadline,
      maxTeamSize: this.newProjectMaxTeamSize,
      minTeamSize: this.newProjectMinTeamSize
    };

    this.interactiveLearningService.createProject(projectData).subscribe({
      next: (project) => {
        this.snackBar.open('Project created successfully!', 'Close', { duration: 3000 });
        this.resetProjectForm();
      },
      error: (error) => {
        this.snackBar.open('Error creating project', 'Close', { duration: 3000 });
        console.error('Error creating project:', error);
      }
    });
  }

  selectProject(project: CollaborativeProject): void {
    this.selectedProject = project;
    this.viewMode = 'project';
  }

  selectTeam(team: ProjectTeam): void {
    this.selectedTeam = team;
    this.viewMode = 'team';
  }

  goBack(): void {
    if (this.viewMode === 'team') {
      this.viewMode = 'project';
      this.selectedTeam = null;
    } else if (this.viewMode === 'project') {
      this.viewMode = 'list';
      this.selectedProject = null;
    }
  }

  // Team Management
  createTeam(): void {
    if (!this.selectedProject || !this.newTeamName.trim()) {
      this.snackBar.open('Please enter team name', 'Close', { duration: 3000 });
      return;
    }

    const teamData = {
      name: this.newTeamName,
      description: this.newTeamDescription
    };

    this.interactiveLearningService.createTeam(this.selectedProject.id, teamData).subscribe({
      next: (team) => {
        this.snackBar.open('Team created successfully!', 'Close', { duration: 3000 });
        this.selectedProject!.teams.push(team);
        this.resetTeamForm();
      },
      error: (error) => {
        this.snackBar.open('Error creating team', 'Close', { duration: 3000 });
        console.error('Error creating team:', error);
      }
    });
  }

  // Utility methods
  resetProjectForm(): void {
    this.newProjectTitle = '';
    this.newProjectDescription = '';
    this.newProjectDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.newProjectMaxTeamSize = 4;
    this.newProjectMinTeamSize = 2;
  }

  resetTeamForm(): void {
    this.newTeamName = '';
    this.newTeamDescription = '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getDaysRemaining(deadline: Date): number {
    const now = new Date();
    const end = new Date(deadline);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusColor(status: ProjectStatus): string {
    const colorMap = {
      [ProjectStatus.PLANNING]: 'primary',
      [ProjectStatus.ACTIVE]: 'accent',
      [ProjectStatus.REVIEW]: 'warn',
      [ProjectStatus.COMPLETED]: 'primary',
      [ProjectStatus.CANCELLED]: 'warn'
    };
    return colorMap[status] || 'primary';
  }

  calculateProjectProgress(project: any): number {
    if (!project.teams || project.teams.length === 0) {
      return 0;
    }
    const totalProgress = project.teams.reduce((acc: number, team: any) => acc + team.progress, 0);
    return totalProgress / project.teams.length;
  }

  getFirstThreeMembers(members: any[]): any[] {
    return members.slice(0, 3);
  }

  getRemainingMembersCount(members: any[]): number {
    return Math.max(0, members.length - 3);
  }

  getResourceIcon(resourceType: string): string {
    return resourceType === 'document' ? 'description' : 'link';
  }

  getCollaborativeToolIcon(toolType: string): string {
    return toolType === 'communication' ? 'chat' : 'edit';
  }

  getStatusIcon(status: ProjectStatus): string {
    const iconMap = {
      [ProjectStatus.PLANNING]: 'schedule',
      [ProjectStatus.ACTIVE]: 'play_arrow',
      [ProjectStatus.REVIEW]: 'rate_review',
      [ProjectStatus.COMPLETED]: 'check_circle',
      [ProjectStatus.CANCELLED]: 'cancel'
    };
    return iconMap[status] || 'help';
  }

  getRoleColor(role: TeamRole): string {
    const colorMap = {
      [TeamRole.LEADER]: 'accent',
      [TeamRole.MEMBER]: 'primary',
      [TeamRole.COORDINATOR]: 'warn',
      [TeamRole.SPECIALIST]: 'primary'
    };
    return colorMap[role] || 'primary';
  }
}

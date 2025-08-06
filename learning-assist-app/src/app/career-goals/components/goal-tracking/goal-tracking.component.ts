import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CareerGoalsService } from '../../career-goals.service';
import { CareerGoal, GoalStatus, GoalPriority } from '../../../models/career-goals.model';

@Component({
  selector: 'app-goal-tracking',
  templateUrl: './goal-tracking.component.html',
  styleUrls: ['./goal-tracking.component.scss']
})
export class GoalTrackingComponent implements OnInit, OnDestroy {
  goals: CareerGoal[] = [];
  filteredGoals: CareerGoal[] = [];
  loading = true;
  selectedStatus: GoalStatus | 'all' = 'all';
  
  statusOptions = [
    { value: 'all', label: 'All Goals' },
    { value: GoalStatus.ACTIVE, label: 'Active' },
    { value: GoalStatus.IN_PROGRESS, label: 'In Progress' },
    { value: GoalStatus.COMPLETED, label: 'Completed' },
    { value: GoalStatus.ON_HOLD, label: 'On Hold' }
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(private careerGoalsService: CareerGoalsService) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadGoals(): void {
    this.loading = true;
    
    const goalsSub = this.careerGoalsService.getCareerGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.filteredGoals = [...goals];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.push(goalsSub);
  }

  onStatusFilterChange(status: GoalStatus | 'all'): void {
    this.selectedStatus = status;
    if (status === 'all') {
      this.filteredGoals = [...this.goals];
    } else {
      this.filteredGoals = this.goals.filter(goal => goal.status === status);
    }
  }

  getProgressPercentage(goal: CareerGoal): number {
    if (goal.milestones.length === 0) return goal.progress || 0;
    const completedMilestones = goal.milestones.filter(m => m.completedAt != null).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  }

  getPriorityColor(priority: GoalPriority): string {
    switch (priority) {
      case GoalPriority.CRITICAL: return 'critical';
      case GoalPriority.HIGH: return 'high';
      case GoalPriority.MEDIUM: return 'medium';
      default: return 'low';
    }
  }

  getStatusColor(status: GoalStatus): string {
    switch (status) {
      case GoalStatus.COMPLETED: return 'success';
      case GoalStatus.IN_PROGRESS: return 'progress';
      case GoalStatus.ACTIVE: return 'active';
      case GoalStatus.ON_HOLD: return 'paused';
      default: return 'inactive';
    }
  }

  viewGoalDetails(goal: CareerGoal): void {
    console.log('Viewing goal details:', goal.title);
  }

  editGoal(goal: CareerGoal): void {
    console.log('Editing goal:', goal.title);
  }
}

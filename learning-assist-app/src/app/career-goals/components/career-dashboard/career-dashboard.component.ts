import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CareerGoalsService } from '../../career-goals.service';
import { CareerDashboardData, CareerGoal, SkillGap, MarketInsight } from '../../../models/career-goals.model';

@Component({
  selector: 'app-career-dashboard',
  templateUrl: './career-dashboard.component.html',
  styleUrls: ['./career-dashboard.component.scss']
})
export class CareerDashboardComponent implements OnInit, OnDestroy {
  dashboardData: CareerDashboardData | null = null;
  recentGoals: CareerGoal[] = [];
  prioritySkillGaps: SkillGap[] = [];
  marketInsights: MarketInsight[] = [];
  loading = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private careerGoalsService: CareerGoalsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Load dashboard data
    const dashboardSub = this.careerGoalsService.getDashboardData('user-123').subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });

    // Load recent goals
    const goalsSub = this.careerGoalsService.getCareerGoals().subscribe({
      next: (goals: CareerGoal[]) => {
        this.recentGoals = goals
          .sort((a: CareerGoal, b: CareerGoal) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
      }
    });

    // Load priority skill gaps
    const gapsSub = this.careerGoalsService.getSkillGaps().subscribe({
      next: (gaps) => {
        this.prioritySkillGaps = gaps
          .filter(gap => gap.priority === 'High')
          .slice(0, 5);
      }
    });

    // Load market insights
    const insightsSub = this.careerGoalsService.getMarketInsights().subscribe({
      next: (insights) => {
        this.marketInsights = insights.slice(0, 3);
      }
    });

    this.subscriptions.push(dashboardSub, goalsSub, gapsSub, insightsSub);
  }

  navigateToCareerPaths(): void {
    this.router.navigate(['/career-goals/career-paths']);
  }

  navigateToSkillMatrix(): void {
    this.router.navigate(['/career-goals/skill-matrix']);
  }

  navigateToGoalSetting(): void {
    this.router.navigate(['/career-goals/goal-setting']);
  }

  navigateToGoalTracking(): void {
    this.router.navigate(['/career-goals/goal-tracking']);
  }

  navigateToMarketInsights(): void {
    this.router.navigate(['/career-goals/market-insights']);
  }

  navigateToSkillAssessment(): void {
    this.router.navigate(['/career-goals/skill-assessment']);
  }

  getProgressPercentage(goal: CareerGoal): number {
    if (goal.milestones.length === 0) return 0;
    const completedMilestones = goal.milestones.filter(m => m.completedAt != null).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  }

  getSkillGapColor(gapPercentage: number): string {
    if (gapPercentage >= 70) return 'danger';
    if (gapPercentage >= 40) return 'warning';
    return 'success';
  }

  getPriorityClass(priority: any): string {
    if (typeof priority === 'number') {
      switch(priority) {
        case 1: return 'priority-low';
        case 2: return 'priority-medium';
        case 3: return 'priority-high';
        case 4: return 'priority-critical';
        default: return 'priority-medium';
      }
    }
    return `priority-${priority.toString().toLowerCase()}`;
  }

  getPriorityLabel(priority: any): string {
    if (typeof priority === 'number') {
      switch(priority) {
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        case 4: return 'Critical';
        default: return 'Medium';
      }
    }
    return priority.toString();
  }
}

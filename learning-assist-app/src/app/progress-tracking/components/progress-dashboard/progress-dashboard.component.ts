import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgressTrackingService } from '../../progress-tracking.service';
import { 
  ProgressMetrics, 
  Achievement, 
  Badge, 
  Certificate, 
  LearningGoal, 
  DashboardData 
} from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  recentAchievements: Achievement[] = [];
  recentBadges: Badge[] = [];
  recentCertificates: Certificate[] = [];
  currentGoals: LearningGoal[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private progressService: ProgressTrackingService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentAchievements();
    this.loadCurrentGoals();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    const sub = this.progressService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadRecentAchievements(): void {
    const sub = this.progressService.getRecentAchievements().subscribe({
      next: (achievements) => {
        this.recentAchievements = achievements;
      },
      error: (error) => {
        console.error('Error loading recent achievements:', error);
      }
    });
    this.subscriptions.push(sub);

    const badgeSub = this.progressService.getRecentBadges().subscribe({
      next: (badges) => {
        this.recentBadges = badges;
      },
      error: (error) => {
        console.error('Error loading recent badges:', error);
      }
    });
    this.subscriptions.push(badgeSub);

    const certSub = this.progressService.getRecentCertificates().subscribe({
      next: (certificates) => {
        this.recentCertificates = certificates;
      },
      error: (error) => {
        console.error('Error loading recent certificates:', error);
      }
    });
    this.subscriptions.push(certSub);
  }

  private loadCurrentGoals(): void {
    const sub = this.progressService.getCurrentGoals().subscribe({
      next: (goals) => {
        this.currentGoals = goals;
      },
      error: (error) => {
        console.error('Error loading current goals:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min(Math.round((current / target) * 100), 100);
  }

  getSkillLevelColor(level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'): string {
    const colors = {
      'Beginner': '#f39c12',
      'Intermediate': '#3498db',
      'Advanced': '#27ae60',
      'Expert': '#9b59b6'
    };
    return colors[level] || '#95a5a6';
  }
}

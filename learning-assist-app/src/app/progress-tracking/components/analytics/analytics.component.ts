import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgressTrackingService } from '../../progress-tracking.service';
import { DashboardData } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  Math = Math; // Expose Math to template
  
  private subscriptions: Subscription[] = [];

  constructor(private progressService: ProgressTrackingService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadAnalyticsData(): void {
    const sub = this.progressService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getWeeklyTotal(): number {
    return this.dashboardData?.weeklyActivity.reduce((sum, hours) => sum + hours, 0) || 0;
  }

  getPeakActivityDay(): string {
    if (!this.dashboardData?.weeklyActivity) return 'N/A';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxIndex = this.dashboardData.weeklyActivity.indexOf(
      Math.max(...this.dashboardData.weeklyActivity)
    );
    return days[maxIndex] || 'N/A';
  }
}

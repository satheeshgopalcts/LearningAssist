import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgressTrackingService } from '../../progress-tracking.service';
import { LeaderboardEntry } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  leaderboard: LeaderboardEntry[] = [];
  currentUser: string = 'user-1'; // Mock current user
  
  private subscriptions: Subscription[] = [];

  constructor(private progressService: ProgressTrackingService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadLeaderboard(): void {
    const sub = this.progressService.getLeaderboard().subscribe({
      next: (leaderboard) => {
        this.leaderboard = leaderboard;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.currentUser;
  }

  trackByUserId(index: number, entry: LeaderboardEntry): string {
    return entry.userId;
  }

  isUserInTopTen(): boolean {
    return this.leaderboard.some(entry => 
      entry.userId === this.currentUser && entry.rank <= 10
    );
  }
}

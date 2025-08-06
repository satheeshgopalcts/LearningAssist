import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgressTrackingService } from '../../progress-tracking.service';
import { Achievement, Badge, Certificate } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-achievement-display',
  templateUrl: './achievement-display.component.html',
  styleUrls: ['./achievement-display.component.scss']
})
export class AchievementDisplayComponent implements OnInit, OnDestroy {
  achievements: Achievement[] = [];
  badges: Badge[] = [];
  certificates: Certificate[] = [];
  selectedCategory: string = 'all';
  
  private subscriptions: Subscription[] = [];

  constructor(private progressService: ProgressTrackingService) {}

  ngOnInit(): void {
    this.loadAchievements();
    this.loadBadges();
    this.loadCertificates();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get filteredAchievements(): Achievement[] {
    if (this.selectedCategory === 'all') {
      return this.achievements;
    }
    return this.achievements.filter(a => a.category === this.selectedCategory);
  }

  get unlockedAchievements(): Achievement[] {
    return this.filteredAchievements.filter(a => a.isUnlocked);
  }

  get lockedAchievements(): Achievement[] {
    return this.filteredAchievements.filter(a => !a.isUnlocked);
  }

  private loadAchievements(): void {
    const sub = this.progressService.getAchievements().subscribe({
      next: (achievements) => {
        this.achievements = achievements;
      },
      error: (error) => {
        console.error('Error loading achievements:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadBadges(): void {
    const sub = this.progressService.getBadges().subscribe({
      next: (badges) => {
        this.badges = badges;
      },
      error: (error) => {
        console.error('Error loading badges:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadCertificates(): void {
    const sub = this.progressService.getCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'completion': 'Completion',
      'performance': 'Performance',
      'engagement': 'Engagement',
      'consistency': 'Consistency',
      'skill': 'Skill',
      'milestone': 'Milestone'
    };
    return categoryNames[category] || category;
  }

  getAchievementProgress(achievement: Achievement): number {
    return achievement.progress;
  }

  getBadgesByLevel(level: 'bronze' | 'silver' | 'gold' | 'platinum'): Badge[] {
    return this.badges.filter(b => b.level === level);
  }

  getBadgesByLevelString(level: string): Badge[] {
    return this.getBadgesByLevel(level as 'bronze' | 'silver' | 'gold' | 'platinum');
  }
}

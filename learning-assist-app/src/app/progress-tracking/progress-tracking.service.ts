import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ProgressMetrics,
  Achievement,
  Badge,
  Certificate,
  LeaderboardEntry,
  LearningVelocity,
  StrengthWeakness,
  GoalProgress,
  ComparativeAnalysis,
  ProgressDashboardData,
  AchievementCategory,
  AchievementCriteria,
  DashboardData,
  LearningGoal
} from '../models/progress-tracking.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackingService {
  private progressMetricsSubject = new BehaviorSubject<ProgressMetrics[]>([]);
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private badgesSubject = new BehaviorSubject<Badge[]>([]);
  private certificatesSubject = new BehaviorSubject<Certificate[]>([]);
  private leaderboardSubject = new BehaviorSubject<LeaderboardEntry[]>([]);
  private goalsSubject = new BehaviorSubject<GoalProgress[]>([]);

  constructor() {
    this.initializeMockData();
  }

  // Real-time Progress Monitoring
  trackLessonProgress(lessonId: string, userId: string, timeSpent: number, interactions: number): void {
    const currentMetrics = this.progressMetricsSubject.value;
    const existingIndex = currentMetrics.findIndex(m => m.lessonId === lessonId && m.userId === userId);
    
    const updatedMetric: ProgressMetrics = {
      lessonId,
      userId,
      completionPercentage: Math.min(100, (timeSpent / 30) * 100), // Assuming 30 min average lesson
      timeSpent,
      engagementScore: this.calculateEngagementScore(timeSpent, interactions),
      performanceScore: this.calculatePerformanceScore(timeSpent, interactions),
      startedAt: existingIndex >= 0 ? currentMetrics[existingIndex].startedAt : new Date(),
      lastUpdated: new Date(),
      completedAt: timeSpent >= 30 ? new Date() : undefined,
      interactions,
      revisits: existingIndex >= 0 ? currentMetrics[existingIndex].revisits + 1 : 1
    };

    if (existingIndex >= 0) {
      currentMetrics[existingIndex] = updatedMetric;
    } else {
      currentMetrics.push(updatedMetric);
    }

    this.progressMetricsSubject.next([...currentMetrics]);
    this.checkForNewAchievements(userId, updatedMetric);
  }

  getProgressMetrics(): Observable<ProgressMetrics[]> {
    return this.progressMetricsSubject.asObservable();
  }

  getUserProgressMetrics(userId: string): Observable<ProgressMetrics[]> {
    return this.progressMetricsSubject.pipe(
      map(metrics => metrics.filter(m => m.userId === userId))
    );
  }

  // Achievement & Badge System
  getAchievements(): Observable<Achievement[]> {
    return this.achievementsSubject.asObservable();
  }

  getUserAchievements(userId: string): Observable<Achievement[]> {
    return this.achievementsSubject.pipe(
      map(achievements => achievements.filter(a => a.isUnlocked))
    );
  }

  getBadges(): Observable<Badge[]> {
    return this.badgesSubject.asObservable();
  }

  getCertificates(): Observable<Certificate[]> {
    return this.certificatesSubject.asObservable();
  }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.leaderboardSubject.asObservable();
  }

  // Analytics Dashboard Data - overloaded to work with or without userId
  getDashboardData(): Observable<DashboardData>;
  getDashboardData(userId: string): Observable<DashboardData>;
  getDashboardData(userId?: string): Observable<DashboardData> {
    const actualUserId = userId || 'user-1'; // Default user for demo
    return combineLatest([
      this.getUserProgressMetrics(actualUserId),
      this.getUserAchievements(actualUserId),
      this.getGoals(actualUserId),
      this.getLeaderboard()
    ]).pipe(
      map(([metrics, achievements, goals, leaderboard]) => {
        const learningVelocity = this.calculateLearningVelocity(metrics);
        const strengthsWeaknesses = this.analyzeStrengthsWeaknesses(metrics);
        const comparative = this.getComparativeAnalysis(actualUserId, metrics, leaderboard);

        return {
          overallProgress: this.calculateOverallProgress(metrics),
          learningVelocity,
          recentAchievements: achievements.slice(-5),
          activeGoals: goals.filter(g => !g.isCompleted),
          strengthsWeaknesses,
          comparative,
          weeklyActivity: this.getWeeklyActivity(metrics),
          totalTimeSpent: metrics.reduce((sum, m) => sum + m.timeSpent, 0),
          coursesCompleted: metrics.filter(m => m.completionPercentage === 100).length,
          currentStreak: this.calculateCurrentStreak(metrics)
        };
      })
    );
  }

  getGoals(userId: string): Observable<GoalProgress[]> {
    return this.goalsSubject.pipe(
      map(goals => goals.filter(g => g.goalId.includes(userId)))
    );
  }

  // Additional convenience methods for components
  getRecentAchievements(limit: number = 5): Observable<Achievement[]> {
    return this.getAchievements().pipe(
      map(achievements => achievements
        .filter(a => a.isUnlocked && a.earnedAt)
        .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
        .slice(0, limit)
      )
    );
  }

  getRecentBadges(limit: number = 5): Observable<Badge[]> {
    return this.getBadges().pipe(
      map(badges => badges
        .sort((a, b) => b.earnedDate.getTime() - a.earnedDate.getTime())
        .slice(0, limit)
      )
    );
  }

  getRecentCertificates(limit: number = 3): Observable<Certificate[]> {
    return this.getCertificates().pipe(
      map(certificates => certificates
        .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
        .slice(0, limit)
      )
    );
  }

  getCurrentGoals(): Observable<LearningGoal[]> {
    // Convert GoalProgress to LearningGoal format
    return this.goalsSubject.pipe(
      map(goalProgresses => goalProgresses
        .filter(gp => !gp.isCompleted)
        .map(gp => ({
          id: gp.goalId,
          title: gp.title,
          description: gp.description,
          targetValue: 100, // Since GoalProgress uses progress 0-100
          currentValue: gp.progress,
          unit: 'percent',
          category: 'general',
          deadline: gp.targetDate,
          isCompleted: gp.isCompleted,
          createdAt: gp.createdAt,
          updatedAt: gp.createdAt // GoalProgress doesn't have updatedAt
        } as LearningGoal))
      )
    );
  }

  // Private helper methods
  private calculateEngagementScore(timeSpent: number, interactions: number): number {
    const baseScore = Math.min(80, (timeSpent / 30) * 60);
    const interactionBonus = Math.min(20, interactions * 2);
    return Math.round(baseScore + interactionBonus);
  }

  private calculatePerformanceScore(timeSpent: number, interactions: number): number {
    const efficiencyScore = timeSpent > 0 ? Math.min(100, (interactions / timeSpent) * 50) : 0;
    const completionBonus = timeSpent >= 25 ? 30 : (timeSpent / 25) * 30;
    return Math.round(efficiencyScore + completionBonus);
  }

  private checkForNewAchievements(userId: string, metric: ProgressMetrics): void {
    const achievements = this.achievementsSubject.value;
    
    // Check completion achievements
    if (metric.completionPercentage === 100) {
      const completionAchievement = achievements.find(a => 
        a.category === AchievementCategory.COMPLETION && 
        a.criteria.type === 'completion' &&
        !a.isUnlocked
      );
      
      if (completionAchievement) {
        completionAchievement.isUnlocked = true;
        completionAchievement.earnedAt = new Date();
        completionAchievement.progress = 100;
      }
    }

    // Check performance achievements
    if (metric.performanceScore >= 90) {
      const performanceAchievement = achievements.find(a =>
        a.category === AchievementCategory.PERFORMANCE &&
        a.criteria.type === 'score' &&
        !a.isUnlocked
      );
      
      if (performanceAchievement) {
        performanceAchievement.isUnlocked = true;
        performanceAchievement.earnedAt = new Date();
        performanceAchievement.progress = 100;
      }
    }

    this.achievementsSubject.next([...achievements]);
  }

  private calculateLearningVelocity(metrics: ProgressMetrics[]): LearningVelocity {
    const completedLessons = metrics.filter(m => m.completionPercentage === 100);
    const totalDays = this.getDaysBetween(
      Math.min(...metrics.map(m => m.startedAt.getTime())),
      Date.now()
    );
    
    return {
      lessonsPerDay: totalDays > 0 ? completedLessons.length / totalDays : 0,
      averageTimePerLesson: completedLessons.length > 0 ? 
        completedLessons.reduce((sum, m) => sum + m.timeSpent, 0) / completedLessons.length : 0,
      weeklyTrend: 15.5, // Mock data
      monthlyTrend: 23.2, // Mock data
      consistencyScore: this.calculateConsistencyScore(metrics)
    };
  }

  private analyzeStrengthsWeaknesses(metrics: ProgressMetrics[]): StrengthWeakness[] {
    const skillAreas = ['JavaScript', 'React', 'Angular', 'Python', 'Data Science'];
    return skillAreas.map(skill => ({
      skillArea: skill,
      type: Math.random() > 0.5 ? 'strength' : 'weakness',
      confidence: Math.floor(Math.random() * 40) + 60,
      evidenceCount: Math.floor(Math.random() * 10) + 3,
      improvementSuggestion: `Focus on advanced ${skill} concepts`,
      relatedCourses: [`Advanced ${skill}`, `${skill} Best Practices`]
    }));
  }

  private getComparativeAnalysis(userId: string, metrics: ProgressMetrics[], leaderboard: LeaderboardEntry[]): ComparativeAnalysis {
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    const avgScore = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.performanceScore, 0) / metrics.length : 0;
    
    return {
      userScore: avgScore,
      peerAverageScore: 78.5,
      industryAverageScore: 73.2,
      percentile: userEntry ? (100 - userEntry.rank) : 50,
      comparisonPeriod: 'month',
      improvementAreas: ['Time Management', 'Advanced Concepts'],
      strengthAreas: ['Problem Solving', 'Code Quality']
    };
  }

  private calculateOverallProgress(metrics: ProgressMetrics[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.completionPercentage, 0) / metrics.length;
  }

  private getWeeklyActivity(metrics: ProgressMetrics[]): number[] {
    // Return last 7 days of activity (hours spent each day)
    const weeklyData = new Array(7).fill(0);
    const now = new Date();
    
    metrics.forEach(metric => {
      const daysDiff = Math.floor((now.getTime() - metric.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        weeklyData[6 - daysDiff] += metric.timeSpent / 60; // Convert to hours
      }
    });
    
    return weeklyData;
  }

  private calculateCurrentStreak(metrics: ProgressMetrics[]): number {
    // Calculate consecutive days of learning activity
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayActivity = metrics.some(m => 
        this.isSameDay(m.lastUpdated, checkDate) && m.timeSpent > 0
      );
      
      if (dayActivity) {
        streak++;
      } else if (i > 0) { // Don't break on first day if no activity today
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  }

  private calculateConsistencyScore(metrics: ProgressMetrics[]): number {
    const uniqueDays = new Set(metrics.map(m => 
      m.lastUpdated.toDateString()
    )).size;
    
    const totalDays = this.getDaysBetween(
      Math.min(...metrics.map(m => m.startedAt.getTime())),
      Date.now()
    );
    
    return totalDays > 0 ? Math.round((uniqueDays / totalDays) * 100) : 0;
  }

  private getDaysBetween(start: number, end: number): number {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private initializeMockData(): void {
    // Initialize with sample data
    const mockMetrics: ProgressMetrics[] = [
      {
        lessonId: 'lesson-1',
        userId: 'user-1',
        completionPercentage: 100,
        timeSpent: 35,
        engagementScore: 87,
        performanceScore: 92,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        interactions: 23,
        revisits: 1
      },
      {
        lessonId: 'lesson-2',
        userId: 'user-1',
        completionPercentage: 75,
        timeSpent: 22,
        engagementScore: 78,
        performanceScore: 83,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        interactions: 18,
        revisits: 2
      }
    ];

    const mockAchievements: Achievement[] = [
      {
        id: 'ach-1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        badgeIcon: 'star',
        badgeColor: '#FFD700',
        category: AchievementCategory.COMPLETION,
        criteria: { type: 'completion', threshold: 1, operator: '>=' },
        isUnlocked: true,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        progress: 100
      },
      {
        id: 'ach-2',
        title: 'High Performer',
        description: 'Score 90% or higher on a lesson',
        badgeIcon: 'trophy',
        badgeColor: '#FF6B35',
        category: AchievementCategory.PERFORMANCE,
        criteria: { type: 'score', threshold: 90, operator: '>=' },
        isUnlocked: true,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        progress: 100
      },
      {
        id: 'ach-3',
        title: 'Consistency Champion',
        description: 'Learn for 7 consecutive days',
        badgeIcon: 'calendar',
        badgeColor: '#4ECDC4',
        category: AchievementCategory.CONSISTENCY,
        criteria: { type: 'streak', threshold: 7, operator: '>=' },
        isUnlocked: false,
        progress: 28
      }
    ];

    const mockBadges: Badge[] = [
      {
        id: 'badge-1',
        name: 'First Steps',
        icon: 'star',
        color: '#CD7F32',
        level: 'bronze',
        earnedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        skillArea: 'Programming'
      },
      {
        id: 'badge-2',
        name: 'Quick Learner',
        icon: 'zap',
        color: '#C0C0C0',
        level: 'silver',
        earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        skillArea: 'Learning Speed'
      },
      {
        id: 'badge-3',
        name: 'Streak Master',
        icon: 'fire',
        color: '#FFD700',
        level: 'gold',
        earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        skillArea: 'Consistency'
      }
    ];

    const mockCertificates: Certificate[] = [
      {
        id: 'cert-1',
        title: 'JavaScript Fundamentals Certificate',
        courseName: 'JavaScript Fundamentals', // Added for template compatibility
        description: 'Successfully completed JavaScript Fundamentals course',
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        verificationCode: 'JS-FUND-2024-001',
        verificationUrl: 'https://verify.learningassist.com/JS-FUND-2024-001', // Added for template compatibility
        skillsValidated: ['Variables', 'Functions', 'Objects', 'Arrays'],
        issuedBy: 'Learning Assist Platform',
        issuer: 'Learning Assist Platform', // Added for template compatibility
        certificateUrl: 'https://certificates.learningassist.com/cert-1.pdf'
      },
      {
        id: 'cert-2',
        title: 'Web Development Basics Certificate',
        courseName: 'Web Development Basics', // Added for template compatibility
        description: 'Successfully completed Web Development Basics course',
        issueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        verificationCode: 'WEB-DEV-2024-002',
        verificationUrl: 'https://verify.learningassist.com/WEB-DEV-2024-002', // Added for template compatibility
        skillsValidated: ['HTML', 'CSS', 'Responsive Design'],
        issuedBy: 'Learning Assist Platform',
        issuer: 'Learning Assist Platform', // Added for template compatibility
        certificateUrl: 'https://certificates.learningassist.com/cert-2.pdf'
      }
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        userId: 'user-1',
        username: 'LearningChamp',
        userName: 'LearningChamp', // Added for template compatibility
        totalScore: 1250,
        completedCourses: 5,
        averagePerformance: 88.5,
        currentStreak: 12,
        rank: 3,
        rankChange: 1,
        level: 15, // Added for template compatibility
        totalBadges: 8 // Added for template compatibility
      },
      {
        userId: 'user-2',
        username: 'CodeMaster',
        userName: 'CodeMaster', // Added for template compatibility
        totalScore: 1480,
        completedCourses: 7,
        averagePerformance: 92.1,
        currentStreak: 8,
        rank: 1,
        rankChange: 0,
        level: 22, // Added for template compatibility
        totalBadges: 12 // Added for template compatibility
      },
      {
        userId: 'user-3',
        username: 'QuickLearner',
        userName: 'QuickLearner', // Added for template compatibility
        totalScore: 1350,
        completedCourses: 6,
        averagePerformance: 89.7,
        currentStreak: 15,
        rank: 2,
        rankChange: -1,
        level: 18, // Added for template compatibility
        totalBadges: 10 // Added for template compatibility
      }
    ];

    const mockGoals: GoalProgress[] = [
      {
        goalId: 'goal-user-1-1',
        title: 'Complete JavaScript Fundamentals',
        description: 'Master the basics of JavaScript programming',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 65,
        milestones: [
          {
            id: 'milestone-1',
            title: 'Variables and Data Types',
            description: 'Learn about JavaScript variables and data types',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isCompleted: true,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            progress: 100
          },
          {
            id: 'milestone-2',
            title: 'Functions and Scope',
            description: 'Master JavaScript functions and scope concepts',
            targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            isCompleted: false,
            progress: 30
          }
        ],
        isCompleted: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];

    this.progressMetricsSubject.next(mockMetrics);
    this.achievementsSubject.next(mockAchievements);
    this.badgesSubject.next(mockBadges);
    this.certificatesSubject.next(mockCertificates);
    this.leaderboardSubject.next(mockLeaderboard);
    this.goalsSubject.next(mockGoals);
  }
}

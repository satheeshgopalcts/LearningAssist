export interface ProgressMetrics {
  lessonId: string;
  userId: string;
  completionPercentage: number;
  timeSpent: number; // in minutes
  engagementScore: number; // 0-100
  performanceScore: number; // 0-100
  startedAt: Date;
  lastUpdated: Date;
  completedAt?: Date;
  interactions: number;
  revisits: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  earnedAt?: Date;
  isUnlocked: boolean;
  progress: number; // 0-100
}

export enum AchievementCategory {
  COMPLETION = 'completion',
  PERFORMANCE = 'performance',
  ENGAGEMENT = 'engagement',
  CONSISTENCY = 'consistency',
  SKILL = 'skill',
  MILESTONE = 'milestone'
}

export interface AchievementCriteria {
  type: 'completion' | 'score' | 'streak' | 'time' | 'skill_level';
  threshold: number;
  operator: '>=' | '>' | '=' | '<=' | '<';
  timeframe?: number; // days
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedDate: Date;
  skillArea?: string;
}

export interface Certificate {
  id: string;
  title: string;
  courseName: string; // Added for template compatibility
  description: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationCode: string;
  verificationUrl?: string; // Added for template compatibility
  skillsValidated: string[];
  issuedBy: string;
  issuer: string; // Added for template compatibility
  certificateUrl?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  userName: string; // Added for template compatibility
  avatar?: string;
  totalScore: number;
  completedCourses: number;
  averagePerformance: number;
  currentStreak: number;
  rank: number;
  rankChange: number; // +/- from last period
  level?: number; // Added for template compatibility
  totalBadges?: number; // Added for template compatibility
}

export interface LearningVelocity {
  lessonsPerDay: number;
  averageTimePerLesson: number;
  weeklyTrend: number; // percentage change
  monthlyTrend: number; // percentage change
  consistencyScore: number; // 0-100
}

export interface StrengthWeakness {
  skillArea: string;
  type: 'strength' | 'weakness';
  confidence: number; // 0-100
  evidenceCount: number;
  improvementSuggestion?: string;
  relatedCourses?: string[];
}

export interface GoalProgress {
  goalId: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  milestones: GoalMilestone[];
  isCompleted: boolean;
  createdAt: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface ComparativeAnalysis {
  userScore: number;
  peerAverageScore: number;
  industryAverageScore: number;
  percentile: number;
  comparisonPeriod: 'week' | 'month' | 'quarter' | 'year';
  improvementAreas: string[];
  strengthAreas: string[];
}

export interface ProgressDashboardData {
  overallProgress: number;
  learningVelocity: LearningVelocity;
  recentAchievements: Achievement[];
  activeGoals: GoalProgress[];
  strengthsWeaknesses: StrengthWeakness[];
  comparative: ComparativeAnalysis;
  weeklyActivity: number[];
  totalTimeSpent: number;
  coursesCompleted: number;
  currentStreak: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: string;
  deadline: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DashboardData = ProgressDashboardData;

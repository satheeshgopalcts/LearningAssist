export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  courseSequence: LearningStep[];
  steps: LearningStep[]; // Alias for courseSequence for backward compatibility
  currentStep: number;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // in minutes
  adaptiveSettings: AdaptiveSettings;
  createdAt: Date;
  updatedAt: Date;
  completionRate: number;
}

export interface LearningStep {
  id: string;
  courseId: string;
  contentId: string;
  lessonId?: string;
  title: string;
  type: StepType;
  order: number;
  prerequisites: string[];
  difficulty: DifficultyLevel;
  estimatedTime: number;
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  adaptations: StepAdaptation[];
  status: 'pending' | 'active' | 'completed' | 'skipped';
}

export interface AdaptiveSettings {
  learningStyle: LearningStyleType;
  difficultyProgression: DifficultyProgression;
  adaptationFrequency: AdaptationFrequency;
  interventionThreshold: number; // 0-1 scale
  personalizedRecommendations: boolean;
  realTimeAdjustments: boolean;
}

export interface StepAdaptation {
  id: string;
  type: AdaptationType;
  reason: string;
  appliedAt: Date;
  effectiveness?: number; // measured later
}

export interface ContentRecommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  description: string;
  relevanceScore: number; // 0-1 scale
  confidenceScore: number; // 0-1 scale
  recommendationSource: RecommendationSource;
  tags: string[];
  difficulty: DifficultyLevel;
  estimatedTime: number;
  createdAt: Date;
  userFeedback?: UserFeedback;
}

export interface UserFeedback {
  rating: number; // 1-5 scale
  wasHelpful: boolean;
  comments?: string;
  providedAt: Date;
}

export interface ProgressPrediction {
  id: string;
  userId: string;
  courseId: string;
  predictedCompletionDate: Date;
  successProbability: number; // 0-1 scale
  estimatedStudyHours: number;
  riskFactors: RiskFactor[];
  interventionRecommendations: InterventionRecommendation[];
  confidenceLevel: number; // 0-1 scale
  createdAt: Date;
}

export interface RiskFactor {
  type: RiskType;
  severity: RiskSeverity;
  description: string;
  impact: number; // 0-1 scale
}

export interface InterventionRecommendation {
  type: InterventionType;
  priority: Priority;
  description: string;
  actionItems: string[];
  estimatedEffectiveness: number; // 0-1 scale
}

export interface LearningAnalytics {
  userId: string;
  courseId?: string;
  timeSpent: number; // in minutes
  completionRate: number; // 0-1 scale
  averageScore: number; // 0-100 scale
  engagementMetrics: EngagementMetrics;
  learningVelocity: number; // lessons per day
  retentionRate: number; // 0-1 scale
  difficultyProgression: DifficultyTrend[];
  lastUpdated: Date;
  // Additional properties for dashboard
  averageSessionDuration: number; // in minutes
  streakDays: number;
  weeklyLearningHours: number;
}

export interface EngagementMetrics {
  sessionsPerWeek: number;
  averageSessionDuration: number; // in minutes
  contentInteractionRate: number; // 0-1 scale
  forumParticipation: number;
  assignmentSubmissionRate: number; // 0-1 scale
}

export interface DifficultyTrend {
  date: Date;
  difficulty: DifficultyLevel;
  performance: number; // 0-100 scale
}

// Enums
export enum StepType {
  LESSON = 'lesson',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  ASSESSMENT = 'assessment'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum LearningStyleType {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading-writing'
}

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  AUDIO = 'audio',
  SIMULATION = 'simulation',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment'
}

export enum DifficultyProgression {
  LINEAR = 'linear',
  ADAPTIVE = 'adaptive',
  MASTERY_BASED = 'mastery-based'
}

export enum AdaptationFrequency {
  REAL_TIME = 'real-time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MILESTONE_BASED = 'milestone-based'
}

export enum AdaptationType {
  DIFFICULTY_ADJUSTMENT = 'difficulty-adjustment',
  CONTENT_STYLE_CHANGE = 'content-style-change',
  PACING_MODIFICATION = 'pacing-modification',
  PREREQUISITE_ADDITION = 'prerequisite-addition',
  REMEDIATION = 'remediation',
  ACCELERATION = 'acceleration'
}

export enum RecommendationSource {
  COLLABORATIVE = 'collaborative',
  CONTENT_BASED = 'content-based',
  HYBRID = 'hybrid',
  BEHAVIORAL = 'behavioral',
  KNOWLEDGE_BASED = 'knowledge-based'
}

export enum RiskType {
  LOW_ENGAGEMENT = 'low-engagement',
  POOR_PERFORMANCE = 'poor-performance',
  IRREGULAR_SCHEDULE = 'irregular-schedule',
  DIFFICULTY_MISMATCH = 'difficulty-mismatch',
  LACK_OF_PREREQUISITES = 'lack-of-prerequisites'
}

export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum InterventionType {
  CONTENT_RECOMMENDATION = 'content-recommendation',
  STUDY_SCHEDULE_ADJUSTMENT = 'study-schedule-adjustment',
  TUTOR_ASSIGNMENT = 'tutor-assignment',
  PEER_COLLABORATION = 'peer-collaboration',
  DIFFICULTY_REDUCTION = 'difficulty-reduction',
  ADDITIONAL_RESOURCES = 'additional-resources'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

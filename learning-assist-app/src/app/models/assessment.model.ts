export interface LearningStyleQuestion {
  id: number;
  question: string;
  options: LearningStyleOption[];
  category: LearningStyleType;
}

export interface LearningStyleOption {
  id: string;
  text: string;
  weight: number;
  styleType: LearningStyleType;
}

export enum LearningStyleType {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading-writing'
}

export interface LearningStyleResult {
  visualScore: number;
  auditoryScore: number;
  kinestheticScore: number;
  readingWritingScore: number;
  primaryStyle: LearningStyleType;
  secondaryStyle?: LearningStyleType;
  completedAt: Date;
  recommendations: string[];
}

export interface LearningStyleAssessment {
  id?: string;
  userId: string;
  answers: { [questionId: number]: string };
  result: LearningStyleResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  learningSpeed: number; // 1-10 scale
  engagementLevel: number; // 1-10 scale
  knowledgeRetention: number; // percentage
  behaviorPatterns: BehaviorPattern[];
  lastUpdated: Date;
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  impact: number;
  category: 'navigation' | 'content-interaction' | 'completion' | 'timing';
}

export interface SkillAssessment {
  skillId: string;
  skillName: string;
  currentLevel: number; // 1-10 scale
  targetLevel: number; // 1-10 scale
  gap: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  assessedAt: Date;
}

export interface SkillGapAnalysis {
  id?: string;
  userId: string;
  skills: SkillAssessment[];
  overallScore: number;
  completedAt: Date;
  nextReviewDate: Date;
}

export interface AIRecommendation {
  type: 'content' | 'learning-path' | 'study-method' | 'schedule';
  title: string;
  description: string;
  priority: number;
  confidence: number;
  generatedAt: Date;
}

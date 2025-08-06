// Career Goals & Skill Mapping Models

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  industry: string;
  level: CareerLevel;
  requiredSkills: Skill[];
  recommendedSkills: Skill[];
  averageSalary: SalaryRange;
  jobOutlook: JobOutlook;
  nextSteps: CareerPath[];
  prerequisites: CareerPath[];
  timeToAchieve: number; // in months
  popularity: number; // 0-100
  demandLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  importance: 'Low' | 'Medium' | 'High' | 'Critical';
  marketDemand: number; // 0-100
  difficultyLevel: number; // 1-10
  learningResources: LearningResource[];
  certifications: Certification[];
  relatedSkills: string[]; // skill IDs
  industryStandard: boolean;
  trendingScore: number; // 0-100
  lastUpdated: Date;
}

export interface SkillAssessment {
  id: string;
  skillId: string;
  userId: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  assessmentType: AssessmentType;
  score: number; // 0-100
  completedAt: Date;
  validUntil?: Date;
  assessmentDetails: AssessmentDetail[];
  recommendations: string[];
  nextSteps: string[];
  improvementAreas: string[];
  strengths: string[];
}

export interface CareerGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetCareerPath: CareerPath;
  currentPosition?: CareerPath;
  targetDate: Date;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number; // 0-100
  milestones: Milestone[];
  requiredSkillGaps: SkillGap[];
  estimatedTimeToComplete: number; // in months
  difficultyLevel: number; // 1-10
  motivationLevel: number; // 1-10
  successMetrics: SuccessMetric[];
  createdAt: Date;
  updatedAt: Date;
  isSmartGoal: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: MilestoneStatus;
  progress: number; // 0-100
  dependsOn: string[]; // milestone IDs
  requiredSkills: string[]; // skill IDs
  estimatedEffort: number; // in hours
  priority: number; // 1-10
  completedAt?: Date;
  notes: string;
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gapSize: number; // 1-5 (5 being largest gap)
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedLearningTime: number; // in hours
  recommendedResources: LearningResource[];
  assessmentNeeded: boolean;
  deadline?: Date;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  provider: string;
  url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: number; // in hours
  rating: number; // 0-5
  cost: number; // in USD
  isFree: boolean;
  language: string;
  skillsTargeted: string[]; // skill IDs
  prerequisites: string[];
  certification: boolean;
  lastUpdated: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  description: string;
  skillsValidated: string[]; // skill IDs
  validityPeriod: number; // in years
  cost: number; // in USD
  examFormat: 'Online' | 'In-Person' | 'Hybrid';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  passingScore: number; // percentage
  averagePreparationTime: number; // in hours
  industryRecognition: number; // 0-100
  marketValue: number; // salary impact percentage
  nextExamDates: Date[];
  preparationResources: LearningResource[];
}

export interface MarketInsight {
  industry: string;
  skillId?: string;
  careerPathId?: string;
  region: string;
  averageSalary: SalaryRange;
  jobOpenings: number;
  growthRate: number; // percentage
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  demandTrend: 'Declining' | 'Stable' | 'Growing' | 'High Growth';
  topCompanies: Company[];
  skillDemandRanking: SkillDemandRank[];
  lastUpdated: Date;
  dataSource: string;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  measurementType: 'Quantitative' | 'Qualitative';
  trackingFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  lastMeasured: Date;
  isAchieved: boolean;
}

export interface PeerComparison {
  userId: string;
  targetCareerPath: string;
  averageProgress: number;
  averageTimeToComplete: number;
  commonSkillGaps: string[];
  successRate: number; // percentage
  recommendedResources: string[];
  benchmarkMetrics: BenchmarkMetric[];
}

export interface SkillMatrix {
  userId: string;
  skills: SkillAssessment[];
  overallCompetencyLevel: SkillLevel;
  strengthAreas: string[];
  improvementAreas: string[];
  skillGaps: SkillGap[];
  recommendations: string[];
  lastAssessed: Date;
  nextAssessmentDue: Date;
}

// Enums and Types
export enum CareerLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior', 
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive'
}

export enum SkillCategory {
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  TOOLS = 'tools',
  FRAMEWORKS = 'frameworks',
  LANGUAGES = 'languages',
  CERTIFICATIONS = 'certifications',
  METHODOLOGIES = 'methodologies'
}

export enum SkillLevel {
  NONE = 0,
  BEGINNER = 1,
  NOVICE = 2,
  INTERMEDIATE = 3,
  ADVANCED = 4,
  EXPERT = 5
}

export enum AssessmentType {
  SELF_ASSESSMENT = 'self_assessment',
  PEER_REVIEW = 'peer_review',
  TECHNICAL_TEST = 'technical_test',
  PRACTICAL_PROJECT = 'practical_project',
  CERTIFICATION = 'certification',
  INTERVIEW = 'interview',
  PORTFOLIO_REVIEW = 'portfolio_review'
}

export enum ResourceType {
  COURSE = 'course',
  TUTORIAL = 'tutorial',
  BOOK = 'book',
  ARTICLE = 'article',
  VIDEO = 'video',
  PODCAST = 'podcast',
  PRACTICE = 'practice',
  PROJECT = 'project',
  BOOTCAMP = 'bootcamp',
  WORKSHOP = 'workshop'
}

export enum GoalPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// Supporting Interfaces
export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
  region: string;
  experience: CareerLevel;
}

export interface JobOutlook {
  growthRate: number; // percentage
  timeframe: string; // e.g., "2024-2034"
  demand: 'Low' | 'Medium' | 'High' | 'Very High';
  stability: 'Low' | 'Medium' | 'High';
  automation: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise';
  location: string;
  openPositions: number;
  averageSalary: number;
  rating: number; // 0-5
}

export interface SkillDemandRank {
  skillId: string;
  skillName: string;
  rank: number;
  demandScore: number;
  growthRate: number;
}

export interface BenchmarkMetric {
  name: string;
  userValue: number;
  peerAverage: number;
  industryBest: number;
  unit: string;
}

export interface AssessmentDetail {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer?: string;
  score: number;
  timeSpent: number; // in seconds
  difficulty: number; // 1-10
}

// Dashboard and UI specific interfaces
export interface CareerDashboardData {
  currentGoals: CareerGoal[];
  skillGaps: SkillGap[];
  recentAssessments: SkillAssessment[];
  recommendedPaths: CareerPath[];
  marketInsights: MarketInsight[];
  upcomingMilestones: Milestone[];
  progressSummary: ProgressSummary;
  skillMatrix: SkillMatrix;
}

export interface ProgressSummary {
  overallProgress: number;
  goalsCompleted: number;
  totalGoals: number;
  skillsAcquired: number;
  skillsInProgress: number;
  averageSkillLevel: number;
  timeInvested: number; // in hours
  estimatedTimeToCompletion: number; // in months
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category: string;
  difficultyLevel: DifficultyLevel;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  points: number;
  timeLimit?: number;
  explanation?: string;
  tags: string[];
  codeTemplate?: string;
  testCases?: TestCase[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  CODING = 'coding',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface AdaptiveTest {
  id: string;
  name: string;
  description: string;
  subject: string;
  targetDifficulty: DifficultyLevel;
  maxQuestions: number;
  minQuestions: number;
  timeLimit?: number;
  passingScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
  adaptiveSettings: AdaptiveSettings;
}

export interface AdaptiveSettings {
  initialDifficulty: DifficultyLevel;
  difficultyAdjustmentThreshold: number;
  terminationCriteria: TerminationCriteria;
  itemSelectionStrategy: ItemSelectionStrategy;
  scoringMethod: ScoringMethod;
}

export enum TerminationCriteria {
  FIXED_LENGTH = 'fixed_length',
  PRECISION_BASED = 'precision_based',
  TIME_BASED = 'time_based',
  CONFIDENCE_INTERVAL = 'confidence_interval'
}

export enum ItemSelectionStrategy {
  MAXIMUM_INFORMATION = 'maximum_information',
  RANDOM = 'random',
  CONTENT_BALANCED = 'content_balanced',
  EXPOSURE_CONTROL = 'exposure_control'
}

export enum ScoringMethod {
  THETA_SCORE = 'theta_score',
  PERCENTAGE = 'percentage',
  SCALED_SCORE = 'scaled_score',
  WEIGHTED_SCORE = 'weighted_score'
}

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: TestStatus;
  currentQuestionIndex: number;
  responses: TestResponse[];
  estimatedAbility: number;
  standardError: number;
  score?: TestScore;
  timeSpent: number;
  securityFlags: SecurityFlag[];
}

export enum TestStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review'
}

export interface TestResponse {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  timestamp: Date;
  isCorrect?: boolean;
  points?: number;
  confidence?: number;
  flaggedForReview: boolean;
}

export interface TestScore {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  scaledScore: number;
  thetaScore: number;
  standardError: number;
  passingStatus: PassingStatus;
  breakdown: ScoreBreakdown[];
}

export enum PassingStatus {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL_PASS = 'conditional_pass',
  UNDER_REVIEW = 'under_review'
}

export interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  percentage: number;
  questionsAttempted: number;
  questionsCorrect: number;
}

export interface SecurityFlag {
  type: SecurityFlagType;
  description: string;
  timestamp: Date;
  severity: SecuritySeverity;
  resolved: boolean;
}

export enum SecurityFlagType {
  BROWSER_FOCUS_LOSS = 'browser_focus_loss',
  COPY_PASTE_DETECTED = 'copy_paste_detected',
  MULTIPLE_TABS = 'multiple_tabs',
  SUSPICIOUS_TIMING = 'suspicious_timing',
  IP_ADDRESS_CHANGE = 'ip_address_change',
  USER_AGENT_CHANGE = 'user_agent_change',
  EXTERNAL_HELP_DETECTED = 'external_help_detected'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface GradingRubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
  totalPoints: number;
  scalingFactor: number;
  isActive: boolean;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  qualityIndicators: string[];
}

export interface AutoGradingResult {
  questionId: string;
  responseId: string;
  score: number;
  maxScore: number;
  feedback: string;
  gradingMethod: GradingMethod;
  confidence: number;
  detailedAnalysis: GradingAnalysis;
  timestamp: Date;
}

export enum GradingMethod {
  EXACT_MATCH = 'exact_match',
  PATTERN_MATCHING = 'pattern_matching',
  SEMANTIC_ANALYSIS = 'semantic_analysis',
  CODE_EXECUTION = 'code_execution',
  RUBRIC_BASED = 'rubric_based',
  ML_CLASSIFICATION = 'ml_classification'
}

export interface GradingAnalysis {
  keywordsFound: string[];
  keywordsMissing: string[];
  grammarErrors: number;
  spellingErrors: number;
  readabilityScore: number;
  sentimentScore: number;
  topicRelevance: number;
  codeMetrics?: CodeMetrics;
}

export interface CodeMetrics {
  syntaxErrors: string[];
  testCasesPassed: number;
  testCasesFailed: number;
  executionTime: number;
  memoryUsage: number;
  codeComplexity: number;
  codeStyle: CodeStyleAnalysis;
}

export interface CodeStyleAnalysis {
  indentationScore: number;
  namingConventionScore: number;
  commentScore: number;
  overallScore: number;
  suggestions: string[];
}

export interface PerformanceAnalytics {
  userId: string;
  testId: string;
  overallScore: number;
  timeSpent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  difficultyProgression: DifficultyProgression[];
  categoryPerformance: CategoryPerformance[];
  learningGains: LearningGain[];
  recommendations: PerformanceRecommendation[];
}

export interface DifficultyProgression {
  questionIndex: number;
  difficultyLevel: DifficultyLevel;
  estimatedAbility: number;
  standardError: number;
  isCorrect: boolean;
}

export interface CategoryPerformance {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAttempted: number;
  averageTime: number;
  strengthLevel: StrengthLevel;
}

export enum StrengthLevel {
  WEAK = 'weak',
  DEVELOPING = 'developing',
  PROFICIENT = 'proficient',
  ADVANCED = 'advanced',
  MASTERY = 'mastery'
}

export interface LearningGain {
  category: string;
  preTestScore: number;
  postTestScore: number;
  improvement: number;
  improvementPercentage: number;
  significance: StatisticalSignificance;
}

export enum StatisticalSignificance {
  NOT_SIGNIFICANT = 'not_significant',
  MARGINAL = 'marginal',
  SIGNIFICANT = 'significant',
  HIGHLY_SIGNIFICANT = 'highly_significant'
}

export interface PerformanceRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  estimatedTimeToImprove: number;
  resources: RecommendedResource[];
}

export enum RecommendationType {
  STUDY_FOCUS = 'study_focus',
  PRACTICE_MORE = 'practice_more',
  REVIEW_BASICS = 'review_basics',
  ADVANCED_TOPICS = 'advanced_topics',
  TIME_MANAGEMENT = 'time_management',
  TEST_STRATEGIES = 'test_strategies'
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RecommendedResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  description: string;
  estimatedDuration: number;
  relevanceScore: number;
}

export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PRACTICE_QUIZ = 'practice_quiz',
  INTERACTIVE_LESSON = 'interactive_lesson',
  TEXTBOOK = 'textbook',
  ONLINE_COURSE = 'online_course'
}

export interface BenchmarkData {
  category: string;
  userScore: number;
  peerAverage: number;
  industryAverage: number;
  topPercentile: number;
  userPercentileRank: number;
  comparisonGroup: ComparisonGroup;
  sampleSize: number;
}

export enum ComparisonGroup {
  ALL_USERS = 'all_users',
  SAME_LEVEL = 'same_level',
  SAME_INSTITUTION = 'same_institution',
  INDUSTRY_PEERS = 'industry_peers',
  CERTIFICATION_CANDIDATES = 'certification_candidates'
}

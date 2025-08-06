export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  format: ResourceFormat;
  source: ResourceSource;
  url: string;
  thumbnailUrl?: string;
  author: string;
  publishedDate: Date;
  lastUpdated: Date;
  rating: number; // 0-5
  reviewCount: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  isBookmarked: boolean;
  isFeatured: boolean;
  language: string;
  popularity: number; // 0-100
  relevanceScore?: number; // AI-calculated relevance
}

export enum ResourceType {
  COURSE = 'course',
  ARTICLE = 'article',
  VIDEO = 'video',
  TUTORIAL = 'tutorial',
  PRACTICE = 'practice',
  EBOOK = 'ebook',
  PODCAST = 'podcast',
  WEBINAR = 'webinar',
  DOCUMENTATION = 'documentation',
  EXERCISE = 'exercise'
}

export enum ResourceFormat {
  TEXT = 'text',
  VIDEO = 'video',
  AUDIO = 'audio',
  INTERACTIVE = 'interactive',
  PDF = 'pdf',
  SLIDESHOW = 'slideshow',
  QUIZ = 'quiz',
  SIMULATION = 'simulation'
}

export enum ResourceSource {
  INTERNAL = 'internal',
  COURSERA = 'coursera',
  UDEMY = 'udemy',
  YOUTUBE = 'youtube',
  MEDIUM = 'medium',
  GITHUB = 'github',
  STACKOVERFLOW = 'stackoverflow',
  MDN = 'mdn',
  W3SCHOOLS = 'w3schools',
  FREECODECAMP = 'freecodecamp',
  PLURALSIGHT = 'pluralsight',
  LINKEDIN_LEARNING = 'linkedin_learning',
  EXPERT_CURATED = 'expert_curated',
  COMMUNITY = 'community'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface ResourceRecommendation {
  resource: LearningResource;
  recommendationReason: string;
  confidenceScore: number; // 0-1
  personalizedNote?: string;
  estimatedCompletionTime: number;
  adaptedContent?: AdaptedContent;
}

export interface AdaptedContent {
  originalDifficulty: DifficultyLevel;
  adaptedDifficulty: DifficultyLevel;
  contentModifications: ContentModification[];
  learningStyleOptimizations: LearningStyleOptimization[];
}

export interface ContentModification {
  type: 'simplify' | 'elaborate' | 'example_add' | 'visual_aid' | 'interactive_element';
  description: string;
  rationale: string;
}

export interface LearningStyleOptimization {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  optimization: string;
  implementation: string;
}

export interface ResourceFilter {
  categories: string[];
  types: ResourceType[];
  difficulties: DifficultyLevel[];
  sources: ResourceSource[];
  duration: {
    min: number;
    max: number;
  };
  rating: {
    min: number;
    max: number;
  };
  tags: string[];
  language: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

export interface SearchCriteria {
  query: string;
  filters: Partial<ResourceFilter>;
  sortBy: SortOption;
  includeSimilar: boolean;
  personalizeResults: boolean;
}

export enum SortOption {
  RELEVANCE = 'relevance',
  RATING = 'rating',
  POPULARITY = 'popularity',
  DATE_PUBLISHED = 'date_published',
  DURATION = 'duration',
  DIFFICULTY = 'difficulty',
  ALPHABETICAL = 'alphabetical'
}

export interface ResourceCollection {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  resources: LearningResource[];
  isPublic: boolean;
  tags: string[];
  category: string;
  collaborators: string[];
}

export interface ExpertCuratedContent {
  expertId: string;
  expertName: string;
  expertCredentials: string[];
  curationDate: Date;
  resources: LearningResource[];
  curatorNotes: string;
  specialization: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

export interface CommunityResource {
  resource: LearningResource;
  contributorId: string;
  contributorName: string;
  submissionDate: Date;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  communityRating: number;
  reviewCount: number;
  reportCount: number;
}

export interface PersonalizationProfile {
  userId: string;
  learningStyle: string;
  currentSkillLevel: { [skill: string]: DifficultyLevel };
  preferredFormats: ResourceFormat[];
  timeAvailability: number; // minutes per day
  careerGoals: string[];
  completedResources: string[];
  bookmarkedResources: string[];
  ratingHistory: { [resourceId: string]: number };
  searchHistory: string[];
  engagementMetrics: {
    averageTimePerResource: number;
    completionRate: number;
    preferredDuration: number;
  };
}

export interface RecommendationEngine {
  generateRecommendations(
    userId: string,
    context?: RecommendationContext
  ): Promise<ResourceRecommendation[]>;
  
  updatePersonalizationProfile(
    userId: string,
    interaction: UserInteraction
  ): Promise<void>;
  
  getContentAdaptation(
    resource: LearningResource,
    userProfile: PersonalizationProfile
  ): Promise<AdaptedContent>;
}

export interface RecommendationContext {
  currentTopic?: string;
  learningGoal?: string;
  timeAvailable?: number;
  preferredDifficulty?: DifficultyLevel;
  justInTimeContext?: string;
}

export interface UserInteraction {
  resourceId: string;
  interactionType: InteractionType;
  timestamp: Date;
  duration?: number;
  rating?: number;
  completed?: boolean;
  feedback?: string;
}

export enum InteractionType {
  VIEW = 'view',
  BOOKMARK = 'bookmark',
  SHARE = 'share',
  RATE = 'rate',
  COMPLETE = 'complete',
  DOWNLOAD = 'download',
  SEARCH = 'search',
  FILTER = 'filter'
}

export interface ResourceMetrics {
  totalViews: number;
  uniqueViews: number;
  completionRate: number;
  averageRating: number;
  bookmarkCount: number;
  shareCount: number;
  downloadCount: number;
  timeSpentAverage: number;
  dropOffPoints: number[];
  userFeedback: ResourceFeedback[];
}

export interface ResourceFeedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  helpful: number; // upvotes
  categories: FeedbackCategory[];
}

export enum FeedbackCategory {
  CONTENT_QUALITY = 'content_quality',
  CLARITY = 'clarity',
  ACCURACY = 'accuracy',
  RELEVANCE = 'relevance',
  DIFFICULTY = 'difficulty',
  PRESENTATION = 'presentation'
}

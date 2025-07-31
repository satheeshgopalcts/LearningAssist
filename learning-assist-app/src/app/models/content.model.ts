export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficultyLevel: DifficultyLevel;
  prerequisites: string[];
  learningObjectives: string[];
  instructor: string;
  duration: number; // in minutes
  contentItems: ContentItem[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface ContentItem {
  id: string;
  courseId: string;
  title: string;
  type: ContentType;
  content: any; // Polymorphic content based on type
  order: number;
  duration?: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonContent {
  id: string;
  title: string;
  htmlContent: string;
  attachments: Attachment[];
}

export interface VideoContent {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  transcription?: string;
  chapters?: VideoChapter[];
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;
}

export interface QuizContent {
  id: string;
  title: string;
  instructions: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  allowRetakes: boolean;
  maxAttempts?: number;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers: string[];
  explanation?: string;
  points: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: Date;
  maxPoints: number;
  submissionType: SubmissionType;
  autoGrade: boolean;
  rubric?: AssignmentRubric;
}

export interface AssignmentRubric {
  id: string;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: ContentCategory[];
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export enum ContentType {
  LESSON = 'lesson',
  VIDEO = 'video',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  SIMULATION = 'simulation',
  RESOURCE = 'resource'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  DRAG_AND_DROP = 'drag_and_drop',
  MATCHING = 'matching'
}

export enum SubmissionType {
  TEXT = 'text',
  FILE_UPLOAD = 'file_upload',
  ONLINE = 'online',
  NONE = 'none'
}

export interface ContentFilter {
  category?: string;
  tags?: string[];
  difficultyLevel?: DifficultyLevel;
  contentType?: ContentType;
  searchQuery?: string;
  sortBy?: 'title' | 'created' | 'updated' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

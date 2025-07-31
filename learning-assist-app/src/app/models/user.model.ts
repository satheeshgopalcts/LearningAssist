export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: UserRole;
  isEmailVerified: boolean;
  careerGoals: string[];
  learningPreferences: LearningPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPreferences {
  learningStyle: LearningStyle;
  preferredContentTypes: ContentType[];
  difficultyLevel: DifficultyLevel;
  studyTimePreference: StudyTime;
  notificationSettings: NotificationSettings;
}

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  CONTENT_CREATOR = 'content_creator'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing'
}

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  AUDIO = 'audio',
  SIMULATION = 'simulation'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum StudyTime {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  FLEXIBLE = 'flexible'
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyProgress: boolean;
  courseUpdates: boolean;
  achievementAlerts: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  firstName: string;
  lastName: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

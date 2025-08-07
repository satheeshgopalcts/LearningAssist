export interface DiscussionForum {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  category: ForumCategory;
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  topics: ForumTopic[];
  moderators: string[];
  isActive: boolean;
  rules: string[];
  participantCount: number;
}

export interface ForumTopic {
  id: string;
  forumId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  lastReplyAt: Date;
  views: number;
  replies: ForumReply[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  upvotes: number;
  downvotes: number;
  status: TopicStatus;
}

export interface ForumReply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  editedAt?: Date;
  upvotes: number;
  downvotes: number;
  parentReplyId?: string;
  isBestAnswer: boolean;
  attachments: string[];
}

export interface VirtualClassroom {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: ClassroomStatus;
  participants: ClassroomParticipant[];
  maxParticipants: number;
  recordingUrl?: string;
  whiteboard: WhiteboardData;
  chatMessages: ChatMessage[];
  features: ClassroomFeature[];
  settings: ClassroomSettings;
}

export interface ClassroomParticipant {
  userId: string;
  name: string;
  email: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt?: Date;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  attendance: AttendanceStatus;
}

export interface WhiteboardData {
  id: string;
  classroomId: string;
  content: WhiteboardElement[];
  currentPage: number;
  totalPages: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

export interface WhiteboardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: any;
  createdBy: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: MessageType;
  isPrivate: boolean;
  recipientId?: string;
}

export interface CollaborativeProject {
  id: string;
  title: string;
  description: string;
  courseId: string;
  createdBy: string;
  createdAt: Date;
  deadline: Date;
  status: ProjectStatus;
  teams: ProjectTeam[];
  requirements: string[];
  deliverables: Deliverable[];
  evaluationCriteria: EvaluationCriterion[];
  resources: ProjectResource[];
  maxTeamSize: number;
  minTeamSize: number;
}

export interface ProjectTeam {
  id: string;
  projectId: string;
  name: string;
  description: string;
  members: TeamMember[];
  leader: string;
  createdAt: Date;
  progress: number;
  submissions: TeamSubmission[];
  evaluations: TeamEvaluation[];
  collaborativeTools: CollaborativeTool[];
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: Date;
  contribution: number;
  skills: string[];
  availability: Availability[];
  performanceRating: number;
}

export interface TeamSubmission {
  id: string;
  teamId: string;
  title: string;
  description: string;
  files: SubmissionFile[];
  submittedBy: string;
  submittedAt: Date;
  version: number;
  feedback: SubmissionFeedback[];
  grade?: number;
  status: SubmissionStatus;
}

export interface SubmissionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TeamEvaluation {
  id: string;
  teamId: string;
  evaluatorId: string;
  evaluatorType: EvaluatorType;
  criteria: EvaluationScore[];
  overallScore: number;
  feedback: string;
  evaluatedAt: Date;
  isPublic: boolean;
}

export interface EvaluationScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface CollaborativeTool {
  id: string;
  name: string;
  type: ToolType;
  url: string;
  isActive: boolean;
  permissions: ToolPermission[];
  lastUsed: Date;
  usageStats: ToolUsageStats;
}

export interface MentoringSession {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  status: SessionStatus;
  type: SessionType;
  topics: string[];
  notes: string;
  rating?: number;
  feedback?: string;
  followUpActions: string[];
}

export interface ExpertQASession {
  id: string;
  expertId: string;
  expertName: string;
  expertise: string[];
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  maxParticipants: number;
  participants: string[];
  questions: QAQuestion[];
  status: SessionStatus;
  recordingUrl?: string;
  tags: string[];
}

export interface QAQuestion {
  id: string;
  sessionId: string;
  question: string;
  askedBy: string;
  askedAt: Date;
  answer?: string;
  answeredAt?: Date;
  upvotes: number;
  isAnswered: boolean;
  priority: QuestionPriority;
}

// Enums
export enum ForumCategory {
  COURSE_SPECIFIC = 'course_specific',
  GENERAL_DISCUSSION = 'general_discussion',
  TECHNICAL_HELP = 'technical_help',
  CAREER_ADVICE = 'career_advice',
  STUDY_GROUPS = 'study_groups',
  ANNOUNCEMENTS = 'announcements'
}

export enum TopicStatus {
  OPEN = 'open',
  ANSWERED = 'answered',
  CLOSED = 'closed',
  PINNED = 'pinned',
  LOCKED = 'locked'
}

export enum ClassroomStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  RECORDING = 'recording'
}

export enum ParticipantRole {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  ASSISTANT = 'assistant',
  MODERATOR = 'moderator'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  LEFT_EARLY = 'left_early'
}

export enum ElementType {
  TEXT = 'text',
  DRAWING = 'drawing',
  SHAPE = 'shape',
  IMAGE = 'image',
  STICKY_NOTE = 'sticky_note'
}

export enum MessageType {
  TEXT = 'text',
  EMOJI = 'emoji',
  FILE = 'file',
  SYSTEM = 'system',
  POLL = 'poll'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TeamRole {
  LEADER = 'leader',
  MEMBER = 'member',
  COORDINATOR = 'coordinator',
  SPECIALIST = 'specialist'
}

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  NEEDS_REVISION = 'needs_revision',
  APPROVED = 'approved',
  GRADED = 'graded'
}

export enum EvaluatorType {
  INSTRUCTOR = 'instructor',
  PEER = 'peer',
  SELF = 'self',
  EXTERNAL = 'external'
}

export enum ToolType {
  DOCUMENT_EDITOR = 'document_editor',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  CODE_EDITOR = 'code_editor',
  DESIGN_TOOL = 'design_tool',
  COMMUNICATION = 'communication'
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum SessionType {
  ONE_ON_ONE = 'one_on_one',
  GROUP = 'group',
  WORKSHOP = 'workshop',
  OFFICE_HOURS = 'office_hours'
}

export enum QuestionPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ClassroomFeature {
  VIDEO_CONFERENCE = 'video_conference',
  SCREEN_SHARE = 'screen_share',
  WHITEBOARD = 'whiteboard',
  CHAT = 'chat',
  RECORDING = 'recording',
  POLLS = 'polls',
  BREAKOUT_ROOMS = 'breakout_rooms'
}

// Supporting interfaces
export interface ClassroomSettings {
  allowStudentMic: boolean;
  allowStudentCamera: boolean;
  allowStudentScreenShare: boolean;
  enableChat: boolean;
  enableRecording: boolean;
  autoStartRecording: boolean;
  enableWaitingRoom: boolean;
  requirePasswordEntry: boolean;
  password?: string;
}

export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  weight: number;
  status: DeliverableStatus;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  rubric: RubricLevel[];
}

export interface RubricLevel {
  level: number;
  name: string;
  description: string;
  points: number;
}

export interface ProjectResource {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  description: string;
  isRequired: boolean;
}

export interface SubmissionFeedback {
  id: string;
  providerId: string;
  providerName: string;
  content: string;
  rating: number;
  createdAt: Date;
  type: FeedbackType;
}

export interface ToolPermission {
  userId: string;
  permission: Permission;
  grantedAt: Date;
}

export interface ToolUsageStats {
  totalUsage: number;
  lastUsed: Date;
  averageSessionDuration: number;
  topUsers: string[];
}

export enum DeliverableStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

export enum ResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  TOOL = 'tool',
  TEMPLATE = 'template'
}

export enum FeedbackType {
  POSITIVE = 'positive',
  CONSTRUCTIVE = 'constructive',
  SUGGESTION = 'suggestion',
  QUESTION = 'question'
}

export enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin',
  COMMENT = 'comment'
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  DiscussionForum,
  ForumTopic,
  ForumReply,
  VirtualClassroom,
  CollaborativeProject,
  ProjectTeam,
  MentoringSession,
  ExpertQASession,
  ForumCategory,
  TopicStatus,
  ClassroomStatus,
  ProjectStatus,
  SessionStatus,
  ParticipantRole,
  TeamRole,
  ClassroomFeature,
  MessageType,
  AttendanceStatus
} from '../models/interactive-learning.model';

@Injectable({
  providedIn: 'root'
})
export class InteractiveLearningService {
  private forumsSubject = new BehaviorSubject<DiscussionForum[]>([]);
  private classroomsSubject = new BehaviorSubject<VirtualClassroom[]>([]);
  private projectsSubject = new BehaviorSubject<CollaborativeProject[]>([]);
  private mentoringSessions = new BehaviorSubject<MentoringSession[]>([]);
  private qaSessionsSubject = new BehaviorSubject<ExpertQASession[]>([]);

  public forums$ = this.forumsSubject.asObservable();
  public classrooms$ = this.classroomsSubject.asObservable();
  public projects$ = this.projectsSubject.asObservable();
  public mentoringSessions$ = this.mentoringSessions.asObservable();
  public qaSessions$ = this.qaSessionsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Discussion Forums Methods
  getForums(): Observable<DiscussionForum[]> {
    return this.forums$;
  }

  getForumById(id: string): Observable<DiscussionForum | undefined> {
    return this.forums$.pipe(
      map(forums => forums.find(forum => forum.id === id))
    );
  }

  getForumsByCategory(category: ForumCategory): Observable<DiscussionForum[]> {
    return this.forums$.pipe(
      map(forums => forums.filter(forum => forum.category === category))
    );
  }

  createForum(forum: Partial<DiscussionForum>): Observable<DiscussionForum> {
    const newForum: DiscussionForum = {
      id: this.generateId(),
      title: forum.title || '',
      description: forum.description || '',
      category: forum.category || ForumCategory.GENERAL_DISCUSSION,
      createdBy: forum.createdBy || 'current-user',
      createdAt: new Date(),
      lastActivity: new Date(),
      topics: [],
      moderators: [forum.createdBy || 'current-user'],
      isActive: true,
      rules: [
        'Be respectful and constructive',
        'Stay on topic',
        'No spam or self-promotion',
        'Use appropriate language',
        'Search before posting'
      ],
      participantCount: 0,
      courseId: forum.courseId
    };

    const currentForums = this.forumsSubject.value;
    this.forumsSubject.next([...currentForums, newForum]);
    return of(newForum).pipe(delay(500));
  }

  createTopic(forumId: string, topic: Partial<ForumTopic>): Observable<ForumTopic> {
    const newTopic: ForumTopic = {
      id: this.generateId(),
      forumId,
      title: topic.title || '',
      content: topic.content || '',
      authorId: topic.authorId || 'current-user',
      authorName: topic.authorName || 'Current User',
      createdAt: new Date(),
      lastReplyAt: new Date(),
      views: 0,
      replies: [],
      tags: topic.tags || [],
      isPinned: false,
      isLocked: false,
      upvotes: 0,
      downvotes: 0,
      status: TopicStatus.OPEN
    };

    const forums = this.forumsSubject.value;
    const updatedForums = forums.map(forum => {
      if (forum.id === forumId) {
        return {
          ...forum,
          topics: [...forum.topics, newTopic],
          lastActivity: new Date(),
          participantCount: forum.participantCount + 1
        };
      }
      return forum;
    });

    this.forumsSubject.next(updatedForums);
    return of(newTopic).pipe(delay(500));
  }

  replyToTopic(topicId: string, reply: Partial<ForumReply>): Observable<ForumReply> {
    const newReply: ForumReply = {
      id: this.generateId(),
      topicId,
      content: reply.content || '',
      authorId: reply.authorId || 'current-user',
      authorName: reply.authorName || 'Current User',
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isBestAnswer: false,
      attachments: reply.attachments || [],
      parentReplyId: reply.parentReplyId
    };

    const forums = this.forumsSubject.value;
    const updatedForums = forums.map(forum => ({
      ...forum,
      topics: forum.topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            replies: [...topic.replies, newReply],
            lastReplyAt: new Date()
          };
        }
        return topic;
      }),
      lastActivity: new Date()
    }));

    this.forumsSubject.next(updatedForums);
    return of(newReply).pipe(delay(500));
  }

  // Virtual Classroom Methods
  getClassrooms(): Observable<VirtualClassroom[]> {
    return this.classrooms$;
  }

  getClassroomById(id: string): Observable<VirtualClassroom | undefined> {
    return this.classrooms$.pipe(
      map(classrooms => classrooms.find(classroom => classroom.id === id))
    );
  }

  createClassroom(classroom: Partial<VirtualClassroom>): Observable<VirtualClassroom> {
    const newClassroom: VirtualClassroom = {
      id: this.generateId(),
      courseId: classroom.courseId || '',
      title: classroom.title || '',
      description: classroom.description || '',
      instructorId: classroom.instructorId || 'current-user',
      instructorName: classroom.instructorName || 'Current Instructor',
      scheduledStart: classroom.scheduledStart || new Date(),
      scheduledEnd: classroom.scheduledEnd || new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: ClassroomStatus.SCHEDULED,
      participants: [],
      maxParticipants: classroom.maxParticipants || 50,
      whiteboard: {
        id: this.generateId(),
        classroomId: '',
        content: [],
        currentPage: 1,
        totalPages: 1,
        lastModifiedBy: classroom.instructorId || 'current-user',
        lastModifiedAt: new Date()
      },
      chatMessages: [],
      features: classroom.features || [
        ClassroomFeature.VIDEO_CONFERENCE,
        ClassroomFeature.CHAT,
        ClassroomFeature.SCREEN_SHARE,
        ClassroomFeature.WHITEBOARD
      ],
      settings: {
        allowStudentMic: true,
        allowStudentCamera: true,
        allowStudentScreenShare: false,
        enableChat: true,
        enableRecording: false,
        autoStartRecording: false,
        enableWaitingRoom: false,
        requirePasswordEntry: false
      }
    };

    newClassroom.whiteboard.classroomId = newClassroom.id;

    const currentClassrooms = this.classroomsSubject.value;
    this.classroomsSubject.next([...currentClassrooms, newClassroom]);
    return of(newClassroom).pipe(delay(500));
  }

  joinClassroom(classroomId: string, userId: string, userName: string): Observable<boolean> {
    const classrooms = this.classroomsSubject.value;
    const updatedClassrooms = classrooms.map(classroom => {
      if (classroom.id === classroomId && classroom.participants.length < classroom.maxParticipants) {
        const participant = {
          userId,
          name: userName,
          email: `${userId}@example.com`,
          role: ParticipantRole.STUDENT,
          joinedAt: new Date(),
          micEnabled: false,
          cameraEnabled: false,
          screenSharing: false,
          attendance: AttendanceStatus.PRESENT
        };

        return {
          ...classroom,
          participants: [...classroom.participants, participant]
        };
      }
      return classroom;
    });

    this.classroomsSubject.next(updatedClassrooms);
    return of(true).pipe(delay(500));
  }

  // Collaborative Projects Methods
  getProjects(): Observable<CollaborativeProject[]> {
    return this.projects$;
  }

  getProjectById(id: string): Observable<CollaborativeProject | undefined> {
    return this.projects$.pipe(
      map(projects => projects.find(project => project.id === id))
    );
  }

  createProject(project: Partial<CollaborativeProject>): Observable<CollaborativeProject> {
    const newProject: CollaborativeProject = {
      id: this.generateId(),
      title: project.title || '',
      description: project.description || '',
      courseId: project.courseId || '',
      createdBy: project.createdBy || 'current-user',
      createdAt: new Date(),
      deadline: project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: ProjectStatus.PLANNING,
      teams: [],
      requirements: project.requirements || [
        'Follow project guidelines',
        'Submit all deliverables on time',
        'Participate actively in team collaboration',
        'Document your work properly'
      ],
      deliverables: [
        {
          id: this.generateId(),
          title: 'Project Proposal',
          description: 'Initial project proposal and plan',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          weight: 20,
          status: 'not_started' as any
        },
        {
          id: this.generateId(),
          title: 'Progress Report',
          description: 'Mid-project progress report',
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          weight: 30,
          status: 'not_started' as any
        },
        {
          id: this.generateId(),
          title: 'Final Submission',
          description: 'Complete project deliverable',
          dueDate: project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          weight: 50,
          status: 'not_started' as any
        }
      ],
      evaluationCriteria: [
        {
          id: this.generateId(),
          name: 'Technical Quality',
          description: 'Quality of technical implementation',
          weight: 40,
          maxScore: 100,
          rubric: [
            { level: 4, name: 'Excellent', description: 'Outstanding technical quality', points: 90 },
            { level: 3, name: 'Good', description: 'Good technical implementation', points: 75 },
            { level: 2, name: 'Satisfactory', description: 'Meets basic technical requirements', points: 60 },
            { level: 1, name: 'Needs Improvement', description: 'Technical quality below expectations', points: 40 }
          ]
        },
        {
          id: this.generateId(),
          name: 'Collaboration',
          description: 'Effectiveness of team collaboration',
          weight: 30,
          maxScore: 100,
          rubric: [
            { level: 4, name: 'Excellent', description: 'Exceptional collaboration', points: 90 },
            { level: 3, name: 'Good', description: 'Good teamwork', points: 75 },
            { level: 2, name: 'Satisfactory', description: 'Adequate collaboration', points: 60 },
            { level: 1, name: 'Needs Improvement', description: 'Poor collaboration', points: 40 }
          ]
        },
        {
          id: this.generateId(),
          name: 'Documentation',
          description: 'Quality of project documentation',
          weight: 30,
          maxScore: 100,
          rubric: [
            { level: 4, name: 'Excellent', description: 'Comprehensive documentation', points: 90 },
            { level: 3, name: 'Good', description: 'Good documentation', points: 75 },
            { level: 2, name: 'Satisfactory', description: 'Basic documentation', points: 60 },
            { level: 1, name: 'Needs Improvement', description: 'Inadequate documentation', points: 40 }
          ]
        }
      ],
      resources: [
        {
          id: this.generateId(),
          name: 'Project Template',
          type: 'template' as any,
          url: '/resources/project-template.docx',
          description: 'Standard project template',
          isRequired: true
        },
        {
          id: this.generateId(),
          name: 'Collaboration Guide',
          type: 'document' as any,
          url: '/resources/collaboration-guide.pdf',
          description: 'Best practices for team collaboration',
          isRequired: false
        }
      ],
      maxTeamSize: project.maxTeamSize || 5,
      minTeamSize: project.minTeamSize || 2
    };

    const currentProjects = this.projectsSubject.value;
    this.projectsSubject.next([...currentProjects, newProject]);
    return of(newProject).pipe(delay(500));
  }

  createTeam(projectId: string, team: Partial<ProjectTeam>): Observable<ProjectTeam> {
    const newTeam: ProjectTeam = {
      id: this.generateId(),
      projectId,
      name: team.name || '',
      description: team.description || '',
      members: [],
      leader: team.leader || 'current-user',
      createdAt: new Date(),
      progress: 0,
      submissions: [],
      evaluations: [],
      collaborativeTools: [
        {
          id: this.generateId(),
          name: 'Team Chat',
          type: 'communication' as any,
          url: '/tools/chat/' + this.generateId(),
          isActive: true,
          permissions: [],
          lastUsed: new Date(),
          usageStats: {
            totalUsage: 0,
            lastUsed: new Date(),
            averageSessionDuration: 0,
            topUsers: []
          }
        },
        {
          id: this.generateId(),
          name: 'Document Editor',
          type: 'document_editor' as any,
          url: '/tools/docs/' + this.generateId(),
          isActive: true,
          permissions: [],
          lastUsed: new Date(),
          usageStats: {
            totalUsage: 0,
            lastUsed: new Date(),
            averageSessionDuration: 0,
            topUsers: []
          }
        }
      ]
    };

    const projects = this.projectsSubject.value;
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          teams: [...project.teams, newTeam]
        };
      }
      return project;
    });

    this.projectsSubject.next(updatedProjects);
    return of(newTeam).pipe(delay(500));
  }

  // Mentoring Methods
  getMentoringSessions(): Observable<MentoringSession[]> {
    return this.mentoringSessions$;
  }

  scheduleMentoringSession(session: Partial<MentoringSession>): Observable<MentoringSession> {
    const newSession: MentoringSession = {
      id: this.generateId(),
      mentorId: session.mentorId || 'mentor-1',
      mentorName: session.mentorName || 'Expert Mentor',
      menteeId: session.menteeId || 'current-user',
      menteeName: session.menteeName || 'Current User',
      title: session.title || '',
      description: session.description || '',
      scheduledAt: session.scheduledAt || new Date(),
      duration: session.duration || 60,
      status: SessionStatus.SCHEDULED,
      type: session.type || 'one_on_one' as any,
      topics: session.topics || [],
      notes: '',
      followUpActions: []
    };

    const currentSessions = this.mentoringSessions.value;
    this.mentoringSessions.next([...currentSessions, newSession]);
    return of(newSession).pipe(delay(500));
  }

  // Expert Q&A Methods
  getQASessions(): Observable<ExpertQASession[]> {
    return this.qaSessions$;
  }

  createQASession(session: Partial<ExpertQASession>): Observable<ExpertQASession> {
    const newSession: ExpertQASession = {
      id: this.generateId(),
      expertId: session.expertId || 'expert-1',
      expertName: session.expertName || 'Industry Expert',
      expertise: session.expertise || ['Technology', 'Software Development'],
      title: session.title || '',
      description: session.description || '',
      scheduledAt: session.scheduledAt || new Date(),
      duration: session.duration || 90,
      maxParticipants: session.maxParticipants || 100,
      participants: [],
      questions: [],
      status: SessionStatus.SCHEDULED,
      tags: session.tags || []
    };

    const currentSessions = this.qaSessionsSubject.value;
    this.qaSessionsSubject.next([...currentSessions, newSession]);
    return of(newSession).pipe(delay(500));
  }

  // Utility Methods
  private generateId(): string {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  private initializeMockData(): void {
    // Mock Discussion Forums
    const mockForums: DiscussionForum[] = [
      {
        id: 'forum-1',
        courseId: 'course-1',
        title: 'Angular Development Discussion',
        description: 'Discuss Angular development topics, best practices, and get help from peers',
        category: ForumCategory.COURSE_SPECIFIC,
        createdBy: 'instructor-1',
        createdAt: new Date('2025-08-01'),
        lastActivity: new Date('2025-08-06'),
        topics: [
          {
            id: 'topic-1',
            forumId: 'forum-1',
            title: 'Component Communication Patterns',
            content: 'What are the best practices for component communication in Angular?',
            authorId: 'student-1',
            authorName: 'Alex Johnson',
            createdAt: new Date('2025-08-03'),
            lastReplyAt: new Date('2025-08-06'),
            views: 45,
            replies: [
              {
                id: 'reply-1',
                topicId: 'topic-1',
                content: '@Input/@Output decorators are great for parent-child communication. For more complex scenarios, consider using services with observables.',
                authorId: 'instructor-1',
                authorName: 'Dr. Sarah Wilson',
                createdAt: new Date('2025-08-04'),
                upvotes: 8,
                downvotes: 0,
                isBestAnswer: true,
                attachments: []
              }
            ],
            tags: ['angular', 'components', 'communication'],
            isPinned: false,
            isLocked: false,
            upvotes: 12,
            downvotes: 1,
            status: TopicStatus.ANSWERED
          }
        ],
        moderators: ['instructor-1', 'ta-1'],
        isActive: true,
        rules: [
          'Be respectful and constructive',
          'Stay on topic',
          'No spam or self-promotion',
          'Use appropriate language',
          'Search before posting'
        ],
        participantCount: 24
      },
      {
        id: 'forum-2',
        title: 'General Learning Community',
        description: 'Connect with learners across all courses and share experiences',
        category: ForumCategory.GENERAL_DISCUSSION,
        createdBy: 'admin-1',
        createdAt: new Date('2025-07-15'),
        lastActivity: new Date('2025-08-07'),
        topics: [],
        moderators: ['admin-1', 'moderator-1'],
        isActive: true,
        rules: [
          'Be respectful and constructive',
          'Stay on topic',
          'No spam or self-promotion',
          'Use appropriate language',
          'Search before posting'
        ],
        participantCount: 156
      }
    ];

    // Mock Virtual Classrooms
    const mockClassrooms: VirtualClassroom[] = [
      {
        id: 'classroom-1',
        courseId: 'course-1',
        title: 'Advanced Angular Concepts',
        description: 'Deep dive into advanced Angular patterns and architecture',
        instructorId: 'instructor-1',
        instructorName: 'Dr. Sarah Wilson',
        scheduledStart: new Date('2025-08-08T14:00:00'),
        scheduledEnd: new Date('2025-08-08T16:00:00'),
        status: ClassroomStatus.SCHEDULED,
        participants: [],
        maxParticipants: 30,
        whiteboard: {
          id: 'whiteboard-1',
          classroomId: 'classroom-1',
          content: [],
          currentPage: 1,
          totalPages: 1,
          lastModifiedBy: 'instructor-1',
          lastModifiedAt: new Date()
        },
        chatMessages: [],
        features: [
          ClassroomFeature.VIDEO_CONFERENCE,
          ClassroomFeature.SCREEN_SHARE,
          ClassroomFeature.WHITEBOARD,
          ClassroomFeature.CHAT,
          ClassroomFeature.RECORDING
        ],
        settings: {
          allowStudentMic: true,
          allowStudentCamera: true,
          allowStudentScreenShare: false,
          enableChat: true,
          enableRecording: true,
          autoStartRecording: false,
          enableWaitingRoom: true,
          requirePasswordEntry: false
        }
      }
    ];

    // Mock Collaborative Projects
    const mockProjects: CollaborativeProject[] = [
      {
        id: 'project-1',
        title: 'E-Commerce Platform Development',
        description: 'Build a complete e-commerce platform using Angular and Node.js',
        courseId: 'course-1',
        createdBy: 'instructor-1',
        createdAt: new Date('2025-08-01'),
        deadline: new Date('2025-09-15'),
        status: ProjectStatus.ACTIVE,
        teams: [],
        requirements: [
          'Implement user authentication and authorization',
          'Create product catalog with search and filtering',
          'Build shopping cart and checkout functionality',
          'Integrate payment processing',
          'Implement responsive design'
        ],
        deliverables: [
          {
            id: 'deliverable-1',
            title: 'Project Architecture Document',
            description: 'Detailed system architecture and design decisions',
            dueDate: new Date('2025-08-10'),
            weight: 15,
            status: 'not_started' as any
          },
          {
            id: 'deliverable-2',
            title: 'MVP Implementation',
            description: 'Minimum viable product with core features',
            dueDate: new Date('2025-08-30'),
            weight: 50,
            status: 'not_started' as any
          },
          {
            id: 'deliverable-3',
            title: 'Final Presentation',
            description: 'Project demonstration and documentation',
            dueDate: new Date('2025-09-15'),
            weight: 35,
            status: 'not_started' as any
          }
        ],
        evaluationCriteria: [
          {
            id: 'criteria-1',
            name: 'Technical Implementation',
            description: 'Quality of code and technical decisions',
            weight: 40,
            maxScore: 100,
            rubric: [
              { level: 4, name: 'Excellent', description: 'Outstanding technical quality', points: 90 },
              { level: 3, name: 'Good', description: 'Good technical implementation', points: 75 },
              { level: 2, name: 'Satisfactory', description: 'Meets basic requirements', points: 60 },
              { level: 1, name: 'Needs Improvement', description: 'Below expectations', points: 40 }
            ]
          },
          {
            id: 'criteria-2',
            name: 'User Experience',
            description: 'Quality of user interface and experience',
            weight: 30,
            maxScore: 100,
            rubric: [
              { level: 4, name: 'Excellent', description: 'Exceptional UX design', points: 90 },
              { level: 3, name: 'Good', description: 'Good user experience', points: 75 },
              { level: 2, name: 'Satisfactory', description: 'Basic UX functionality', points: 60 },
              { level: 1, name: 'Needs Improvement', description: 'Poor user experience', points: 40 }
            ]
          },
          {
            id: 'criteria-3',
            name: 'Team Collaboration',
            description: 'Effectiveness of team collaboration and communication',
            weight: 30,
            maxScore: 100,
            rubric: [
              { level: 4, name: 'Excellent', description: 'Outstanding collaboration', points: 90 },
              { level: 3, name: 'Good', description: 'Good teamwork', points: 75 },
              { level: 2, name: 'Satisfactory', description: 'Adequate collaboration', points: 60 },
              { level: 1, name: 'Needs Improvement', description: 'Poor collaboration', points: 40 }
            ]
          }
        ],
        resources: [
          {
            id: 'resource-1',
            name: 'Angular Best Practices Guide',
            type: 'document' as any,
            url: '/resources/angular-best-practices.pdf',
            description: 'Comprehensive guide to Angular development best practices',
            isRequired: true
          },
          {
            id: 'resource-2',
            name: 'Node.js API Development Tutorial',
            type: 'video' as any,
            url: '/resources/nodejs-api-tutorial',
            description: 'Step-by-step tutorial for building RESTful APIs',
            isRequired: true
          },
          {
            id: 'resource-3',
            name: 'Project Template Repository',
            type: 'template' as any,
            url: 'https://github.com/template/ecommerce-starter',
            description: 'Starter template with basic project structure',
            isRequired: false
          }
        ],
        maxTeamSize: 4,
        minTeamSize: 2
      }
    ];

    // Mock Mentoring Sessions
    const mockMentoringSessions: MentoringSession[] = [
      {
        id: 'mentoring-1',
        mentorId: 'mentor-1',
        mentorName: 'John Smith',
        menteeId: 'current-user',
        menteeName: 'Current User',
        title: 'Career Path Planning',
        description: 'Discuss career goals and create a learning roadmap',
        scheduledAt: new Date('2025-08-10T15:00:00'),
        duration: 60,
        status: SessionStatus.SCHEDULED,
        type: 'one_on_one' as any,
        topics: ['career-planning', 'skill-development', 'industry-trends'],
        notes: '',
        followUpActions: []
      },
      {
        id: 'mentoring-2',
        mentorId: 'mentor-2',
        mentorName: 'Emily Chen',
        menteeId: 'current-user',
        menteeName: 'Current User',
        title: 'Technical Interview Preparation',
        description: 'Practice technical interviews and coding challenges',
        scheduledAt: new Date('2025-08-15T16:00:00'),
        duration: 90,
        status: SessionStatus.SCHEDULED,
        type: 'one_on_one' as any,
        topics: ['technical-interviews', 'coding-challenges', 'problem-solving'],
        notes: '',
        followUpActions: []
      }
    ];

    // Mock Expert Q&A Sessions
    const mockQASessions: ExpertQASession[] = [
      {
        id: 'qa-1',
        expertId: 'expert-1',
        expertName: 'Dr. Michael Rodriguez',
        expertise: ['Machine Learning', 'Data Science', 'Python'],
        title: 'Introduction to Machine Learning',
        description: 'Ask questions about ML fundamentals, algorithms, and career paths',
        scheduledAt: new Date('2025-08-12T18:00:00'),
        duration: 120,
        maxParticipants: 100,
        participants: [],
        questions: [],
        status: SessionStatus.SCHEDULED,
        tags: ['machine-learning', 'data-science', 'python', 'career-advice']
      },
      {
        id: 'qa-2',
        expertId: 'expert-2',
        expertName: 'Lisa Thompson',
        expertise: ['Full-Stack Development', 'React', 'Node.js'],
        title: 'Modern Web Development Q&A',
        description: 'Discuss modern web development practices, frameworks, and tools',
        scheduledAt: new Date('2025-08-18T17:00:00'),
        duration: 90,
        maxParticipants: 75,
        participants: [],
        questions: [],
        status: SessionStatus.SCHEDULED,
        tags: ['web-development', 'react', 'nodejs', 'full-stack']
      }
    ];

    // Load mock data
    this.forumsSubject.next(mockForums);
    this.classroomsSubject.next(mockClassrooms);
    this.projectsSubject.next(mockProjects);
    this.mentoringSessions.next(mockMentoringSessions);
    this.qaSessionsSubject.next(mockQASessions);
  }
}

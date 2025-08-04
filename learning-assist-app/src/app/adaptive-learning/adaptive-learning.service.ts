import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  LearningPath,
  ContentRecommendation,
  ProgressPrediction,
  LearningAnalytics,
  AdaptiveSettings,
  LearningStep,
  StepType,
  DifficultyLevel,
  LearningStyleType,
  ContentType,
  RecommendationSource,
  DifficultyProgression,
  AdaptationFrequency
} from '../models/adaptive-learning.model';

@Injectable({
  providedIn: 'root'
})
export class AdaptiveLearningService {
  private learningPathsSubject = new BehaviorSubject<LearningPath[]>([]);
  private recommendationsSubject = new BehaviorSubject<ContentRecommendation[]>([]);

  public learningPaths$ = this.learningPathsSubject.asObservable();
  public recommendations$ = this.recommendationsSubject.asObservable();

  private sampleAnalytics: LearningAnalytics = {
    userId: 'current-user',
    timeSpent: 1240,
    completionRate: 0.67,
    averageScore: 87,
    engagementMetrics: {
      sessionsPerWeek: 4,
      averageSessionDuration: 45,
      contentInteractionRate: 0.78,
      forumParticipation: 12,
      assignmentSubmissionRate: 0.95
    },
    learningVelocity: 2.3,
    retentionRate: 0.82,
    difficultyProgression: [
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        difficulty: DifficultyLevel.BEGINNER,
        performance: 85
      }
    ],
    lastUpdated: new Date(),
    averageSessionDuration: 45,
    streakDays: 7,
    weeklyLearningHours: 6.5
  };

  constructor() {
    this.initializeMockData();
  }

  getCurrentLearningPath(userId?: string): Observable<LearningPath | null> {
    return this.learningPaths$.pipe(
      map(paths => {
        if (!userId && paths.length > 0) {
          return paths[0];
        }
        return paths.find(path => path.userId === userId) || null;
      })
    );
  }

  getRecommendations(limit?: number): Observable<ContentRecommendation[]> {
    return this.recommendations$.pipe(
      map(recommendations => limit ? recommendations.slice(0, limit) : recommendations)
    );
  }

  trackRecommendationInteraction(recommendationId: string, interactionType: string): void {
    console.log(`Tracking interaction: ${interactionType} on recommendation ${recommendationId}`);
  }

  updateRecommendationFeedback(recommendationId: string, rating: number, wasHelpful: boolean, comments?: string): Observable<void> {
    const recommendations = this.recommendationsSubject.value;
    const recommendation = recommendations.find(r => r.id === recommendationId);
    
    if (recommendation) {
      recommendation.userFeedback = {
        rating,
        wasHelpful,
        comments,
        providedAt: new Date()
      };
      this.recommendationsSubject.next([...recommendations]);
    }

    return of(void 0).pipe(delay(300));
  }

  predictLearningProgress(userId: string, courseId: string): Observable<ProgressPrediction> {
    const prediction: ProgressPrediction = {
      id: this.generateId(),
      userId,
      courseId,
      predictedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      successProbability: 0.85,
      estimatedStudyHours: 25,
      riskFactors: [],
      interventionRecommendations: [],
      confidenceLevel: 0.78,
      createdAt: new Date()
    };
    return of(prediction).pipe(delay(1200));
  }

  getLearningAnalytics(userId: string): Observable<LearningAnalytics> {
    return of(this.sampleAnalytics).pipe(delay(600));
  }

  private initializeMockData(): void {
    const sampleSteps: LearningStep[] = [
      {
        id: 'step-1',
        courseId: 'course-1',
        contentId: 'content-1',
        title: 'HTML & CSS Fundamentals',
        type: StepType.LESSON,
        order: 1,
        prerequisites: [],
        difficulty: DifficultyLevel.BEGINNER,
        estimatedTime: 60,
        isCompleted: true,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        score: 95,
        adaptations: [],
        status: 'completed'
      },
      {
        id: 'step-2',
        courseId: 'course-1',
        contentId: 'content-2',
        title: 'JavaScript Basics',
        type: StepType.LESSON,
        order: 2,
        prerequisites: ['step-1'],
        difficulty: DifficultyLevel.BEGINNER,
        estimatedTime: 90,
        isCompleted: false,
        adaptations: [],
        status: 'active'
      },
      {
        id: 'step-3',
        courseId: 'course-1',
        contentId: 'content-3',
        title: 'React Components',
        type: StepType.LESSON,
        order: 3,
        prerequisites: ['step-2'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedTime: 120,
        isCompleted: false,
        adaptations: [],
        status: 'pending'  
      }
    ];

    const samplePaths: LearningPath[] = [
      {
        id: 'path-1',
        userId: 'current-user',
        title: 'Full-Stack Web Development Path',
        description: 'Comprehensive learning path covering frontend and backend development',
        courseSequence: sampleSteps,
        steps: sampleSteps,
        currentStep: 1,
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 480,
        adaptiveSettings: {
          learningStyle: LearningStyleType.VISUAL,
          difficultyProgression: DifficultyProgression.ADAPTIVE,
          adaptationFrequency: AdaptationFrequency.REAL_TIME,
          interventionThreshold: 0.7,
          personalizedRecommendations: true,
          realTimeAdjustments: true
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        completionRate: 0.33
      }
    ];

    const sampleRecommendations: ContentRecommendation[] = [
      {
        id: 'rec-1',
        userId: 'current-user',
        contentId: 'content-rec-1',
        contentType: ContentType.VIDEO,
        title: 'Advanced JavaScript Patterns',
        description: 'Learn advanced JavaScript patterns and best practices',
        relevanceScore: 0.95,
        confidenceScore: 0.88,
        recommendationSource: RecommendationSource.CONTENT_BASED,
        tags: ['javascript', 'patterns'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedTime: 45,
        createdAt: new Date()
      },
      {
        id: 'rec-2',
        userId: 'current-user',
        contentId: 'content-rec-2',
        contentType: ContentType.INTERACTIVE,
        title: 'React Hooks Deep Dive',
        description: 'Comprehensive guide to React Hooks with hands-on examples',
        relevanceScore: 0.89,
        confidenceScore: 0.92,
        recommendationSource: RecommendationSource.HYBRID,
        tags: ['react', 'hooks', 'frontend'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedTime: 75,
        createdAt: new Date()
      }
    ];

    this.learningPathsSubject.next(samplePaths);
    this.recommendationsSubject.next(sampleRecommendations);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

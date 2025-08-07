import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, map } from 'rxjs';
import {
  AdaptiveTest,
  TestSession,
  Question,
  TestResponse,
  AutoGradingResult,
  PerformanceAnalytics,
  GradingRubric,
  BenchmarkData,
  QuestionType,
  DifficultyLevel,
  TestStatus,
  SecurityFlag,
  SecurityFlagType,
  SecuritySeverity,
  PassingStatus,
  GradingMethod,
  StrengthLevel,
  RecommendationType,
  RecommendationPriority,
  ComparisonGroup,
  StatisticalSignificance
} from '../models/assessment-evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentEvaluationService {
  private adaptiveTestsSubject = new BehaviorSubject<AdaptiveTest[]>([]);
  private testSessionsSubject = new BehaviorSubject<TestSession[]>([]);
  private gradingRubricsSubject = new BehaviorSubject<GradingRubric[]>([]);

  public adaptiveTests$ = this.adaptiveTestsSubject.asObservable();
  public testSessions$ = this.testSessionsSubject.asObservable();
  public gradingRubrics$ = this.gradingRubricsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with comprehensive mock data
    this.adaptiveTestsSubject.next(this.createMockAdaptiveTests());
    this.testSessionsSubject.next(this.createMockTestSessions());
    this.gradingRubricsSubject.next(this.createMockGradingRubrics());
  }

  // Adaptive Testing Engine Methods
  getAdaptiveTests(): Observable<AdaptiveTest[]> {
    return this.adaptiveTests$.pipe(delay(300));
  }

  getAdaptiveTestById(id: string): Observable<AdaptiveTest | undefined> {
    return this.adaptiveTests$.pipe(
      map(tests => tests.find(test => test.id === id)),
      delay(200)
    );
  }

  createAdaptiveTest(testData: Partial<AdaptiveTest>): Observable<AdaptiveTest> {
    const newTest: AdaptiveTest = {
      id: this.generateId(),
      name: testData.name || 'New Adaptive Test',
      description: testData.description || 'Computer Adaptive Test',
      subject: testData.subject || 'General',
      targetDifficulty: testData.targetDifficulty || DifficultyLevel.INTERMEDIATE,
      maxQuestions: testData.maxQuestions || 20,
      minQuestions: testData.minQuestions || 5,
      timeLimit: testData.timeLimit,
      passingScore: testData.passingScore || 70,
      isActive: testData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: testData.questions || [],
      adaptiveSettings: testData.adaptiveSettings || {
        initialDifficulty: DifficultyLevel.INTERMEDIATE,
        difficultyAdjustmentThreshold: 0.7,
        terminationCriteria: 'precision_based' as any,
        itemSelectionStrategy: 'maximum_information' as any,
        scoringMethod: 'theta_score' as any
      }
    };

    const currentTests = this.adaptiveTestsSubject.value;
    this.adaptiveTestsSubject.next([...currentTests, newTest]);
    return of(newTest).pipe(delay(500));
  }

  startAdaptiveTest(testId: string, userId: string): Observable<TestSession> {
    const newSession: TestSession = {
      id: this.generateId(),
      testId: testId,
      userId: userId,
      startTime: new Date(),
      status: TestStatus.IN_PROGRESS,
      currentQuestionIndex: 0,
      responses: [],
      estimatedAbility: 0,
      standardError: 1,
      timeSpent: 0,
      securityFlags: []
    };

    const currentSessions = this.testSessionsSubject.value;
    this.testSessionsSubject.next([...currentSessions, newSession]);
    return of(newSession).pipe(delay(300));
  }

  getNextQuestion(sessionId: string): Observable<Question | null> {
    // Simulate adaptive question selection based on current performance
    const mockQuestion: Question = {
      id: this.generateId(),
      text: 'What is the time complexity of binary search?',
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'Algorithms',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      options: [
        { id: '1', text: 'O(1)', isCorrect: false },
        { id: '2', text: 'O(log n)', isCorrect: true },
        { id: '3', text: 'O(n)', isCorrect: false },
        { id: '4', text: 'O(n log n)', isCorrect: false }
      ],
      correctAnswer: '2',
      points: 10,
      timeLimit: 120,
      explanation: 'Binary search divides the search space in half with each iteration.',
      tags: ['algorithms', 'complexity', 'search']
    };

    return of(mockQuestion).pipe(delay(200));
  }

  submitResponse(sessionId: string, response: TestResponse): Observable<boolean> {
    const sessions = this.testSessionsSubject.value;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      const session = { ...sessions[sessionIndex] };
      session.responses.push(response);
      session.currentQuestionIndex++;
      session.timeSpent += response.timeSpent;
      session.estimatedAbility = this.calculateEstimatedAbility(session.responses);
      
      sessions[sessionIndex] = session;
      this.testSessionsSubject.next(sessions);
    }
    
    return of(true).pipe(delay(200));
  }

  completeTest(sessionId: string): Observable<TestSession> {
    const sessions = this.testSessionsSubject.value;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      const session = { ...sessions[sessionIndex] };
      session.status = TestStatus.COMPLETED;
      session.endTime = new Date();
      session.score = this.calculateFinalScore(session.responses);
      
      sessions[sessionIndex] = session;
      this.testSessionsSubject.next(sessions);
      return of(session).pipe(delay(300));
    }
    
    return of({} as TestSession);
  }

  // Automated Grading System Methods
  gradeResponse(questionId: string, response: string, gradingMethod: GradingMethod): Observable<AutoGradingResult> {
    // Simulate automated grading with different methods
    const result: AutoGradingResult = {
      questionId: questionId,
      responseId: this.generateId(),
      score: Math.floor(Math.random() * 10) + 1,
      maxScore: 10,
      feedback: 'Good answer! Consider expanding on the key concepts.',
      gradingMethod: gradingMethod,
      confidence: 0.85 + Math.random() * 0.15,
      detailedAnalysis: {
        keywordsFound: ['algorithm', 'complexity', 'efficiency'],
        keywordsMissing: ['optimization', 'performance'],
        grammarErrors: 0,
        spellingErrors: 0,
        readabilityScore: 8.5,
        sentimentScore: 0.7,
        topicRelevance: 0.9
      },
      timestamp: new Date()
    };

    return of(result).pipe(delay(500));
  }

  gradeCodeResponse(questionId: string, code: string): Observable<AutoGradingResult> {
    // Simulate code execution and grading
    const result: AutoGradingResult = {
      questionId: questionId,
      responseId: this.generateId(),
      score: 8,
      maxScore: 10,
      feedback: 'Code executes correctly but could be optimized.',
      gradingMethod: GradingMethod.CODE_EXECUTION,
      confidence: 0.95,
      detailedAnalysis: {
        keywordsFound: [],
        keywordsMissing: [],
        grammarErrors: 0,
        spellingErrors: 0,
        readabilityScore: 0,
        sentimentScore: 0,
        topicRelevance: 0,
        codeMetrics: {
          syntaxErrors: [],
          testCasesPassed: 8,
          testCasesFailed: 2,
          executionTime: 150,
          memoryUsage: 1024,
          codeComplexity: 3.5,
          codeStyle: {
            indentationScore: 9,
            namingConventionScore: 8,
            commentScore: 6,
            overallScore: 7.7,
            suggestions: ['Add more comments', 'Use more descriptive variable names']
          }
        }
      },
      timestamp: new Date()
    };

    return of(result).pipe(delay(800));
  }

  getGradingRubrics(): Observable<GradingRubric[]> {
    return this.gradingRubrics$.pipe(delay(200));
  }

  createGradingRubric(rubricData: Partial<GradingRubric>): Observable<GradingRubric> {
    const newRubric: GradingRubric = {
      id: this.generateId(),
      name: rubricData.name || 'New Rubric',
      description: rubricData.description || 'Assessment rubric',
      criteria: rubricData.criteria || [],
      totalPoints: rubricData.totalPoints || 100,
      scalingFactor: rubricData.scalingFactor || 1.0,
      isActive: rubricData.isActive !== false
    };

    const currentRubrics = this.gradingRubricsSubject.value;
    this.gradingRubricsSubject.next([...currentRubrics, newRubric]);
    return of(newRubric).pipe(delay(400));
  }

  // Performance Analytics Methods
  getPerformanceAnalytics(userId: string, testId?: string): Observable<PerformanceAnalytics> {
    const analytics: PerformanceAnalytics = {
      userId: userId,
      testId: testId || 'overall',
      overallScore: 85,
      timeSpent: 1800, // 30 minutes
      questionsAttempted: 15,
      questionsCorrect: 13,
      difficultyProgression: this.createMockDifficultyProgression(),
      categoryPerformance: this.createMockCategoryPerformance(),
      learningGains: this.createMockLearningGains(),
      recommendations: this.createMockRecommendations()
    };

    return of(analytics).pipe(delay(400));
  }

  getBenchmarkData(userId: string, category: string): Observable<BenchmarkData> {
    const benchmark: BenchmarkData = {
      category: category,
      userScore: 85,
      peerAverage: 78,
      industryAverage: 82,
      topPercentile: 95,
      userPercentileRank: 75,
      comparisonGroup: ComparisonGroup.SAME_LEVEL,
      sampleSize: 1250
    };

    return of(benchmark).pipe(delay(300));
  }

  getDetailedScoreBreakdown(sessionId: string): Observable<any> {
    const breakdown = {
      totalScore: 85,
      categoryBreakdown: [
        { category: 'Algorithms', score: 90, maxScore: 100 },
        { category: 'Data Structures', score: 80, maxScore: 100 },
        { category: 'System Design', score: 85, maxScore: 100 }
      ],
      timeAnalysis: {
        totalTime: 1800,
        averageTimePerQuestion: 120,
        fastestQuestion: 45,
        slowestQuestion: 300
      },
      difficultyAnalysis: {
        beginnerQuestions: { attempted: 3, correct: 3, percentage: 100 },
        intermediateQuestions: { attempted: 8, correct: 7, percentage: 87.5 },
        advancedQuestions: { attempted: 4, correct: 3, percentage: 75 }
      }
    };

    return of(breakdown).pipe(delay(500));
  }

  // Security and Anti-Cheating
  flagSecurityIncident(sessionId: string, flagType: SecurityFlagType, description: string): Observable<boolean> {
    const flag: SecurityFlag = {
      type: flagType,
      description: description,
      timestamp: new Date(),
      severity: this.determineSeverity(flagType),
      resolved: false
    };

    // Add flag to session
    const sessions = this.testSessionsSubject.value;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].securityFlags.push(flag);
      this.testSessionsSubject.next(sessions);
    }

    return of(true).pipe(delay(100));
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateEstimatedAbility(responses: TestResponse[]): number {
    // Simple theta estimation based on correct responses
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const totalResponses = responses.length;
    return totalResponses > 0 ? (correctResponses / totalResponses - 0.5) * 4 : 0;
  }

  private calculateFinalScore(responses: TestResponse[]): any {
    const totalPoints = responses.reduce((sum, r) => sum + (r.points || 0), 0);
    const maxPoints = responses.length * 10; // Assuming 10 points per question
    
    return {
      totalPoints: totalPoints,
      maxPoints: maxPoints,
      percentage: Math.round((totalPoints / maxPoints) * 100),
      scaledScore: Math.round(totalPoints * 5), // Scale to 500 max
      thetaScore: this.calculateEstimatedAbility(responses),
      standardError: 0.3,
      passingStatus: totalPoints >= (maxPoints * 0.7) ? PassingStatus.PASS : PassingStatus.FAIL,
      breakdown: []
    };
  }

  private determineSeverity(flagType: SecurityFlagType): SecuritySeverity {
    switch (flagType) {
      case SecurityFlagType.EXTERNAL_HELP_DETECTED:
        return SecuritySeverity.CRITICAL;
      case SecurityFlagType.COPY_PASTE_DETECTED:
      case SecurityFlagType.MULTIPLE_TABS:
        return SecuritySeverity.HIGH;
      case SecurityFlagType.SUSPICIOUS_TIMING:
      case SecurityFlagType.IP_ADDRESS_CHANGE:
      case SecurityFlagType.USER_AGENT_CHANGE:
        return SecuritySeverity.MEDIUM;
      default:
        return SecuritySeverity.LOW;
    }
  }

  // Mock data creation methods
  private createMockAdaptiveTests(): AdaptiveTest[] {
    return [
      {
        id: '1',
        name: 'JavaScript Fundamentals',
        description: 'Adaptive test covering JavaScript core concepts',
        subject: 'Programming',
        targetDifficulty: DifficultyLevel.INTERMEDIATE,
        maxQuestions: 20,
        minQuestions: 10,
        timeLimit: 3600,
        passingScore: 70,
        isActive: true,
        createdAt: new Date('2025-08-01'),
        updatedAt: new Date('2025-08-07'),
        questions: [],
        adaptiveSettings: {
          initialDifficulty: DifficultyLevel.INTERMEDIATE,
          difficultyAdjustmentThreshold: 0.7,
          terminationCriteria: 'precision_based' as any,
          itemSelectionStrategy: 'maximum_information' as any,
          scoringMethod: 'theta_score' as any
        }
      },
      {
        id: '2',
        name: 'Data Structures & Algorithms',
        description: 'Comprehensive adaptive assessment of DSA knowledge',
        subject: 'Computer Science',
        targetDifficulty: DifficultyLevel.ADVANCED,
        maxQuestions: 25,
        minQuestions: 15,
        timeLimit: 5400,
        passingScore: 75,
        isActive: true,
        createdAt: new Date('2025-08-02'),
        updatedAt: new Date('2025-08-07'),
        questions: [],
        adaptiveSettings: {
          initialDifficulty: DifficultyLevel.INTERMEDIATE,
          difficultyAdjustmentThreshold: 0.8,
          terminationCriteria: 'confidence_interval' as any,
          itemSelectionStrategy: 'content_balanced' as any,
          scoringMethod: 'scaled_score' as any
        }
      }
    ];
  }

  private createMockTestSessions(): TestSession[] {
    return [
      {
        id: 'session_1',
        testId: '1',
        userId: 'user_123',
        startTime: new Date('2025-08-07T10:00:00'),
        endTime: new Date('2025-08-07T10:45:00'),
        status: TestStatus.COMPLETED,
        currentQuestionIndex: 15,
        responses: [],
        estimatedAbility: 1.2,
        standardError: 0.3,
        score: {
          totalPoints: 85,
          maxPoints: 100,
          percentage: 85,
          scaledScore: 425,
          thetaScore: 1.2,
          standardError: 0.3,
          passingStatus: PassingStatus.PASS,
          breakdown: []
        },
        timeSpent: 2700,
        securityFlags: []
      }
    ];
  }

  private createMockGradingRubrics(): GradingRubric[] {
    return [
      {
        id: 'rubric_1',
        name: 'Essay Grading Rubric',
        description: 'Comprehensive rubric for essay assessment',
        criteria: [
          {
            id: 'content',
            name: 'Content Quality',
            description: 'Accuracy and depth of content',
            weight: 0.4,
            levels: [
              {
                id: 'excellent',
                name: 'Excellent',
                description: 'Exceptional understanding and insight',
                points: 4,
                qualityIndicators: ['Shows deep understanding', 'Original insights', 'Comprehensive coverage']
              },
              {
                id: 'good',
                name: 'Good',
                description: 'Good understanding with minor gaps',
                points: 3,
                qualityIndicators: ['Shows good understanding', 'Some insights', 'Adequate coverage']
              },
              {
                id: 'fair',
                name: 'Fair',
                description: 'Basic understanding with some errors',
                points: 2,
                qualityIndicators: ['Basic understanding', 'Limited insights', 'Incomplete coverage']
              },
              {
                id: 'poor',
                name: 'Poor',
                description: 'Limited understanding with significant errors',
                points: 1,
                qualityIndicators: ['Limited understanding', 'No insights', 'Poor coverage']
              }
            ]
          }
        ],
        totalPoints: 100,
        scalingFactor: 1.0,
        isActive: true
      }
    ];
  }

  private createMockDifficultyProgression(): any[] {
    return [
      { questionIndex: 1, difficultyLevel: DifficultyLevel.INTERMEDIATE, estimatedAbility: 0, standardError: 1, isCorrect: true },
      { questionIndex: 2, difficultyLevel: DifficultyLevel.INTERMEDIATE, estimatedAbility: 0.5, standardError: 0.8, isCorrect: true },
      { questionIndex: 3, difficultyLevel: DifficultyLevel.ADVANCED, estimatedAbility: 1.0, standardError: 0.6, isCorrect: false },
      { questionIndex: 4, difficultyLevel: DifficultyLevel.INTERMEDIATE, estimatedAbility: 0.8, standardError: 0.5, isCorrect: true }
    ];
  }

  private createMockCategoryPerformance(): any[] {
    return [
      {
        category: 'Algorithms',
        score: 90,
        maxScore: 100,
        percentage: 90,
        questionsAttempted: 5,
        averageTime: 120,
        strengthLevel: StrengthLevel.ADVANCED
      },
      {
        category: 'Data Structures',
        score: 80,
        maxScore: 100,
        percentage: 80,
        questionsAttempted: 6,
        averageTime: 150,
        strengthLevel: StrengthLevel.PROFICIENT
      },
      {
        category: 'System Design',
        score: 75,
        maxScore: 100,
        percentage: 75,
        questionsAttempted: 4,
        averageTime: 180,
        strengthLevel: StrengthLevel.DEVELOPING
      }
    ];
  }

  private createMockLearningGains(): any[] {
    return [
      {
        category: 'Algorithms',
        preTestScore: 70,
        postTestScore: 90,
        improvement: 20,
        improvementPercentage: 28.6,
        significance: StatisticalSignificance.SIGNIFICANT
      },
      {
        category: 'Data Structures',
        preTestScore: 65,
        postTestScore: 80,
        improvement: 15,
        improvementPercentage: 23.1,
        significance: StatisticalSignificance.SIGNIFICANT
      }
    ];
  }

  private createMockRecommendations(): any[] {
    return [
      {
        type: RecommendationType.STUDY_FOCUS,
        priority: RecommendationPriority.HIGH,
        category: 'System Design',
        title: 'Focus on System Design Fundamentals',
        description: 'Your performance in system design shows room for improvement. Focus on scalability patterns and architectural principles.',
        actionItems: [
          'Study distributed system concepts',
          'Practice designing scalable architectures',
          'Learn about microservices patterns'
        ],
        estimatedTimeToImprove: 14,
        resources: [
          {
            id: 'res_1',
            title: 'System Design Primer',
            type: 'article' as any,
            url: 'https://example.com/system-design',
            description: 'Comprehensive guide to system design',
            estimatedDuration: 120,
            relevanceScore: 0.95
          }
        ]
      },
      {
        type: RecommendationType.PRACTICE_MORE,
        priority: RecommendationPriority.MEDIUM,
        category: 'Data Structures',
        title: 'Practice Advanced Data Structures',
        description: 'Strengthen your understanding of complex data structures through additional practice.',
        actionItems: [
          'Solve tree and graph problems',
          'Practice with hash tables',
          'Work on dynamic programming'
        ],
        estimatedTimeToImprove: 7,
        resources: []
      }
    ];
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  CareerPath,
  Skill,
  SkillAssessment,
  CareerGoal,
  Milestone,
  SkillGap,
  LearningResource,
  Certification,
  MarketInsight,
  SkillMatrix,
  CareerDashboardData,
  ProgressSummary,
  PeerComparison,
  SuccessMetric,
  CareerLevel,
  SkillCategory,
  SkillLevel,
  AssessmentType,
  ResourceType,
  GoalPriority,
  GoalStatus,
  MilestoneStatus,
  SalaryRange,
  JobOutlook,
  Company
} from '../models/career-goals.model';

@Injectable({
  providedIn: 'root'
})
export class CareerGoalsService {
  // Data subjects for reactive programming
  private careerPathsSubject = new BehaviorSubject<CareerPath[]>([]);
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  private assessmentsSubject = new BehaviorSubject<SkillAssessment[]>([]);
  private careerGoalsSubject = new BehaviorSubject<CareerGoal[]>([]);
  private skillGapsSubject = new BehaviorSubject<SkillGap[]>([]);
  private marketInsightsSubject = new BehaviorSubject<MarketInsight[]>([]);
  private certificationsSubject = new BehaviorSubject<Certification[]>([]);
  private learningResourcesSubject = new BehaviorSubject<LearningResource[]>([]);

  constructor() {
    this.initializeMockData();
  }

  // Public observables
  getCareerPaths(): Observable<CareerPath[]> {
    return this.careerPathsSubject.asObservable();
  }

  getSkills(): Observable<Skill[]> {
    return this.skillsSubject.asObservable();
  }

  getSkillAssessments(): Observable<SkillAssessment[]> {
    return this.assessmentsSubject.asObservable();
  }

  getCareerGoals(): Observable<CareerGoal[]> {
    return this.careerGoalsSubject.asObservable();
  }

  getActiveCareerGoals(): Observable<CareerGoal[]> {
    return this.careerGoalsSubject.pipe(
      map(goals => goals.filter(goal => 
        goal.status === GoalStatus.ACTIVE || goal.status === GoalStatus.IN_PROGRESS
      ))
    );
  }

  getSkillGaps(): Observable<SkillGap[]> {
    return this.skillGapsSubject.asObservable();
  }

  getMarketInsights(): Observable<MarketInsight[]> {
    return this.marketInsightsSubject.asObservable();
  }

  getCertifications(): Observable<Certification[]> {
    return this.certificationsSubject.asObservable();
  }

  getLearningResources(): Observable<LearningResource[]> {
    return this.learningResourcesSubject.asObservable();
  }

  getSkillMatrix(userId: string): Observable<SkillMatrix> {
    return this.assessmentsSubject.pipe(
      map(assessments => {
        const userAssessments = assessments.filter(a => a.userId === userId);
        return this.generateSkillMatrix(userId, userAssessments);
      })
    );
  }

  // Career Path Management
  getCareerPathById(id: string): Observable<CareerPath | undefined> {
    return this.careerPathsSubject.pipe(
      map(paths => paths.find(path => path.id === id))
    );
  }

  getCareerPathsByIndustry(industry: string): Observable<CareerPath[]> {
    return this.careerPathsSubject.pipe(
      map(paths => paths.filter(path => path.industry === industry))
    );
  }

  getCareerPathsByLevel(level: CareerLevel): Observable<CareerPath[]> {
    return this.careerPathsSubject.pipe(
      map(paths => paths.filter(path => path.level === level))
    );
  }

  // Skill Management
  getSkillById(id: string): Observable<Skill | undefined> {
    return this.skillsSubject.pipe(
      map(skills => skills.find(skill => skill.id === id))
    );
  }

  getSkillsByCategory(category: SkillCategory): Observable<Skill[]> {
    return this.skillsSubject.pipe(
      map(skills => skills.filter(skill => skill.category === category))
    );
  }

  getTrendingSkills(): Observable<Skill[]> {
    return this.skillsSubject.pipe(
      map(skills => skills
        .filter(skill => skill.trendingScore > 70)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 10)
      )
    );
  }

  getHighDemandSkills(): Observable<Skill[]> {
    return this.skillsSubject.pipe(
      map(skills => skills
        .filter(skill => skill.marketDemand > 80)
        .sort((a, b) => b.marketDemand - a.marketDemand)
      )
    );
  }

  // Career Goal Management
  createCareerGoal(goalData: Partial<CareerGoal>): Observable<CareerGoal> {
    const newGoal: CareerGoal = {
      id: this.generateId(),
      userId: goalData.userId || 'user-1',
      title: goalData.title || '',
      description: goalData.description || '',
      targetCareerPath: goalData.targetCareerPath!,
      currentPosition: goalData.currentPosition,
      targetDate: goalData.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      priority: goalData.priority || GoalPriority.MEDIUM,
      status: GoalStatus.DRAFT,
      progress: 0,
      milestones: [],
      requiredSkillGaps: [],
      estimatedTimeToComplete: goalData.estimatedTimeToComplete || 12,
      difficultyLevel: goalData.difficultyLevel || 5,
      motivationLevel: goalData.motivationLevel || 7,
      successMetrics: goalData.successMetrics || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSmartGoal: this.validateSmartGoal(goalData)
    };

    const currentGoals = this.careerGoalsSubject.value;
    this.careerGoalsSubject.next([...currentGoals, newGoal]);

    return of(newGoal);
  }

  updateCareerGoal(goalId: string, updates: Partial<CareerGoal>): Observable<CareerGoal> {
    const goals = this.careerGoalsSubject.value;
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex !== -1) {
      const updatedGoal = {
        ...goals[goalIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      goals[goalIndex] = updatedGoal;
      this.careerGoalsSubject.next([...goals]);
      
      return of(updatedGoal);
    }
    
    throw new Error('Goal not found');
  }

  // Skill Assessment Management
  createSkillAssessment(assessmentData: Partial<SkillAssessment>): Observable<SkillAssessment> {
    const newAssessment: SkillAssessment = {
      id: this.generateId(),
      skillId: assessmentData.skillId!,
      userId: assessmentData.userId || 'user-1',
      currentLevel: assessmentData.currentLevel || SkillLevel.BEGINNER,
      targetLevel: assessmentData.targetLevel || SkillLevel.INTERMEDIATE,
      assessmentType: assessmentData.assessmentType || AssessmentType.SELF_ASSESSMENT,
      score: assessmentData.score || 0,
      completedAt: new Date(),
      assessmentDetails: assessmentData.assessmentDetails || [],
      recommendations: assessmentData.recommendations || [],
      nextSteps: assessmentData.nextSteps || [],
      improvementAreas: assessmentData.improvementAreas || [],
      strengths: assessmentData.strengths || []
    };

    const currentAssessments = this.assessmentsSubject.value;
    this.assessmentsSubject.next([...currentAssessments, newAssessment]);

    // Update skill gaps based on assessment
    this.updateSkillGapsFromAssessment(newAssessment);

    return of(newAssessment);
  }

  // Skill Gap Analysis
  analyzeSkillGaps(userId: string, targetCareerPath: CareerPath): Observable<SkillGap[]> {
    return combineLatest([
      this.getSkillAssessments(),
      this.getSkills()
    ]).pipe(
      map(([assessments, skills]) => {
        const userAssessments = assessments.filter(a => a.userId === userId);
        const gaps: SkillGap[] = [];

        targetCareerPath.requiredSkills.forEach(requiredSkill => {
          const userAssessment = userAssessments.find(a => a.skillId === requiredSkill.id);
          const currentLevel = userAssessment?.currentLevel || SkillLevel.NONE;
          const requiredLevel = requiredSkill.level;

          if (currentLevel < requiredLevel) {
            const skill = skills.find(s => s.id === requiredSkill.id);
            gaps.push({
              skillId: requiredSkill.id,
              skillName: skill?.name || 'Unknown Skill',
              currentLevel,
              requiredLevel,
              gapSize: requiredLevel - currentLevel,
              priority: this.calculateGapPriority(requiredLevel - currentLevel, requiredSkill.importance),
              estimatedLearningTime: this.estimateLearningTime(currentLevel, requiredLevel, skill?.difficultyLevel || 5),
              recommendedResources: skill?.learningResources || [],
              assessmentNeeded: !userAssessment
            });
          }
        });

        return gaps.sort((a, b) => b.gapSize - a.gapSize);
      })
    );
  }

  // Dashboard Data
  getDashboardData(userId: string): Observable<CareerDashboardData> {
    return combineLatest([
      this.getActiveCareerGoals(),
      this.getSkillGaps(),
      this.getSkillAssessments(),
      this.getCareerPaths(),
      this.getMarketInsights()
    ]).pipe(
      map(([goals, skillGaps, assessments, careerPaths, marketInsights]) => {
        const userGoals = goals.filter(g => g.userId === userId);
        const userAssessments = assessments.filter(a => a.userId === userId);
        const upcomingMilestones = this.getUpcomingMilestones(userGoals);
        
        return {
          currentGoals: userGoals,
          skillGaps: skillGaps.filter(gap => gap.priority !== 'Low').slice(0, 5),
          recentAssessments: userAssessments.slice(-3),
          recommendedPaths: this.getRecommendedPaths(userAssessments, careerPaths),
          marketInsights: marketInsights.slice(0, 3),
          upcomingMilestones,
          progressSummary: this.calculateProgressSummary(userGoals, userAssessments),
          skillMatrix: this.generateSkillMatrix(userId, userAssessments)
        };
      })
    );
  }

  // Learning Resource Recommendations
  getRecommendedResources(skillId: string, currentLevel: SkillLevel, targetLevel: SkillLevel): Observable<LearningResource[]> {
    return this.learningResourcesSubject.pipe(
      map(resources => resources
        .filter(resource => 
          resource.skillsTargeted.includes(skillId) &&
          this.isResourceAppropriate(resource, currentLevel, targetLevel)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
      )
    );
  }

  // Market Insights
  getMarketInsightsForSkill(skillId: string): Observable<MarketInsight[]> {
    return this.marketInsightsSubject.pipe(
      map(insights => insights.filter(insight => insight.skillId === skillId))
    );
  }

  getMarketInsightsForCareerPath(careerPathId: string): Observable<MarketInsight[]> {
    return this.marketInsightsSubject.pipe(
      map(insights => insights.filter(insight => insight.careerPathId === careerPathId))
    );
  }

  // Peer Comparison
  getPeerComparison(userId: string, targetCareerPath: string): Observable<PeerComparison> {
    // Mock implementation - in real app, this would call backend API
    return of({
      userId,
      targetCareerPath,
      averageProgress: 65,
      averageTimeToComplete: 18,
      commonSkillGaps: ['JavaScript', 'React', 'System Design'],
      successRate: 78,
      recommendedResources: ['Modern JavaScript Course', 'React Advanced Patterns', 'System Design Interview'],
      benchmarkMetrics: [
        { name: 'Learning Hours/Week', userValue: 8, peerAverage: 12, industryBest: 20, unit: 'hours' },
        { name: 'Skills Acquired', userValue: 5, peerAverage: 7, industryBest: 12, unit: 'skills' },
        { name: 'Certifications', userValue: 2, peerAverage: 3, industryBest: 6, unit: 'certs' }
      ]
    });
  }

  // Utility Methods
  private generateId(): string {
    return 'cg_' + Math.random().toString(36).substr(2, 9);
  }

  private validateSmartGoal(goalData: Partial<CareerGoal>): boolean {
    // SMART: Specific, Measurable, Achievable, Relevant, Time-bound
    return !!(
      goalData.title && goalData.title.length > 10 && // Specific
      goalData.targetCareerPath && // Measurable/Relevant
      goalData.targetDate && // Time-bound
      goalData.estimatedTimeToComplete && goalData.estimatedTimeToComplete <= 36 // Achievable
    );
  }

  private calculateGapPriority(gapSize: number, importance: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (importance === 'Critical' && gapSize >= 3) return 'Critical';
    if (importance === 'High' && gapSize >= 2) return 'High';
    if (gapSize >= 2) return 'Medium';
    return 'Low';
  }

  private estimateLearningTime(currentLevel: SkillLevel, targetLevel: SkillLevel, difficulty: number): number {
    const levelDifference = targetLevel - currentLevel;
    const baseHours = 20; // Base hours per skill level
    return levelDifference * baseHours * (difficulty / 5);
  }

  private updateSkillGapsFromAssessment(assessment: SkillAssessment): void {
    const currentGaps = this.skillGapsSubject.value;
    const existingGapIndex = currentGaps.findIndex(gap => gap.skillId === assessment.skillId);
    
    if (existingGapIndex !== -1) {
      // Update existing gap
      const updatedGap = {
        ...currentGaps[existingGapIndex],
        currentLevel: assessment.currentLevel,
        gapSize: Math.max(0, assessment.targetLevel - assessment.currentLevel),
        assessmentNeeded: false
      };
      
      currentGaps[existingGapIndex] = updatedGap;
      this.skillGapsSubject.next([...currentGaps]);
    }
  }

  private getUpcomingMilestones(goals: CareerGoal[]): Milestone[] {
    const allMilestones = goals.flatMap(goal => goal.milestones);
    return allMilestones
      .filter(milestone => 
        milestone.status !== MilestoneStatus.COMPLETED &&
        milestone.targetDate > new Date()
      )
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
      .slice(0, 5);
  }

  private getRecommendedPaths(assessments: SkillAssessment[], careerPaths: CareerPath[]): CareerPath[] {
    // Simple recommendation based on skill matches
    const userSkills = assessments.map(a => a.skillId);
    
    return careerPaths
      .map(path => ({
        path,
        matchScore: this.calculatePathMatchScore(userSkills, path)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map(item => item.path);
  }

  private calculatePathMatchScore(userSkills: string[], path: CareerPath): number {
    const requiredSkillIds = path.requiredSkills.map(s => s.id);
    const matches = userSkills.filter(skill => requiredSkillIds.includes(skill)).length;
    return (matches / requiredSkillIds.length) * 100;
  }

  private calculateProgressSummary(goals: CareerGoal[], assessments: SkillAssessment[]): ProgressSummary {
    const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const totalGoals = goals.length;
    const averageProgress = goals.length > 0 ? 
      goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length : 0;
    
    const skillsAcquired = assessments.filter(a => a.currentLevel >= SkillLevel.INTERMEDIATE).length;
    const skillsInProgress = assessments.filter(a => 
      a.currentLevel > SkillLevel.NONE && a.currentLevel < SkillLevel.INTERMEDIATE
    ).length;
    
    const averageSkillLevel = assessments.length > 0 ?
      assessments.reduce((sum, a) => sum + a.currentLevel, 0) / assessments.length : 0;

    return {
      overallProgress: averageProgress,
      goalsCompleted: completedGoals,
      totalGoals,
      skillsAcquired,
      skillsInProgress,
      averageSkillLevel,
      timeInvested: assessments.length * 10, // Mock calculation
      estimatedTimeToCompletion: Math.max(1, 12 - (averageProgress / 100) * 12)
    };
  }

  private generateSkillMatrix(userId: string, assessments: SkillAssessment[]): SkillMatrix {
    const userAssessments = assessments.filter(a => a.userId === userId);
    const overallLevel = userAssessments.length > 0 ?
      Math.round(userAssessments.reduce((sum, a) => sum + a.currentLevel, 0) / userAssessments.length) : 0;

    const strengthAreas = userAssessments
      .filter(a => a.currentLevel >= SkillLevel.ADVANCED)
      .map(a => a.skillId)
      .slice(0, 5);

    const improvementAreas = userAssessments
      .filter(a => a.currentLevel <= SkillLevel.NOVICE)
      .map(a => a.skillId)
      .slice(0, 5);

    return {
      userId,
      skills: userAssessments,
      overallCompetencyLevel: overallLevel as SkillLevel,
      strengthAreas,
      improvementAreas,
      skillGaps: this.skillGapsSubject.value.slice(0, 5),
      recommendations: [
        'Focus on improving low-level skills',
        'Consider advanced courses for strength areas',
        'Practice with real-world projects'
      ],
      lastAssessed: new Date(),
      nextAssessmentDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }

  private isResourceAppropriate(resource: LearningResource, currentLevel: SkillLevel, targetLevel: SkillLevel): boolean {
    const difficultyMapping = {
      'Beginner': SkillLevel.BEGINNER,
      'Intermediate': SkillLevel.INTERMEDIATE,
      'Advanced': SkillLevel.ADVANCED,
      'Expert': SkillLevel.EXPERT
    };

    const resourceLevel = difficultyMapping[resource.difficulty];
    return resourceLevel >= currentLevel && resourceLevel <= targetLevel;
  }

  private initializeMockData(): void {
    // Initialize mock career paths
    const mockCareerPaths: CareerPath[] = [
      {
        id: 'cp_1',
        title: 'Full Stack Developer',
        description: 'Develop both front-end and back-end applications',
        industry: 'Technology',
        level: CareerLevel.MID,
        requiredSkills: [
          { id: 'js', name: 'JavaScript', level: SkillLevel.ADVANCED } as Skill,
          { id: 'react', name: 'React', level: SkillLevel.INTERMEDIATE } as Skill,
          { id: 'node', name: 'Node.js', level: SkillLevel.INTERMEDIATE } as Skill
        ],
        recommendedSkills: [
          { id: 'ts', name: 'TypeScript', level: SkillLevel.INTERMEDIATE } as Skill
        ],
        averageSalary: { min: 70000, max: 120000, median: 90000, currency: 'USD', region: 'US', experience: CareerLevel.MID },
        jobOutlook: { growthRate: 15, timeframe: '2024-2034', demand: 'Very High', stability: 'High', automation: 'Low Risk' },
        nextSteps: [],
        prerequisites: [],
        timeToAchieve: 18,
        popularity: 85,
        demandLevel: 'Very High',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cp_2',
        title: 'Data Scientist',
        description: 'Analyze complex data to drive business decisions',
        industry: 'Technology',
        level: CareerLevel.MID,
        requiredSkills: [
          { id: 'python', name: 'Python', level: SkillLevel.ADVANCED } as Skill,
          { id: 'ml', name: 'Machine Learning', level: SkillLevel.INTERMEDIATE } as Skill,
          { id: 'stats', name: 'Statistics', level: SkillLevel.ADVANCED } as Skill
        ],
        recommendedSkills: [
          { id: 'sql', name: 'SQL', level: SkillLevel.INTERMEDIATE } as Skill
        ],
        averageSalary: { min: 80000, max: 150000, median: 110000, currency: 'USD', region: 'US', experience: CareerLevel.MID },
        jobOutlook: { growthRate: 25, timeframe: '2024-2034', demand: 'Very High', stability: 'High', automation: 'Low Risk' },
        nextSteps: [],
        prerequisites: [],
        timeToAchieve: 24,
        popularity: 90,
        demandLevel: 'Very High',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialize mock skills
    const mockSkills: Skill[] = [
      {
        id: 'js',
        name: 'JavaScript',
        category: SkillCategory.LANGUAGES,
        description: 'Programming language for web development',
        level: SkillLevel.NONE,
        importance: 'Critical',
        marketDemand: 95,
        difficultyLevel: 6,
        learningResources: [],
        certifications: [],
        relatedSkills: ['ts', 'react', 'node'],
        industryStandard: true,
        trendingScore: 88,
        lastUpdated: new Date()
      },
      {
        id: 'react',
        name: 'React',
        category: SkillCategory.FRAMEWORKS,
        description: 'JavaScript library for building user interfaces',
        level: SkillLevel.NONE,
        importance: 'High',
        marketDemand: 85,
        difficultyLevel: 7,
        learningResources: [],
        certifications: [],
        relatedSkills: ['js', 'ts'],
        industryStandard: true,
        trendingScore: 92,
        lastUpdated: new Date()
      },
      {
        id: 'python',
        name: 'Python',
        category: SkillCategory.LANGUAGES,
        description: 'Programming language for data science and web development',
        level: SkillLevel.NONE,
        importance: 'Critical',
        marketDemand: 90,
        difficultyLevel: 5,
        learningResources: [],
        certifications: [],
        relatedSkills: ['ml', 'stats'],
        industryStandard: true,
        trendingScore: 85,
        lastUpdated: new Date()
      }
    ];

    // Initialize mock career goals
    const mockGoals: CareerGoal[] = [
      {
        id: 'goal_1',
        userId: 'user-1',
        title: 'Become a Full Stack Developer',
        description: 'Master both front-end and back-end development skills',
        targetCareerPath: mockCareerPaths[0],
        targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
        priority: GoalPriority.HIGH,
        status: GoalStatus.ACTIVE,
        progress: 35,
        milestones: [
          {
            id: 'milestone_1',
            title: 'Complete JavaScript Fundamentals',
            description: 'Master JavaScript basics and ES6+ features',
            targetDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
            status: MilestoneStatus.IN_PROGRESS,
            progress: 60,
            dependsOn: [],
            requiredSkills: ['js'],
            estimatedEffort: 40,
            priority: 8,
            notes: 'Focus on async/await and modern features'
          }
        ],
        requiredSkillGaps: [],
        estimatedTimeToComplete: 18,
        difficultyLevel: 7,
        motivationLevel: 9,
        successMetrics: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        isSmartGoal: true
      }
    ];

    // Initialize mock skill gaps
    const mockSkillGaps: SkillGap[] = [
      {
        skillId: 'react',
        skillName: 'React',
        currentLevel: SkillLevel.BEGINNER,
        requiredLevel: SkillLevel.INTERMEDIATE,
        gapSize: 2,
        priority: 'High',
        estimatedLearningTime: 60,
        recommendedResources: [],
        assessmentNeeded: false,
        deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // Initialize mock market insights
    const mockMarketInsights: MarketInsight[] = [
      {
        industry: 'Technology',
        skillId: 'js',
        region: 'United States',
        averageSalary: { min: 60000, max: 130000, median: 85000, currency: 'USD', region: 'US', experience: CareerLevel.MID },
        jobOpenings: 15420,
        growthRate: 18,
        competitionLevel: 'Medium',
        demandTrend: 'High Growth',
        topCompanies: [
          { id: 'comp_1', name: 'Google', industry: 'Technology', size: 'Enterprise', location: 'Mountain View, CA', openPositions: 150, averageSalary: 120000, rating: 4.5 },
          { id: 'comp_2', name: 'Microsoft', industry: 'Technology', size: 'Enterprise', location: 'Redmond, WA', openPositions: 120, averageSalary: 115000, rating: 4.4 }
        ],
        skillDemandRanking: [
          { skillId: 'js', skillName: 'JavaScript', rank: 1, demandScore: 95, growthRate: 18 },
          { skillId: 'react', skillName: 'React', rank: 2, demandScore: 85, growthRate: 22 }
        ],
        lastUpdated: new Date(),
        dataSource: 'Labor Market API'
      }
    ];

    // Set initial data
    this.careerPathsSubject.next(mockCareerPaths);
    this.skillsSubject.next(mockSkills);
    this.careerGoalsSubject.next(mockGoals);
    this.skillGapsSubject.next(mockSkillGaps);
    this.marketInsightsSubject.next(mockMarketInsights);
    this.assessmentsSubject.next([]);
    this.certificationsSubject.next([]);
    this.learningResourcesSubject.next([]);
  }
}

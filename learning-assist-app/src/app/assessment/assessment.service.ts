import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  LearningStyleQuestion, 
  LearningStyleResult, 
  LearningStyleAssessment,
  LearningStyleType,
  UserProfile,
  SkillGapAnalysis,
  SkillAssessment,
  AIRecommendation,
  BehaviorPattern
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private readonly STORAGE_KEY = 'learning_assessments';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  constructor() {
    this.loadUserProfile();
  }

  // Learning Style Assessment Questions
  getLearningStyleQuestions(): Observable<LearningStyleQuestion[]> {
    const questions: LearningStyleQuestion[] = [
      {
        id: 1,
        question: "When learning something new, I prefer to:",
        category: LearningStyleType.VISUAL,
        options: [
          { id: 'a', text: 'See diagrams, charts, or visual aids', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Listen to explanations or discussions', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Try it out hands-on', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Read detailed instructions or notes', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 2,
        question: "I remember information best when:",
        category: LearningStyleType.AUDITORY,
        options: [
          { id: 'a', text: 'I can see it in my mind as pictures or images', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'I hear it explained or discuss it with others', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'I practice or apply it immediately', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'I write it down or take detailed notes', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 3,
        question: "When giving directions, I tend to:",
        category: LearningStyleType.KINESTHETIC,
        options: [
          { id: 'a', text: 'Draw a map or point to landmarks', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Explain verbally with lots of detail', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Walk with them or use gestures', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Write down step-by-step instructions', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 4,
        question: "In a classroom, I learn best when:",
        category: LearningStyleType.READING_WRITING,
        options: [
          { id: 'a', text: 'The teacher uses visual aids and demonstrations', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'There are group discussions and verbal explanations', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'There are hands-on activities and experiments', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'I can take detailed notes and read materials', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 5,
        question: "When I'm trying to concentrate, I:",
        category: LearningStyleType.VISUAL,
        options: [
          { id: 'a', text: 'Need a clean, organized visual environment', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Need quiet or background music', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Need to move around or fidget', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Need to write things down to stay focused', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      // Add more questions to reach 20+
      {
        id: 6,
        question: "When learning a new software application, I prefer to:",
        category: LearningStyleType.AUDITORY,
        options: [
          { id: 'a', text: 'Watch video tutorials or demos', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Have someone explain it to me', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Jump in and start using it', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Read the manual or help documentation', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 7,
        question: "When studying for an exam, I:",
        category: LearningStyleType.KINESTHETIC,
        options: [
          { id: 'a', text: 'Create mind maps or visual summaries', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Read notes aloud or discuss with others', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Use flashcards or practice problems', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Rewrite notes and create detailed outlines', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 8,
        question: "I solve problems by:",
        category: LearningStyleType.READING_WRITING,
        options: [
          { id: 'a', text: 'Visualizing different scenarios', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Talking through the problem', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Working through it step by step', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Writing down all the details and options', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      // Continue with more questions...
      {
        id: 9,
        question: "When I meet new people, I remember them by:",
        category: LearningStyleType.VISUAL,
        options: [
          { id: 'a', text: 'Their face and appearance', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Their voice and what they said', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'What we did together', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Writing down their name and details', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 10,
        question: "My ideal study environment includes:",
        category: LearningStyleType.AUDITORY,
        options: [
          { id: 'a', text: 'Good lighting and organized space', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Background music or complete silence', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Comfortable furniture I can move around', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Plenty of paper and writing materials', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      // Additional questions to reach 20+
      {
        id: 11,
        question: "When following a recipe, I:",
        category: LearningStyleType.KINESTHETIC,
        options: [
          { id: 'a', text: 'Look at pictures of the finished dish', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Have someone explain the steps', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Start cooking and adjust as I go', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Read through all instructions first', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 12,
        question: "I prefer to receive feedback that is:",
        category: LearningStyleType.READING_WRITING,
        options: [
          { id: 'a', text: 'Shown through examples or demonstrations', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Discussed in person or over the phone', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Given during hands-on practice', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Written in detailed comments or reports', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 13,
        question: "When planning a vacation, I:",
        category: LearningStyleType.VISUAL,
        options: [
          { id: 'a', text: 'Look at photos and maps of destinations', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Talk to people who have been there', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Think about activities I want to do', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Research and make detailed lists', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 14,
        question: "In a meeting, I contribute best when:",
        category: LearningStyleType.AUDITORY,
        options: [
          { id: 'a', text: 'There are visual aids and presentations', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'There is open discussion and brainstorming', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'We can work through problems together', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'I can review agendas and take notes', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 15,
        question: "When explaining a concept to others, I:",
        category: LearningStyleType.KINESTHETIC,
        options: [
          { id: 'a', text: 'Draw diagrams or use visual examples', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Explain it verbally with analogies', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Show them how to do it', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Write out step-by-step instructions', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 16,
        question: "I prefer books that:",
        category: LearningStyleType.READING_WRITING,
        options: [
          { id: 'a', text: 'Have lots of pictures and illustrations', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'I can listen to as audiobooks', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Are practical guides I can apply', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Are text-heavy with detailed information', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 17,
        question: "When learning about history, I prefer:",
        category: LearningStyleType.VISUAL,
        options: [
          { id: 'a', text: 'Maps, timelines, and historical images', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Stories and documentaries', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Historical reenactments or site visits', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Reading historical documents and texts', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 18,
        question: "When I'm stressed, I cope by:",
        category: LearningStyleType.AUDITORY,
        options: [
          { id: 'a', text: 'Looking at calming images or organizing my space', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Talking to someone or listening to music', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Doing physical exercise or activities', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Writing in a journal or making lists', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 19,
        question: "In a new city, I navigate by:",
        category: LearningStyleType.KINESTHETIC,
        options: [
          { id: 'a', text: 'Using maps and visual landmarks', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Asking for verbal directions', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Exploring and getting a feel for the area', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Writing down directions and street names', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      },
      {
        id: 20,
        question: "When assembling furniture, I:",
        category: LearningStyleType.READING_WRITING,
        options: [
          { id: 'a', text: 'Follow the picture instructions', weight: 3, styleType: LearningStyleType.VISUAL },
          { id: 'b', text: 'Have someone explain or help me', weight: 3, styleType: LearningStyleType.AUDITORY },
          { id: 'c', text: 'Figure it out by trial and error', weight: 3, styleType: LearningStyleType.KINESTHETIC },
          { id: 'd', text: 'Read all instructions thoroughly first', weight: 3, styleType: LearningStyleType.READING_WRITING }
        ]
      }
    ];

    return of(questions);
  }

  // Calculate learning style results
  calculateLearningStyleResult(answers: { [questionId: number]: string }): Observable<LearningStyleResult> {
    return this.getLearningStyleQuestions().pipe(
      map(questions => {
        const scores = {
          visual: 0,
          auditory: 0,
          kinesthetic: 0,
          readingWriting: 0
        };

        // Calculate scores based on answers
        Object.entries(answers).forEach(([questionId, selectedOption]) => {
          const question = questions.find(q => q.id === parseInt(questionId));
          if (question) {
            const option = question.options.find(o => o.id === selectedOption);
            if (option) {
              switch (option.styleType) {
                case LearningStyleType.VISUAL:
                  scores.visual += option.weight;
                  break;
                case LearningStyleType.AUDITORY:
                  scores.auditory += option.weight;
                  break;
                case LearningStyleType.KINESTHETIC:
                  scores.kinesthetic += option.weight;
                  break;
                case LearningStyleType.READING_WRITING:
                  scores.readingWriting += option.weight;
                  break;
              }
            }
          }
        });

        // Determine primary and secondary styles
        const sortedScores = Object.entries(scores)
          .map(([style, score]) => ({ style: style as keyof typeof scores, score }))
          .sort((a, b) => b.score - a.score);

        const primaryStyle = this.mapScoreKeyToLearningStyle(sortedScores[0].style);
        const secondaryStyle = sortedScores[1].score > 0 ? 
          this.mapScoreKeyToLearningStyle(sortedScores[1].style) : undefined;

        // Generate recommendations
        const recommendations = this.generateLearningStyleRecommendations(primaryStyle, secondaryStyle);

        const result: LearningStyleResult = {
          visualScore: scores.visual,
          auditoryScore: scores.auditory,
          kinestheticScore: scores.kinesthetic,
          readingWritingScore: scores.readingWriting,
          primaryStyle,
          secondaryStyle,
          completedAt: new Date(),
          recommendations
        };

        return result;
      })
    );
  }

  private mapScoreKeyToLearningStyle(key: string): LearningStyleType {
    switch (key) {
      case 'visual': return LearningStyleType.VISUAL;
      case 'auditory': return LearningStyleType.AUDITORY;
      case 'kinesthetic': return LearningStyleType.KINESTHETIC;
      case 'readingWriting': return LearningStyleType.READING_WRITING;
      default: return LearningStyleType.VISUAL;
    }
  }

  private generateLearningStyleRecommendations(primary: LearningStyleType, secondary?: LearningStyleType): string[] {
    const recommendations: string[] = [];

    switch (primary) {
      case LearningStyleType.VISUAL:
        recommendations.push(
          "Use mind maps, diagrams, and flowcharts when studying",
          "Highlight key information with different colors",
          "Watch educational videos and demonstrations",
          "Create visual summaries of complex topics"
        );
        break;
      case LearningStyleType.AUDITORY:
        recommendations.push(
          "Listen to podcasts and audiobooks",
          "Participate in study groups and discussions",
          "Read materials aloud to yourself",
          "Use mnemonics and verbal repetition"
        );
        break;
      case LearningStyleType.KINESTHETIC:
        recommendations.push(
          "Take frequent breaks and move around while studying",
          "Use hands-on activities and experiments",
          "Practice skills in real-world scenarios",
          "Use physical objects and manipulatives when possible"
        );
        break;
      case LearningStyleType.READING_WRITING:
        recommendations.push(
          "Take detailed notes during lectures",
          "Rewrite information in your own words",
          "Create lists, outlines, and written summaries",
          "Use traditional text-based learning materials"
        );
        break;
    }

    if (secondary) {
      recommendations.push(`Combine ${primary} methods with ${secondary} techniques for optimal learning`);
    }

    return recommendations;
  }

  // Save assessment results
  saveAssessment(assessment: LearningStyleAssessment): Observable<LearningStyleAssessment> {
    const assessments = this.getStoredAssessments();
    assessment.id = Date.now().toString();
    assessment.createdAt = new Date();
    assessment.updatedAt = new Date();
    
    assessments.push(assessment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
    
    return of(assessment);
  }

  // Get user's assessment history
  getAssessmentHistory(userId: string): Observable<LearningStyleAssessment[]> {
    const assessments = this.getStoredAssessments();
    return of(assessments.filter(a => a.userId === userId));
  }

  // Get latest assessment
  getLatestAssessment(userId: string): Observable<LearningStyleAssessment | null> {
    return this.getAssessmentHistory(userId).pipe(
      map(assessments => {
        if (assessments.length === 0) return null;
        return assessments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      })
    );
  }

  private getStoredAssessments(): LearningStyleAssessment[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // AI Profiling Methods
  updateUserProfile(profile: UserProfile): Observable<UserProfile> {
    localStorage.setItem('user_profile', JSON.stringify(profile));
    this.userProfileSubject.next(profile);
    return of(profile);
  }

  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }

  private loadUserProfile(): void {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      this.userProfileSubject.next(JSON.parse(stored));
    }
  }

  // Track user behavior for AI profiling
  trackBehavior(pattern: BehaviorPattern): void {
    const profile = this.userProfileSubject.value;
    if (profile) {
      const existingPatternIndex = profile.behaviorPatterns.findIndex(
        p => p.pattern === pattern.pattern && p.category === pattern.category
      );
      
      if (existingPatternIndex >= 0) {
        profile.behaviorPatterns[existingPatternIndex].frequency += 1;
      } else {
        profile.behaviorPatterns.push(pattern);
      }
      
      profile.lastUpdated = new Date();
      this.updateUserProfile(profile).subscribe();
    }
  }

  // Skill Gap Analysis
  performSkillGapAnalysis(skills: SkillAssessment[]): Observable<SkillGapAnalysis> {
    const analysis: SkillGapAnalysis = {
      userId: 'current-user', // This should come from auth service
      skills: skills.map(skill => ({
        ...skill,
        gap: skill.targetLevel - skill.currentLevel,
        priority: this.calculateSkillPriority(skill),
        recommendations: this.generateSkillRecommendations(skill)
      })),
      overallScore: this.calculateOverallScore(skills),
      completedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    return of(analysis);
  }

  private calculateSkillPriority(skill: SkillAssessment): 'high' | 'medium' | 'low' {
    const gap = skill.targetLevel - skill.currentLevel;
    if (gap >= 4) return 'high';
    if (gap >= 2) return 'medium';
    return 'low';
  }

  private generateSkillRecommendations(skill: SkillAssessment): string[] {
    const gap = skill.targetLevel - skill.currentLevel;
    const recommendations: string[] = [];

    if (gap <= 0) {
      recommendations.push(`You've mastered ${skill.skillName}! Consider mentoring others.`);
    } else if (gap === 1) {
      recommendations.push(`Practice advanced ${skill.skillName} techniques`);
      recommendations.push(`Take on challenging projects involving ${skill.skillName}`);
    } else if (gap <= 3) {
      recommendations.push(`Enroll in intermediate ${skill.skillName} courses`);
      recommendations.push(`Find a mentor for ${skill.skillName} guidance`);
      recommendations.push(`Practice ${skill.skillName} regularly with real projects`);
    } else {
      recommendations.push(`Start with fundamentals of ${skill.skillName}`);
      recommendations.push(`Take a structured course in ${skill.skillName}`);
      recommendations.push(`Dedicate focused study time to ${skill.skillName}`);
    }

    return recommendations;
  }

  private calculateOverallScore(skills: SkillAssessment[]): number {
    if (skills.length === 0) return 0;
    
    const totalCurrent = skills.reduce((sum, skill) => sum + skill.currentLevel, 0);
    const totalTarget = skills.reduce((sum, skill) => sum + skill.targetLevel, 0);
    
    return Math.round((totalCurrent / totalTarget) * 100);
  }

  // Generate AI recommendations
  generateRecommendations(profile: UserProfile, latestAssessment: LearningStyleAssessment | null): Observable<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Learning style based recommendations
    if (latestAssessment) {
      recommendations.push({
        type: 'study-method',
        title: `Optimize for ${latestAssessment.result.primaryStyle} Learning`,
        description: `Based on your learning style assessment, focus on ${latestAssessment.result.primaryStyle} learning methods`,
        priority: 9,
        confidence: 0.85,
        generatedAt: new Date()
      });
    }

    // Engagement level recommendations
    if (profile.engagementLevel < 6) {
      recommendations.push({
        type: 'content',
        title: 'Increase Engagement',
        description: 'Try more interactive content and gamified learning experiences',
        priority: 8,
        confidence: 0.75,
        generatedAt: new Date()
      });
    }

    // Learning speed recommendations
    if (profile.learningSpeed < 5) {
      recommendations.push({
        type: 'schedule',
        title: 'Adjust Learning Pace',
        description: 'Consider shorter, more frequent study sessions',
        priority: 7,
        confidence: 0.70,
        generatedAt: new Date()
      });
    }

    return of(recommendations.sort((a, b) => b.priority - a.priority));
  }
}

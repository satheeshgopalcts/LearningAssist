import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import {
  LearningResource,
  ResourceRecommendation,
  ResourceFilter,
  SearchCriteria,
  PersonalizationProfile,
  UserInteraction,
  ResourceCollection,
  ExpertCuratedContent,
  CommunityResource,
  ResourceType,
  ResourceFormat,
  ResourceSource,
  DifficultyLevel,
  SortOption,
  InteractionType,
  AdaptedContent,
  RecommendationContext,
  ContentModification,
  LearningStyleOptimization
} from '../models/resource-recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class ResourceRecommendationService {
  private resourcesSubject = new BehaviorSubject<LearningResource[]>([]);
  private recommendationsSubject = new BehaviorSubject<ResourceRecommendation[]>([]);
  private collectionsSubject = new BehaviorSubject<ResourceCollection[]>([]);
  private expertContentSubject = new BehaviorSubject<ExpertCuratedContent[]>([]);
  private communityResourcesSubject = new BehaviorSubject<CommunityResource[]>([]);
  private personalizationProfileSubject = new BehaviorSubject<PersonalizationProfile | null>(null);
  private userInteractionsSubject = new BehaviorSubject<UserInteraction[]>([]);

  constructor() {
    this.initializeMockData();
  }

  // AI-Powered Resource Discovery
  getPersonalizedRecommendations(
    userId: string,
    context?: RecommendationContext
  ): Observable<ResourceRecommendation[]> {
    return combineLatest([
      this.resourcesSubject,
      this.personalizationProfileSubject
    ]).pipe(
      map(([resources, profile]) => {
        if (!profile) {
          return this.getDefaultRecommendations(resources);
        }
        return this.generateAIRecommendations(resources, profile, context);
      })
    );
  }

  searchResources(criteria: SearchCriteria): Observable<LearningResource[]> {
    return this.resourcesSubject.pipe(
      map(resources => {
        let filtered = this.applyFilters(resources, criteria.filters);
        filtered = this.applyTextSearch(filtered, criteria.query);
        return this.sortResources(filtered, criteria.sortBy);
      })
    );
  }

  getResourceById(id: string): Observable<LearningResource | undefined> {
    return this.resourcesSubject.pipe(
      map(resources => resources.find(r => r.id === id))
    );
  }

  // Multi-Source Content Aggregation
  getResourcesBySource(source: ResourceSource): Observable<LearningResource[]> {
    return this.resourcesSubject.pipe(
      map(resources => resources.filter(r => r.source === source))
    );
  }

  aggregateExternalContent(): Observable<LearningResource[]> {
    // Simulate aggregation from multiple sources
    return this.resourcesSubject.pipe(
      map(resources => resources.filter(r => r.source !== ResourceSource.INTERNAL))
    );
  }

  getQualityVerifiedResources(): Observable<LearningResource[]> {
    return this.resourcesSubject.pipe(
      map(resources => resources.filter(r => r.rating >= 4.0 && r.reviewCount >= 10))
    );
  }

  // Personalized Learning Materials
  getAdaptedContent(
    resource: LearningResource,
    userProfile: PersonalizationProfile
  ): Observable<AdaptedContent> {
    return of(this.adaptContentForUser(resource, userProfile));
  }

  getContextualRecommendations(
    currentTopic: string,
    learningGoal: string
  ): Observable<ResourceRecommendation[]> {
    const context: RecommendationContext = {
      currentTopic,
      learningGoal,
      timeAvailable: 30 // Default 30 minutes
    };

    return this.getPersonalizedRecommendations('current-user', context);
  }

  getJustInTimeResources(skillGap: string): Observable<LearningResource[]> {
    return this.resourcesSubject.pipe(
      map(resources => 
        resources
          .filter(r => 
            r.tags.some(tag => tag.toLowerCase().includes(skillGap.toLowerCase())) ||
            r.category.toLowerCase().includes(skillGap.toLowerCase())
          )
          .filter(r => r.duration <= 15) // Quick resources
          .sort((a, b) => b.relevanceScore! - a.relevanceScore!)
          .slice(0, 5)
      )
    );
  }

  // Expert-Curated Content
  getExpertCuratedContent(): Observable<ExpertCuratedContent[]> {
    return this.expertContentSubject.asObservable();
  }

  getVerifiedExpertContent(): Observable<ExpertCuratedContent[]> {
    return this.expertContentSubject.pipe(
      map(content => content.filter(c => c.verificationStatus === 'verified'))
    );
  }

  getExpertContentBySpecialization(specialization: string): Observable<ExpertCuratedContent[]> {
    return this.expertContentSubject.pipe(
      map(content => 
        content.filter(c => 
          c.specialization.some(s => s.toLowerCase().includes(specialization.toLowerCase()))
        )
      )
    );
  }

  // Community-Generated Resources
  getCommunityResources(): Observable<CommunityResource[]> {
    return this.communityResourcesSubject.asObservable();
  }

  getApprovedCommunityResources(): Observable<CommunityResource[]> {
    return this.communityResourcesSubject.pipe(
      map(resources => resources.filter(r => r.moderationStatus === 'approved'))
    );
  }

  submitCommunityResource(resource: LearningResource, contributorId: string): Observable<boolean> {
    const communityResource: CommunityResource = {
      resource,
      contributorId,
      contributorName: `User_${contributorId}`,
      submissionDate: new Date(),
      moderationStatus: 'pending',
      communityRating: 0,
      reviewCount: 0,
      reportCount: 0
    };

    const current = this.communityResourcesSubject.value;
    this.communityResourcesSubject.next([...current, communityResource]);
    return of(true);
  }

  // Resource Collections
  getResourceCollections(): Observable<ResourceCollection[]> {
    return this.collectionsSubject.asObservable();
  }

  getPublicCollections(): Observable<ResourceCollection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(c => c.isPublic))
    );
  }

  createResourceCollection(collection: Omit<ResourceCollection, 'id' | 'createdDate'>): Observable<ResourceCollection> {
    const newCollection: ResourceCollection = {
      ...collection,
      id: `collection_${Date.now()}`,
      createdDate: new Date()
    };

    const current = this.collectionsSubject.value;
    this.collectionsSubject.next([...current, newCollection]);
    return of(newCollection);
  }

  // User Interactions & Personalization
  trackUserInteraction(interaction: UserInteraction): Observable<void> {
    const current = this.userInteractionsSubject.value;
    this.userInteractionsSubject.next([...current, interaction]);
    
    // Update personalization profile based on interaction
    this.updatePersonalizationProfile(interaction);
    return of(void 0);
  }

  bookmarkResource(resourceId: string): Observable<boolean> {
    const interaction: UserInteraction = {
      resourceId,
      interactionType: InteractionType.BOOKMARK,
      timestamp: new Date()
    };

    return this.trackUserInteraction(interaction).pipe(map(() => true));
  }

  rateResource(resourceId: string, rating: number): Observable<boolean> {
    const interaction: UserInteraction = {
      resourceId,
      interactionType: InteractionType.RATE,
      timestamp: new Date(),
      rating
    };

    return this.trackUserInteraction(interaction).pipe(map(() => true));
  }

  // Utility Methods
  private applyFilters(resources: LearningResource[], filters: Partial<ResourceFilter>): LearningResource[] {
    return resources.filter(resource => {
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(resource.category)) return false;
      }

      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(resource.type)) return false;
      }

      if (filters.difficulties && filters.difficulties.length > 0) {
        if (!filters.difficulties.includes(resource.difficulty)) return false;
      }

      if (filters.sources && filters.sources.length > 0) {
        if (!filters.sources.includes(resource.source)) return false;
      }

      if (filters.duration) {
        if (resource.duration < filters.duration.min || resource.duration > filters.duration.max) {
          return false;
        }
      }

      if (filters.rating) {
        if (resource.rating < filters.rating.min || resource.rating > filters.rating.max) {
          return false;
        }
      }

      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => resource.tags.includes(tag))) return false;
      }

      return true;
    });
  }

  private applyTextSearch(resources: LearningResource[], query: string): LearningResource[] {
    if (!query.trim()) return resources;

    const searchTerm = query.toLowerCase();
    return resources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm) ||
      resource.description.toLowerCase().includes(searchTerm) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      resource.author.toLowerCase().includes(searchTerm)
    );
  }

  private sortResources(resources: LearningResource[], sortBy: SortOption): LearningResource[] {
    const sortedResources = [...resources];

    switch (sortBy) {
      case SortOption.RELEVANCE:
        return sortedResources.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      case SortOption.RATING:
        return sortedResources.sort((a, b) => b.rating - a.rating);
      case SortOption.POPULARITY:
        return sortedResources.sort((a, b) => b.popularity - a.popularity);
      case SortOption.DATE_PUBLISHED:
        return sortedResources.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
      case SortOption.DURATION:
        return sortedResources.sort((a, b) => a.duration - b.duration);
      case SortOption.ALPHABETICAL:
        return sortedResources.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sortedResources;
    }
  }

  private generateAIRecommendations(
    resources: LearningResource[],
    profile: PersonalizationProfile,
    context?: RecommendationContext
  ): ResourceRecommendation[] {
    // AI recommendation algorithm simulation
    return resources
      .filter(resource => !profile.completedResources.includes(resource.id))
      .map(resource => ({
        resource: {
          ...resource,
          relevanceScore: this.calculateRelevanceScore(resource, profile, context)
        },
        recommendationReason: this.generateRecommendationReason(resource, profile, context),
        confidenceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
        estimatedCompletionTime: Math.ceil(resource.duration * (1 + Math.random() * 0.2)),
        adaptedContent: this.adaptContentForUser(resource, profile)
      }))
      .sort((a, b) => (b.resource.relevanceScore || 0) - (a.resource.relevanceScore || 0))
      .slice(0, 10);
  }

  private getDefaultRecommendations(resources: LearningResource[]): ResourceRecommendation[] {
    return resources
      .filter(r => r.isFeatured || r.rating >= 4.5)
      .slice(0, 8)
      .map(resource => ({
        resource,
        recommendationReason: 'Highly rated and popular content',
        confidenceScore: 0.8,
        estimatedCompletionTime: resource.duration
      }));
  }

  private calculateRelevanceScore(
    resource: LearningResource,
    profile: PersonalizationProfile,
    context?: RecommendationContext
  ): number {
    let score = 0;

    // Career goals alignment
    const goalAlignment = profile.careerGoals.some(goal =>
      resource.tags.some(tag => tag.toLowerCase().includes(goal.toLowerCase())) ||
      resource.category.toLowerCase().includes(goal.toLowerCase())
    );
    if (goalAlignment) score += 30;

    // Learning style compatibility
    if (profile.preferredFormats.includes(resource.format)) score += 20;

    // Skill level appropriateness
    const skillLevel = profile.currentSkillLevel[resource.category] || DifficultyLevel.BEGINNER;
    if (this.isDifficultyAppropriate(resource.difficulty, skillLevel)) score += 25;

    // Context relevance
    if (context?.currentTopic) {
      const topicMatch = resource.tags.some(tag =>
        tag.toLowerCase().includes(context.currentTopic!.toLowerCase())
      );
      if (topicMatch) score += 15;
    }

    // Quality indicators
    score += (resource.rating / 5) * 10;

    return Math.min(100, score);
  }

  private isDifficultyAppropriate(resourceDifficulty: DifficultyLevel, userLevel: DifficultyLevel): boolean {
    const levels = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT];
    const resourceIndex = levels.indexOf(resourceDifficulty);
    const userIndex = levels.indexOf(userLevel);
    
    // Allow current level and one level up
    return resourceIndex >= userIndex && resourceIndex <= userIndex + 1;
  }

  private generateRecommendationReason(
    resource: LearningResource,
    profile: PersonalizationProfile,
    context?: RecommendationContext
  ): string {
    const reasons = [];

    if (profile.careerGoals.some(goal => resource.category.toLowerCase().includes(goal.toLowerCase()))) {
      reasons.push('aligns with your career goals');
    }

    if (profile.preferredFormats.includes(resource.format)) {
      reasons.push('matches your preferred learning format');
    }

    if (resource.rating >= 4.5) {
      reasons.push('highly rated by other learners');
    }

    if (context?.currentTopic && resource.tags.some(tag => tag.toLowerCase().includes(context.currentTopic!.toLowerCase()))) {
      reasons.push('relevant to your current learning topic');
    }

    return reasons.length > 0 ? `Recommended because it ${reasons.join(' and ')}` : 'Popular and well-reviewed content';
  }

  private adaptContentForUser(resource: LearningResource, profile: PersonalizationProfile): AdaptedContent {
    const userSkillLevel = profile.currentSkillLevel[resource.category] || DifficultyLevel.BEGINNER;
    const modifications: ContentModification[] = [];
    const optimizations: LearningStyleOptimization[] = [];

    // Content modifications based on skill level
    if (userSkillLevel === DifficultyLevel.BEGINNER && resource.difficulty !== DifficultyLevel.BEGINNER) {
      modifications.push({
        type: 'simplify',
        description: 'Simplified explanations and additional context',
        rationale: 'User is at beginner level for this topic'
      });
    }

    // Learning style optimizations
    if (profile.learningStyle === 'visual') {
      optimizations.push({
        learningStyle: 'visual',
        optimization: 'Enhanced visual elements',
        implementation: 'Additional diagrams, charts, and visual aids'
      });
    }

    return {
      originalDifficulty: resource.difficulty,
      adaptedDifficulty: this.getAdaptedDifficulty(resource.difficulty, userSkillLevel),
      contentModifications: modifications,
      learningStyleOptimizations: optimizations
    };
  }

  private getAdaptedDifficulty(original: DifficultyLevel, userLevel: DifficultyLevel): DifficultyLevel {
    const levels = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT];
    const originalIndex = levels.indexOf(original);
    const userIndex = levels.indexOf(userLevel);

    // If user level is lower, adapt content down
    if (userIndex < originalIndex - 1) {
      return levels[Math.max(0, userIndex + 1)];
    }

    return original;
  }

  private updatePersonalizationProfile(interaction: UserInteraction): void {
    const currentProfile = this.personalizationProfileSubject.value;
    if (!currentProfile) return;

    // Update based on interaction type
    switch (interaction.interactionType) {
      case InteractionType.COMPLETE:
        if (!currentProfile.completedResources.includes(interaction.resourceId)) {
          currentProfile.completedResources.push(interaction.resourceId);
        }
        break;
      case InteractionType.BOOKMARK:
        if (!currentProfile.bookmarkedResources.includes(interaction.resourceId)) {
          currentProfile.bookmarkedResources.push(interaction.resourceId);
        }
        break;
      case InteractionType.RATE:
        if (interaction.rating) {
          currentProfile.ratingHistory[interaction.resourceId] = interaction.rating;
        }
        break;
    }

    this.personalizationProfileSubject.next(currentProfile);
  }

  private initializeMockData(): void {
    // Mock learning resources
    const mockResources: LearningResource[] = [
      {
        id: 'resource-1',
        title: 'JavaScript Fundamentals for Beginners',
        description: 'Complete guide to JavaScript basics covering variables, functions, and DOM manipulation',
        type: ResourceType.COURSE,
        category: 'Programming',
        difficulty: DifficultyLevel.BEGINNER,
        duration: 120,
        format: ResourceFormat.VIDEO,
        source: ResourceSource.INTERNAL,
        url: '/courses/javascript-fundamentals',
        thumbnailUrl: '/assets/images/js-fundamentals.jpg',
        author: 'Dr. Sarah Johnson',
        publishedDate: new Date('2024-01-15'),
        lastUpdated: new Date('2024-03-20'),
        rating: 4.8,
        reviewCount: 256,
        tags: ['javascript', 'programming', 'web development', 'beginner'],
        prerequisites: [],
        learningOutcomes: ['Understand JavaScript syntax', 'Work with variables and functions', 'Manipulate DOM elements'],
        isBookmarked: false,
        isFeatured: true,
        language: 'English',
        popularity: 95,
        relevanceScore: 88
      },
      {
        id: 'resource-2',
        title: 'Advanced React Patterns',
        description: 'Master advanced React concepts including hooks, context, and performance optimization',
        type: ResourceType.TUTORIAL,
        category: 'Frontend Development',
        difficulty: DifficultyLevel.ADVANCED,
        duration: 180,
        format: ResourceFormat.INTERACTIVE,
        source: ResourceSource.GITHUB,
        url: 'https://github.com/advanced-react-patterns',
        thumbnailUrl: '/assets/images/react-advanced.jpg',
        author: 'Mike Chen',
        publishedDate: new Date('2024-02-10'),
        lastUpdated: new Date('2024-04-05'),
        rating: 4.9,
        reviewCount: 142,
        tags: ['react', 'javascript', 'frontend', 'advanced', 'hooks'],
        prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
        learningOutcomes: ['Implement advanced React patterns', 'Optimize component performance', 'Use custom hooks effectively'],
        isBookmarked: true,
        isFeatured: false,
        language: 'English',
        popularity: 78,
        relevanceScore: 92
      },
      {
        id: 'resource-3',
        title: 'Python Data Science Bootcamp',
        description: 'Comprehensive introduction to data science using Python, pandas, and matplotlib',
        type: ResourceType.COURSE,
        category: 'Data Science',
        difficulty: DifficultyLevel.INTERMEDIATE,
        duration: 300,
        format: ResourceFormat.VIDEO,
        source: ResourceSource.COURSERA,
        url: 'https://coursera.org/python-data-science',
        thumbnailUrl: '/assets/images/python-ds.jpg',
        author: 'Prof. Lisa Wang',
        publishedDate: new Date('2024-01-20'),
        lastUpdated: new Date('2024-03-15'),
        rating: 4.7,
        reviewCount: 389,
        tags: ['python', 'data science', 'pandas', 'matplotlib', 'analytics'],
        prerequisites: ['Basic Python knowledge'],
        learningOutcomes: ['Analyze data with pandas', 'Create visualizations', 'Build predictive models'],
        isBookmarked: false,
        isFeatured: true,
        language: 'English',
        popularity: 87,
        relevanceScore: 75
      },
      {
        id: 'resource-4',
        title: 'UI/UX Design Principles',
        description: 'Essential design principles for creating user-friendly interfaces and experiences',
        type: ResourceType.ARTICLE,
        category: 'Design',
        difficulty: DifficultyLevel.BEGINNER,
        duration: 45,
        format: ResourceFormat.TEXT,
        source: ResourceSource.MEDIUM,
        url: 'https://medium.com/@designer/ui-ux-principles',
        thumbnailUrl: '/assets/images/ui-ux-design.jpg',
        author: 'Emma Rodriguez',
        publishedDate: new Date('2024-03-01'),
        lastUpdated: new Date('2024-03-01'),
        rating: 4.6,
        reviewCount: 98,
        tags: ['ui', 'ux', 'design', 'user experience', 'interface'],
        prerequisites: [],
        learningOutcomes: ['Understand design principles', 'Create user-centered designs', 'Apply accessibility guidelines'],
        isBookmarked: false,
        isFeatured: false,
        language: 'English',
        popularity: 72,
        relevanceScore: 68
      },
      {
        id: 'resource-5',
        title: 'Machine Learning Algorithms Explained',
        description: 'Deep dive into popular machine learning algorithms with practical examples',
        type: ResourceType.VIDEO,
        category: 'Machine Learning',
        difficulty: DifficultyLevel.ADVANCED,
        duration: 240,
        format: ResourceFormat.VIDEO,
        source: ResourceSource.YOUTUBE,
        url: 'https://youtube.com/watch?v=ml-algorithms',
        thumbnailUrl: '/assets/images/ml-algorithms.jpg',
        author: 'Dr. James Park',
        publishedDate: new Date('2024-02-15'),
        lastUpdated: new Date('2024-02-15'),
        rating: 4.9,
        reviewCount: 567,
        tags: ['machine learning', 'algorithms', 'ai', 'data science', 'python'],
        prerequisites: ['Statistics basics', 'Python programming'],
        learningOutcomes: ['Understand ML algorithms', 'Implement algorithms in Python', 'Choose appropriate algorithms'],
        isBookmarked: true,
        isFeatured: true,
        language: 'English',
        popularity: 94,
        relevanceScore: 85
      }
    ];

    // Mock expert curated content
    const mockExpertContent: ExpertCuratedContent[] = [
      {
        expertId: 'expert-1',
        expertName: 'Dr. Sarah Johnson',
        expertCredentials: ['PhD Computer Science', '15+ years industry experience', 'Published researcher'],
        curationDate: new Date('2024-03-10'),
        resources: [mockResources[0], mockResources[1]],
        curatorNotes: 'Carefully selected resources for JavaScript and React learning path',
        specialization: ['JavaScript', 'Frontend Development', 'Web Technologies'],
        verificationStatus: 'verified'
      },
      {
        expertId: 'expert-2',
        expertName: 'Prof. Lisa Wang',
        expertCredentials: ['Professor of Data Science', 'Industry consultant', 'Author of 3 books'],
        curationDate: new Date('2024-03-15'),
        resources: [mockResources[2], mockResources[4]],
        curatorNotes: 'Essential resources for data science and machine learning journey',
        specialization: ['Data Science', 'Machine Learning', 'Python'],
        verificationStatus: 'verified'
      }
    ];

    // Mock community resources
    const mockCommunityResources: CommunityResource[] = [
      {
        resource: mockResources[3],
        contributorId: 'user-123',
        contributorName: 'Alex Thompson',
        submissionDate: new Date('2024-03-05'),
        moderationStatus: 'approved',
        communityRating: 4.5,
        reviewCount: 23,
        reportCount: 0
      }
    ];

    // Mock resource collections
    const mockCollections: ResourceCollection[] = [
      {
        id: 'collection-1',
        name: 'Frontend Development Essentials',
        description: 'Complete collection for learning modern frontend development',
        createdBy: 'admin',
        createdDate: new Date('2024-03-01'),
        resources: [mockResources[0], mockResources[1], mockResources[3]],
        isPublic: true,
        tags: ['frontend', 'javascript', 'react', 'ui'],
        category: 'Programming',
        collaborators: ['expert-1']
      },
      {
        id: 'collection-2',
        name: 'Data Science Starter Pack',
        description: 'Perfect starting point for aspiring data scientists',
        createdBy: 'expert-2',
        createdDate: new Date('2024-03-05'),
        resources: [mockResources[2], mockResources[4]],
        isPublic: true,
        tags: ['data science', 'python', 'machine learning'],
        category: 'Data Science',
        collaborators: []
      }
    ];

    // Mock personalization profile
    const mockProfile: PersonalizationProfile = {
      userId: 'user-current',
      learningStyle: 'visual',
      currentSkillLevel: {
        'Programming': DifficultyLevel.INTERMEDIATE,
        'Data Science': DifficultyLevel.BEGINNER,
        'Design': DifficultyLevel.BEGINNER
      },
      preferredFormats: [ResourceFormat.VIDEO, ResourceFormat.INTERACTIVE],
      timeAvailability: 60,
      careerGoals: ['Full Stack Developer', 'Software Engineer'],
      completedResources: [],
      bookmarkedResources: ['resource-2', 'resource-5'],
      ratingHistory: {},
      searchHistory: ['javascript', 'react', 'frontend development'],
      engagementMetrics: {
        averageTimePerResource: 45,
        completionRate: 0.75,
        preferredDuration: 90
      }
    };

    // Initialize subjects
    this.resourcesSubject.next(mockResources);
    this.expertContentSubject.next(mockExpertContent);
    this.communityResourcesSubject.next(mockCommunityResources);
    this.collectionsSubject.next(mockCollections);
    this.personalizationProfileSubject.next(mockProfile);
    this.userInteractionsSubject.next([]);
  }
}

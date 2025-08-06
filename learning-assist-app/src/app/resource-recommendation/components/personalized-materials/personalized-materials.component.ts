import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResourceRecommendationService } from '../../resource-recommendation.service';
import {
  LearningResource,
  ResourceRecommendation,
  AdaptedContent,
  PersonalizationProfile,
  RecommendationContext,
  DifficultyLevel
} from '../../../models/resource-recommendation.model';

@Component({
  selector: 'app-personalized-materials',
  templateUrl: './personalized-materials.component.html',
  styleUrls: ['./personalized-materials.component.scss']
})
export class PersonalizedMaterialsComponent implements OnInit, OnDestroy {
  personalizedRecommendations: ResourceRecommendation[] = [];
  contextualRecommendations: ResourceRecommendation[] = [];
  justInTimeResources: LearningResource[] = [];
  adaptedContentMap: { [resourceId: string]: AdaptedContent } = {};
  
  // Context settings
  currentTopic = '';
  learningGoal = '';
  skillGap = '';
  timeAvailable = 30;
  
  // Available contexts for quick selection
  quickTopics = [
    'JavaScript Fundamentals',
    'React Development',
    'Python Programming',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Backend Development',
    'Mobile Development'
  ];
  
  quickGoals = [
    'Get job ready',
    'Learn new technology',
    'Improve existing skills',
    'Prepare for certification',
    'Build a project',
    'Career transition',
    'Stay updated',
    'Fill knowledge gaps'
  ];
  
  commonSkillGaps = [
    'Algorithm optimization',
    'Database design',
    'API development',
    'Testing strategies',
    'Deployment processes',
    'Security practices',
    'Performance tuning',
    'Code architecture'
  ];
  
  // Loading state
  isLoading = false;
  
  // Selected tab
  selectedTab: 'personalized' | 'contextual' | 'justintime' = 'personalized';
  
  private subscriptions: Subscription[] = [];

  constructor(private resourceService: ResourceRecommendationService) {}

  ngOnInit(): void {
    this.loadPersonalizedRecommendations();
    this.loadJustInTimeResources();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onTabChange(tab: 'personalized' | 'contextual' | 'justintime'): void {
    this.selectedTab = tab;
    
    if (tab === 'contextual' && this.contextualRecommendations.length === 0) {
      this.updateContextualRecommendations();
    }
  }

  onQuickTopicSelect(topic: string): void {
    this.currentTopic = topic;
    this.updateContextualRecommendations();
  }

  onQuickGoalSelect(goal: string): void {
    this.learningGoal = goal;
    this.updateContextualRecommendations();
  }

  onQuickSkillGapSelect(skillGap: string): void {
    this.skillGap = skillGap;
    this.loadJustInTimeResources();
  }

  updateContextualRecommendations(): void {
    if (!this.currentTopic && !this.learningGoal) return;
    
    this.isLoading = true;
    const sub = this.resourceService.getContextualRecommendations(
      this.currentTopic,
      this.learningGoal
    ).subscribe({
      next: (recommendations) => {
        this.contextualRecommendations = recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contextual recommendations:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadPersonalizedRecommendations(): void {
    this.isLoading = true;
    const sub = this.resourceService.getPersonalizedRecommendations('current-user').subscribe({
      next: (recommendations) => {
        this.personalizedRecommendations = recommendations;
        
        // Load adapted content for each recommendation
        recommendations.forEach(rec => {
          if (rec.adaptedContent) {
            this.adaptedContentMap[rec.resource.id] = rec.adaptedContent;
          }
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading personalized recommendations:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadJustInTimeResources(): void {
    if (!this.skillGap) return;
    
    const sub = this.resourceService.getJustInTimeResources(this.skillGap).subscribe({
      next: (resources) => {
        this.justInTimeResources = resources;
      },
      error: (error) => {
        console.error('Error loading just-in-time resources:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  clearContext(): void {
    this.currentTopic = '';
    this.learningGoal = '';
    this.contextualRecommendations = [];
  }

  clearSkillGap(): void {
    this.skillGap = '';
    this.justInTimeResources = [];
  }

  onResourceClick(resource: LearningResource): void {
    // Track user interaction
    this.resourceService.trackUserInteraction({
      resourceId: resource.id,
      interactionType: 'view' as any,
      timestamp: new Date()
    }).subscribe();
    
    console.log('Opening resource:', resource.title);
  }

  onBookmarkResource(resource: LearningResource, event: Event): void {
    event.stopPropagation();
    
    this.resourceService.bookmarkResource(resource.id).subscribe({
      next: () => {
        resource.isBookmarked = !resource.isBookmarked;
      },
      error: (error) => {
        console.error('Error bookmarking resource:', error);
      }
    });
  }

  // Methods required by template
  onContextChange(): void {
    this.loadPersonalizedRecommendations();
    this.updateContextualRecommendations();
  }

  selectTopic(topic: string): void {
    this.currentTopic = topic;
    this.onContextChange();
  }

  selectGoal(goal: string): void {
    this.learningGoal = goal;
    this.onContextChange();
  }

  hasAdaptedContent(resourceId: string): boolean {
    return !!this.adaptedContentMap[resourceId];
  }

  getAdaptedContent(resourceId: string): AdaptedContent | undefined {
    return this.adaptedContentMap[resourceId];
  }

  getConfidenceClass(confidenceScore: number): string {
    if (confidenceScore >= 0.8) return 'high';
    if (confidenceScore >= 0.6) return 'medium';
    return 'low';
  }

  toggleBookmark(resource: LearningResource): void {
    resource.isBookmarked = !resource.isBookmarked;
    // In a real app, this would call a service to persist the bookmark
  }

  getDifficultyClass(difficulty: DifficultyLevel): string {
    return difficulty.toLowerCase();
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  adaptContent(resource: LearningResource): void {
    this.isLoading = true;
    
    // Simulate content adaptation
    setTimeout(() => {
      const adaptedContent: AdaptedContent = {
        originalDifficulty: resource.difficulty,
        adaptedDifficulty: DifficultyLevel.BEGINNER,
        contentModifications: [
          {
            type: 'simplify',
            description: 'Simplified complex concepts with step-by-step explanations',
            rationale: 'Based on user learning level'
          }
        ],
        learningStyleOptimizations: [
          {
            learningStyle: 'visual',
            optimization: 'Added visual diagrams and flowcharts',
            implementation: 'Interactive visual elements added to explain complex concepts'
          }
        ]
      };
      
      this.adaptedContentMap[resource.id] = adaptedContent;
      this.isLoading = false;
    }, 2000);
  }

  accessResource(resource: LearningResource): void {
    // In a real app, this would navigate to the resource or open it
    console.log('Accessing resource:', resource.title);
    window.open(resource.url, '_blank');
  }

  shareResource(resource: LearningResource): void {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: resource.url
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(resource.url);
      alert('Resource URL copied to clipboard!');
    }
  }

  getUrgencyClass(estimatedTime: number): string {
    if (estimatedTime <= 10) return 'urgent';
    if (estimatedTime <= 30) return 'moderate';
    return 'relaxed';
  }

  saveForLater(resource: LearningResource): void {
    resource.isBookmarked = true;
    // In a real app, this would call a service to save for later
    console.log('Saved for later:', resource.title);
  }

  getNextRecommendation(): string {
    if (this.personalizedRecommendations.length > 0) {
      return this.personalizedRecommendations[0].resource.title;
    }
    return 'Continue exploring based on your interests';
  }

  generateRecommendations(): void {
    this.isLoading = true;
    this.loadPersonalizedRecommendations();
    this.updateContextualRecommendations();
    this.loadJustInTimeResources();
  }

  getDifficultyDisplayName(difficulty: DifficultyLevel): string {
    const difficultyNames: { [key in DifficultyLevel]: string } = {
      [DifficultyLevel.BEGINNER]: 'Beginner',
      [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
      [DifficultyLevel.ADVANCED]: 'Advanced',
      [DifficultyLevel.EXPERT]: 'Expert'
    };
    return difficultyNames[difficulty];
  }

  getDifficultyColor(difficulty: DifficultyLevel): string {
    const colors: { [key in DifficultyLevel]: string } = {
      [DifficultyLevel.BEGINNER]: '#4CAF50',
      [DifficultyLevel.INTERMEDIATE]: '#FF9800',
      [DifficultyLevel.ADVANCED]: '#F44336',
      [DifficultyLevel.EXPERT]: '#9C27B0'
    };
    return colors[difficulty];
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  getAdaptationSummary(adaptedContent: AdaptedContent): string {
    const changes = [];
    
    if (adaptedContent.originalDifficulty !== adaptedContent.adaptedDifficulty) {
      changes.push(`Difficulty adjusted to ${this.getDifficultyDisplayName(adaptedContent.adaptedDifficulty)}`);
    }
    
    if (adaptedContent.contentModifications.length > 0) {
      changes.push(`${adaptedContent.contentModifications.length} content modifications`);
    }
    
    if (adaptedContent.learningStyleOptimizations.length > 0) {
      changes.push(`Optimized for your learning style`);
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Content optimized for you';
  }

  getModificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'simplify': '🔧',
      'elaborate': '📖',
      'example_add': '💡',
      'visual_aid': '🎨',
      'interactive_element': '🖱️'
    };
    return iconMap[type] || '⚙️';
  }

  getLearningStyleIcon(style: string): string {
    const iconMap: { [key: string]: string } = {
      'visual': '👁️',
      'auditory': '👂',
      'kinesthetic': '✋',
      'reading_writing': '📝'
    };
    return iconMap[style] || '🧠';
  }

  getRecommendationStrength(confidenceScore: number): string {
    if (confidenceScore >= 0.9) return 'Excellent Match';
    if (confidenceScore >= 0.8) return 'Great Match';
    if (confidenceScore >= 0.7) return 'Good Match';
    if (confidenceScore >= 0.6) return 'Fair Match';
    return 'Basic Match';
  }

  getRecommendationStrengthColor(confidenceScore: number): string {
    if (confidenceScore >= 0.9) return '#27ae60';
    if (confidenceScore >= 0.8) return '#2ecc71';
    if (confidenceScore >= 0.7) return '#f39c12';
    if (confidenceScore >= 0.6) return '#e67e22';
    return '#95a5a6';
  }
}

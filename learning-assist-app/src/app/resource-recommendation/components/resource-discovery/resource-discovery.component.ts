import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResourceRecommendationService } from '../../resource-recommendation.service';
import {
  LearningResource,
  ResourceRecommendation,
  SearchCriteria,
  ResourceFilter,
  SortOption,
  ResourceType,
  DifficultyLevel,
  ResourceSource,
  ResourceFormat
} from '../../../models/resource-recommendation.model';

@Component({
  selector: 'app-resource-discovery',
  templateUrl: './resource-discovery.component.html',
  styleUrls: ['./resource-discovery.component.scss']
})
export class ResourceDiscoveryComponent implements OnInit, OnDestroy {
  recommendations: ResourceRecommendation[] = [];
  searchResults: LearningResource[] = [];
  featuredResources: LearningResource[] = [];
  isLoading = false;
  searchQuery = '';
  
  // Filter options
  selectedCategories: string[] = [];
  selectedTypes: ResourceType[] = [];
  selectedDifficulties: DifficultyLevel[] = [];
  selectedSources: ResourceSource[] = [];
  selectedFormats: ResourceFormat[] = [];
  
  // Available filter options
  availableCategories = ['Programming', 'Data Science', 'Design', 'Machine Learning', 'Frontend Development'];
  availableTypes = Object.values(ResourceType);
  availableDifficulties = Object.values(DifficultyLevel);
  availableSources = Object.values(ResourceSource);
  availableFormats = Object.values(ResourceFormat);
  
  // Sort options
  currentSortOption: SortOption = SortOption.RELEVANCE;
  sortOptions = [
    { value: SortOption.RELEVANCE, label: 'Relevance' },
    { value: SortOption.RATING, label: 'Rating' },
    { value: SortOption.POPULARITY, label: 'Popularity' },
    { value: SortOption.DATE_PUBLISHED, label: 'Date Published' },
    { value: SortOption.DURATION, label: 'Duration' },
    { value: SortOption.ALPHABETICAL, label: 'A-Z' }
  ];
  
  // View modes
  viewMode: 'recommendations' | 'search' | 'featured' = 'recommendations';
  
  private subscriptions: Subscription[] = [];

  constructor(private resourceService: ResourceRecommendationService) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadFeaturedResources();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadRecommendations(): void {
    this.isLoading = true;
    const sub = this.resourceService.getPersonalizedRecommendations('current-user').subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadFeaturedResources(): void {
    const criteria: SearchCriteria = {
      query: '',
      filters: {},
      sortBy: SortOption.RATING,
      includeSimilar: false,
      personalizeResults: false
    };

    const sub = this.resourceService.searchResources(criteria).subscribe({
      next: (resources) => {
        this.featuredResources = resources.filter(r => r.isFeatured).slice(0, 6);
      },
      error: (error) => {
        console.error('Error loading featured resources:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  onSearch(): void {
    if (!this.searchQuery.trim() && this.hasNoFilters()) {
      this.viewMode = 'recommendations';
      return;
    }

    this.viewMode = 'search';
    this.isLoading = true;

    const criteria: SearchCriteria = {
      query: this.searchQuery,
      filters: this.buildFilters(),
      sortBy: this.currentSortOption,
      includeSimilar: true,
      personalizeResults: true
    };

    const sub = this.resourceService.searchResources(criteria).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching resources:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  onFilterChange(): void {
    if (this.viewMode === 'search') {
      this.onSearch();
    }
  }

  onSortChange(): void {
    if (this.viewMode === 'search') {
      this.onSearch();
    }
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedTypes = [];
    this.selectedDifficulties = [];
    this.selectedSources = [];
    this.selectedFormats = [];
    this.onFilterChange();
  }

  switchView(mode: string): void {
    const validMode = mode as 'recommendations' | 'search' | 'featured';
    this.viewMode = validMode;
    if (validMode === 'recommendations') {
      this.loadRecommendations();
    } else if (validMode === 'featured') {
      this.loadFeaturedResources();
    }
  }

  onResourceClick(resource: LearningResource): void {
    // Track user interaction
    this.resourceService.trackUserInteraction({
      resourceId: resource.id,
      interactionType: 'view' as any,
      timestamp: new Date()
    }).subscribe();

    // Navigate to resource (would typically use router)
    console.log('Navigating to resource:', resource.title);
  }

  onBookmark(resource: LearningResource, event: Event): void {
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

  onRate(resource: LearningResource, rating: number, event: Event): void {
    event.stopPropagation();
    
    this.resourceService.rateResource(resource.id, rating).subscribe({
      next: () => {
        console.log(`Rated ${resource.title} with ${rating} stars`);
      },
      error: (error) => {
        console.error('Error rating resource:', error);
      }
    });
  }

  getResourceTypeDisplayName(type: ResourceType): string {
    const typeNames: { [key in ResourceType]: string } = {
      [ResourceType.COURSE]: 'Course',
      [ResourceType.ARTICLE]: 'Article',
      [ResourceType.VIDEO]: 'Video',
      [ResourceType.TUTORIAL]: 'Tutorial',
      [ResourceType.PRACTICE]: 'Practice',
      [ResourceType.EBOOK]: 'E-book',
      [ResourceType.PODCAST]: 'Podcast',
      [ResourceType.WEBINAR]: 'Webinar',
      [ResourceType.DOCUMENTATION]: 'Documentation',
      [ResourceType.EXERCISE]: 'Exercise'
    };
    return typeNames[type];
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

  private buildFilters(): Partial<ResourceFilter> {
    return {
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
      types: this.selectedTypes.length > 0 ? this.selectedTypes : undefined,
      difficulties: this.selectedDifficulties.length > 0 ? this.selectedDifficulties : undefined,
      sources: this.selectedSources.length > 0 ? this.selectedSources : undefined
    };
  }

  private hasNoFilters(): boolean {
    return this.selectedCategories.length === 0 &&
           this.selectedTypes.length === 0 &&
           this.selectedDifficulties.length === 0 &&
           this.selectedSources.length === 0 &&
           this.selectedFormats.length === 0;
  }
}

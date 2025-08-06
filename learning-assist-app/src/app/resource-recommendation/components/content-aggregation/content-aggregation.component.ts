import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResourceRecommendationService } from '../../resource-recommendation.service';
import {
  LearningResource,
  ResourceSource,
  ExpertCuratedContent,
  CommunityResource,
  ResourceCollection
} from '../../../models/resource-recommendation.model';

@Component({
  selector: 'app-content-aggregation',
  templateUrl: './content-aggregation.component.html',
  styleUrls: ['./content-aggregation.component.scss']
})
export class ContentAggregationComponent implements OnInit, OnDestroy {
  externalResources: LearningResource[] = [];
  expertContent: ExpertCuratedContent[] = [];
  communityResources: CommunityResource[] = [];
  resourceCollections: ResourceCollection[] = [];
  qualityVerifiedResources: LearningResource[] = [];
  
  selectedTab: 'external' | 'expert' | 'community' | 'collections' = 'external';
  selectedSource: ResourceSource | 'all' = 'all';
  
  // Available sources for filtering
  availableSources = [
    { value: 'all' as const, label: 'All Sources', icon: '🌐' },
    { value: ResourceSource.COURSERA, label: 'Coursera', icon: '🎓' },
    { value: ResourceSource.UDEMY, label: 'Udemy', icon: '📚' },
    { value: ResourceSource.YOUTUBE, label: 'YouTube', icon: '🎥' },
    { value: ResourceSource.MEDIUM, label: 'Medium', icon: '📝' },
    { value: ResourceSource.GITHUB, label: 'GitHub', icon: '💻' },
    { value: ResourceSource.STACKOVERFLOW, label: 'Stack Overflow', icon: '❓' },
    { value: ResourceSource.MDN, label: 'MDN', icon: '📖' },
    { value: ResourceSource.FREECODECAMP, label: 'freeCodeCamp', icon: '🏕️' }
  ];
  
  isLoading = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private resourceService: ResourceRecommendationService) {}

  ngOnInit(): void {
    this.loadExternalResources();
    this.loadExpertContent();
    this.loadCommunityResources();
    this.loadResourceCollections();
    this.loadQualityVerifiedResources();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onTabChange(tab: string): void {
    this.selectedTab = tab as 'external' | 'expert' | 'community' | 'collections';
  }

  onSourceFilter(source: ResourceSource | 'all'): void {
    this.selectedSource = source;
    this.loadExternalResources();
  }

  private loadExternalResources(): void {
    this.isLoading = true;
    
    const loadResources = this.selectedSource === 'all' 
      ? this.resourceService.aggregateExternalContent()
      : this.resourceService.getResourcesBySource(this.selectedSource as ResourceSource);
    
    const sub = loadResources.subscribe({
      next: (resources) => {
        this.externalResources = resources;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading external resources:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadExpertContent(): void {
    const sub = this.resourceService.getVerifiedExpertContent().subscribe({
      next: (content) => {
        this.expertContent = content;
      },
      error: (error) => {
        console.error('Error loading expert content:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadCommunityResources(): void {
    const sub = this.resourceService.getApprovedCommunityResources().subscribe({
      next: (resources) => {
        this.communityResources = resources;
      },
      error: (error) => {
        console.error('Error loading community resources:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadResourceCollections(): void {
    const sub = this.resourceService.getPublicCollections().subscribe({
      next: (collections) => {
        this.resourceCollections = collections;
      },
      error: (error) => {
        console.error('Error loading resource collections:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadQualityVerifiedResources(): void {
    const sub = this.resourceService.getQualityVerifiedResources().subscribe({
      next: (resources) => {
        this.qualityVerifiedResources = resources;
      },
      error: (error) => {
        console.error('Error loading quality verified resources:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getSourceIcon(source: ResourceSource): string {
    const iconMap: { [key in ResourceSource]: string } = {
      [ResourceSource.INTERNAL]: '🏠',
      [ResourceSource.COURSERA]: '🎓',
      [ResourceSource.UDEMY]: '📚',
      [ResourceSource.YOUTUBE]: '🎥',
      [ResourceSource.MEDIUM]: '📝',
      [ResourceSource.GITHUB]: '💻',
      [ResourceSource.STACKOVERFLOW]: '❓',
      [ResourceSource.MDN]: '📖',
      [ResourceSource.W3SCHOOLS]: '🌐',
      [ResourceSource.FREECODECAMP]: '🏕️',
      [ResourceSource.PLURALSIGHT]: '📊',
      [ResourceSource.LINKEDIN_LEARNING]: '💼',
      [ResourceSource.EXPERT_CURATED]: '👨‍🏫',
      [ResourceSource.COMMUNITY]: '👥'
    };
    return iconMap[source] || '📋';
  }

  getVerificationStatusIcon(status: string): string {
    const statusMap: { [key: string]: string } = {
      'verified': '✅',
      'pending': '⏳',
      'unverified': '❓'
    };
    return statusMap[status] || '❓';
  }

  getModerationStatusIcon(status: string): string {
    const statusMap: { [key: string]: string } = {
      'approved': '✅',
      'pending': '⏳',
      'rejected': '❌'
    };
    return statusMap[status] || '❓';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getResourceCount(source: ResourceSource): number {
    return this.externalResources.filter(r => r.source === source).length;
  }

  getTotalExternalResources(): number {
    return this.externalResources.length;
  }

  getAverageRating(resources: LearningResource[]): number {
    if (resources.length === 0) return 0;
    const sum = resources.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / resources.length).toFixed(1));
  }

  onResourceClick(resource: LearningResource): void {
    // Track interaction and navigate
    this.resourceService.trackUserInteraction({
      resourceId: resource.id,
      interactionType: 'view' as any,
      timestamp: new Date()
    }).subscribe();
    
    console.log('Opening resource:', resource.title, resource.url);
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

  onViewCollection(collection: ResourceCollection): void {
    console.log('Viewing collection:', collection.name);
    // Navigate to collection detail view
  }

  onViewExpertProfile(expertId: string): void {
    console.log('Viewing expert profile:', expertId);
    // Navigate to expert profile
  }

  refreshContent(): void {
    this.loadExternalResources();
    this.loadExpertContent();
    this.loadCommunityResources();
    this.loadResourceCollections();
    this.loadQualityVerifiedResources();
  }
}

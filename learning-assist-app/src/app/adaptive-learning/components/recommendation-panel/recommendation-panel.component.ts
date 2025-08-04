import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveLearningService } from '../../adaptive-learning.service';
import { ContentRecommendation, RecommendationSource } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-recommendation-panel',
  templateUrl: './recommendation-panel.component.html',
  styleUrls: ['./recommendation-panel.component.scss']
})
export class RecommendationPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  recommendations: ContentRecommendation[] = [];
  filteredRecommendations: ContentRecommendation[] = [];
  selectedSource: RecommendationSource | 'all' = 'all';
  sortBy: 'relevance' | 'confidence' | 'newest' = 'relevance';
  
  recommendationSources = Object.values(RecommendationSource);

  constructor(
    private adaptiveService: AdaptiveLearningService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecommendations(): void {
    this.adaptiveService.getRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((recommendations: ContentRecommendation[]) => {
        this.recommendations = recommendations;
        this.applyFilters();
      });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.recommendations];

    // Filter by source
    if (this.selectedSource !== 'all') {
      filtered = filtered.filter(rec => rec.recommendationSource === this.selectedSource);
    }

    // Sort
    switch (this.sortBy) {
      case 'relevance':
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    this.filteredRecommendations = filtered;
  }

  onRecommendationClick(recommendation: ContentRecommendation): void {
    this.adaptiveService.trackRecommendationInteraction(recommendation.id, 'clicked');
    this.router.navigate(['/content', recommendation.contentId]);
  }

  onProvideFeedback(recommendation: ContentRecommendation, rating: number, wasHelpful: boolean): void {
    this.adaptiveService.updateRecommendationFeedback(recommendation.id, rating, wasHelpful)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Refresh recommendations after feedback
        this.loadRecommendations();
      });
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'primary';
      case 'intermediate': return 'accent';
      case 'advanced': return 'warn';
      default: return 'primary';
    }
  }

  getConfidenceIcon(confidence: number): string {
    if (confidence >= 0.8) return 'thumb_up';
    if (confidence >= 0.6) return 'thumbs_up_down';
    return 'thumb_down';
  }

  getSourceIcon(source: RecommendationSource): string {
    switch (source) {
      case RecommendationSource.COLLABORATIVE: return 'people';
      case RecommendationSource.CONTENT_BASED: return 'auto_awesome';
      case RecommendationSource.BEHAVIORAL: return 'insights';
      case RecommendationSource.HYBRID: return 'psychology';
      case RecommendationSource.KNOWLEDGE_BASED: return 'school';
      default: return 'recommend';
    }
  }
}

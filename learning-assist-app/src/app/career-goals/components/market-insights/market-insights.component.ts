import { Component, OnInit } from '@angular/core';
import { CareerGoalsService } from '../../career-goals.service';
import { MarketInsight } from '../../../models/career-goals.model';

@Component({
  selector: 'app-market-insights',
  templateUrl: './market-insights.component.html',
  styleUrls: ['./market-insights.component.scss']
})
export class MarketInsightsComponent implements OnInit {
  insights: MarketInsight[] = [];
  loading = true;

  constructor(private careerGoalsService: CareerGoalsService) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  private loadInsights(): void {
    this.careerGoalsService.getMarketInsights().subscribe({
      next: (insights) => {
        this.insights = insights;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading insights:', error);
        this.loading = false;
      }
    });
  }
}

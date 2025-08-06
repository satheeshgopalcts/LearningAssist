import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CareerGoalsService } from '../../career-goals.service';
import { CareerPath, CareerLevel, SkillCategory } from '../../../models/career-goals.model';

@Component({
  selector: 'app-career-path-browser',
  templateUrl: './career-path-browser.component.html',
  styleUrls: ['./career-path-browser.component.scss']
})
export class CareerPathBrowserComponent implements OnInit, OnDestroy {
  careerPaths: CareerPath[] = [];
  filteredPaths: CareerPath[] = [];
  loading = true;
  
  // Filters
  selectedIndustry = '';
  selectedLevel: CareerLevel | '' = '';
  selectedDemand = '';
  searchQuery = '';
  
  // Filter options
  industries: string[] = [];
  levels: CareerLevel[] = [CareerLevel.ENTRY, CareerLevel.MID, CareerLevel.SENIOR, CareerLevel.EXECUTIVE];
  demandLevels = ['Low', 'Medium', 'High', 'Very High'];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private careerGoalsService: CareerGoalsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCareerPaths();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCareerPaths(): void {
    this.loading = true;
    
    const pathsSub = this.careerGoalsService.getCareerPaths().subscribe({
      next: (paths) => {
        this.careerPaths = paths;
        this.filteredPaths = [...paths];
        this.extractIndustries();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading career paths:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.push(pathsSub);
  }

  private extractIndustries(): void {
    const industrySet = new Set(this.careerPaths.map(path => path.industry));
    this.industries = Array.from(industrySet).sort();
  }

  applyFilters(): void {
    this.filteredPaths = this.careerPaths.filter(path => {
      const matchesSearch = !this.searchQuery || 
        path.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesIndustry = !this.selectedIndustry || path.industry === this.selectedIndustry;
      const matchesLevel = !this.selectedLevel || path.level === this.selectedLevel;
      const matchesDemand = !this.selectedDemand || path.demandLevel === this.selectedDemand;
      
      return matchesSearch && matchesIndustry && matchesLevel && matchesDemand;
    });
  }

  clearFilters(): void {
    this.selectedIndustry = '';
    this.selectedLevel = '';
    this.selectedDemand = '';
    this.searchQuery = '';
    this.filteredPaths = [...this.careerPaths];
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onIndustryChange(): void {
    this.applyFilters();
  }

  onLevelChange(): void {
    this.applyFilters();
  }

  onDemandChange(): void {
    this.applyFilters();
  }

  viewPathDetails(path: CareerPath): void {
    // Navigate to detailed view or show modal
    console.log('Viewing details for:', path.title);
  }

  setAsGoal(path: CareerPath): void {
    this.router.navigate(['/career-goals/goal-setting'], { 
      queryParams: { careerPathId: path.id } 
    });
  }

  getSalaryRange(path: CareerPath): string {
    if (path.averageSalary) {
      return `$${path.averageSalary.min.toLocaleString()} - $${path.averageSalary.max.toLocaleString()}`;
    }
    return 'Salary not available';
  }

  getDemandColor(demandLevel: string): string {
    switch (demandLevel) {
      case 'Very High': return 'very-high';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      default: return 'low';
    }
  }

  getPopularityStars(popularity: number): number[] {
    const stars = Math.round(popularity / 20); // Convert 0-100 to 0-5 stars
    return Array(5).fill(0).map((_, i) => i < stars ? 1 : 0);
  }
}

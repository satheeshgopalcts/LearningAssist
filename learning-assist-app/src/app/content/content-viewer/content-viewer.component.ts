import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../content.service';
import { Course, ContentFilter, DifficultyLevel } from '../../models/content.model';

@Component({
  selector: 'app-content-viewer',
  templateUrl: './content-viewer.component.html',
  styleUrls: ['./content-viewer.component.scss']
})
export class ContentViewerComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  filter: ContentFilter = {};
  isLoading = false;
  searchQuery = '';

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading = true;
    this.contentService.getCourses(this.filter).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    this.filter.searchQuery = this.searchQuery;
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.contentService.getCourses(this.filter).subscribe({
      next: (courses) => {
        this.filteredCourses = courses;
      }
    });
  }

  createCourse() {
    this.router.navigate(['/content/create']);
  }

  editCourse(courseId: string) {
    this.router.navigate(['/content/course', courseId, 'edit']);
  }

  viewCourse(courseId: string) {
    this.router.navigate(['/content/course', courseId]);
  }

  getDifficultyColor(level: DifficultyLevel): string {
    const colorMap = {
      [DifficultyLevel.BEGINNER]: 'primary',
      [DifficultyLevel.INTERMEDIATE]: 'accent',
      [DifficultyLevel.ADVANCED]: 'warn',
      [DifficultyLevel.EXPERT]: 'warn'
    };
    return colorMap[level] || 'primary';
  }

  getDifficultyDisplay(level: DifficultyLevel): string {
    const levelMap = {
      [DifficultyLevel.BEGINNER]: 'Beginner',
      [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
      [DifficultyLevel.ADVANCED]: 'Advanced',
      [DifficultyLevel.EXPERT]: 'Expert'
    };
    return levelMap[level] || level;
  }
}

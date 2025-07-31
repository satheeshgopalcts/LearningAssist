import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { 
  Course, 
  ContentItem, 
  ContentCategory, 
  Tag, 
  ContentFilter,
  QuizContent,
  Assignment,
  VideoContent,
  LessonContent,
  ContentUploadProgress,
  ContentType,
  DifficultyLevel
} from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = 'http://localhost:5000/api';
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private categoriesSubject = new BehaviorSubject<ContentCategory[]>([]);
  private tagsSubject = new BehaviorSubject<Tag[]>([]);

  courses$ = this.coursesSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  tags$ = this.tagsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadMockData();
  }

  // Course Management
  getCourses(filter?: ContentFilter): Observable<Course[]> {
    // For now, return mock data. In production, this would call the API
    let courses = this.coursesSubject.value;
    
    if (filter) {
      courses = this.applyFilter(courses, filter);
    }
    
    return of(courses);
  }

  getCourse(id: string): Observable<Course | null> {
    const course = this.coursesSubject.value.find(c => c.id === id);
    return of(course || null);
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    const newCourse: Course = {
      ...course,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const courses = [...this.coursesSubject.value, newCourse];
    this.coursesSubject.next(courses);
    
    return of(newCourse);
  }

  updateCourse(id: string, updates: Partial<Course>): Observable<Course> {
    const courses = this.coursesSubject.value;
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Course not found');
    }
    
    const updatedCourse = {
      ...courses[index],
      ...updates,
      updatedAt: new Date()
    };
    
    courses[index] = updatedCourse;
    this.coursesSubject.next(courses);
    
    return of(updatedCourse);
  }

  deleteCourse(id: string): Observable<boolean> {
    const courses = this.coursesSubject.value.filter(c => c.id !== id);
    this.coursesSubject.next(courses);
    return of(true);
  }

  // Content Item Management
  getContentItems(courseId: string): Observable<ContentItem[]> {
    const course = this.coursesSubject.value.find(c => c.id === courseId);
    return of(course?.contentItems || []);
  }

  addContentItem(courseId: string, contentItem: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<ContentItem> {
    const newContentItem: ContentItem = {
      ...contentItem,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const courses = this.coursesSubject.value;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    courses[courseIndex].contentItems.push(newContentItem);
    this.coursesSubject.next([...courses]);

    return of(newContentItem);
  }

  updateContentItem(courseId: string, itemId: string, updates: Partial<ContentItem>): Observable<ContentItem> {
    const courses = this.coursesSubject.value;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    const itemIndex = courses[courseIndex].contentItems.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Content item not found');
    }

    const updatedItem = {
      ...courses[courseIndex].contentItems[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    courses[courseIndex].contentItems[itemIndex] = updatedItem;
    this.coursesSubject.next([...courses]);

    return of(updatedItem);
  }

  deleteContentItem(courseId: string, itemId: string): Observable<boolean> {
    const courses = this.coursesSubject.value;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    courses[courseIndex].contentItems = courses[courseIndex].contentItems.filter(i => i.id !== itemId);
    this.coursesSubject.next([...courses]);

    return of(true);
  }

  // File Upload
  uploadVideo(file: File): Observable<ContentUploadProgress> {
    // Mock upload progress
    const progress = new BehaviorSubject<ContentUploadProgress>({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        progress.next({
          fileName: file.name,
          progress: 100,
          status: 'completed'
        });
        clearInterval(interval);
      } else {
        progress.next({
          fileName: file.name,
          progress: currentProgress,
          status: 'uploading'
        });
      }
    }, 500);

    return progress.asObservable();
  }

  uploadAttachment(file: File): Observable<ContentUploadProgress> {
    return this.uploadVideo(file); // Same logic for now
  }

  // Categories and Tags
  getCategories(): Observable<ContentCategory[]> {
    return this.categories$;
  }

  getTags(): Observable<Tag[]> {
    return this.tags$;
  }

  createCategory(category: Omit<ContentCategory, 'id'>): Observable<ContentCategory> {
    const newCategory: ContentCategory = {
      ...category,
      id: this.generateId()
    };
    
    const categories = [...this.categoriesSubject.value, newCategory];
    this.categoriesSubject.next(categories);
    
    return of(newCategory);
  }

  createTag(tag: Omit<Tag, 'id'>): Observable<Tag> {
    const newTag: Tag = {
      ...tag,
      id: this.generateId()
    };
    
    const tags = [...this.tagsSubject.value, newTag];
    this.tagsSubject.next(tags);
    
    return of(newTag);
  }

  // Helper Methods
  private applyFilter(courses: Course[], filter: ContentFilter): Course[] {
    return courses.filter(course => {
      if (filter.category && course.category !== filter.category) {
        return false;
      }
      
      if (filter.difficultyLevel && course.difficultyLevel !== filter.difficultyLevel) {
        return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => course.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchable = `${course.title} ${course.description}`.toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadMockData(): void {
    // Mock categories
    const categories: ContentCategory[] = [
      { id: '1', name: 'Programming', description: 'Programming and software development' },
      { id: '2', name: 'Mathematics', description: 'Mathematical concepts and applications' },
      { id: '3', name: 'Science', description: 'Natural sciences and research' },
      { id: '4', name: 'Business', description: 'Business and management topics' },
      { id: '5', name: 'Design', description: 'Design and creative arts' }
    ];

    // Mock tags
    const tags: Tag[] = [
      { id: '1', name: 'JavaScript', category: 'Programming' },
      { id: '2', name: 'Angular', category: 'Programming' },
      { id: '3', name: 'TypeScript', category: 'Programming' },
      { id: '4', name: 'Calculus', category: 'Mathematics' },
      { id: '5', name: 'Statistics', category: 'Mathematics' },
      { id: '6', name: 'Physics', category: 'Science' },
      { id: '7', name: 'Marketing', category: 'Business' },
      { id: '8', name: 'UI/UX', category: 'Design' }
    ];

    this.categoriesSubject.next(categories);
    this.tagsSubject.next(tags);

    // Mock courses will be loaded as needed
    this.coursesSubject.next([]);
  }
}

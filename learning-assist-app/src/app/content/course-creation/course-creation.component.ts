import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContentService } from '../content.service';
import { 
  Course, 
  ContentItem, 
  ContentType, 
  DifficultyLevel, 
  ContentCategory, 
  Tag,
  LessonContent,
  VideoContent,
  QuizContent,
  Assignment
} from '../../models/content.model';

@Component({
  selector: 'app-course-creation',
  templateUrl: './course-creation.component.html',
  styleUrls: ['./course-creation.component.scss']
})
export class CourseCreationComponent implements OnInit {
  courseForm: FormGroup;
  categories: ContentCategory[] = [];
  availableTags: Tag[] = [];
  isEditing = false;
  courseId: string | null = null;
  contentTypes = Object.values(ContentType);
  difficultyLevels = Object.values(DifficultyLevel);

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadTags();
    
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.isEditing = true;
      this.loadCourse(this.courseId);
    }
  }

  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      tags: [[]],
      difficultyLevel: [DifficultyLevel.BEGINNER, Validators.required],
      prerequisites: this.fb.array([]),
      learningObjectives: this.fb.array([]),
      instructor: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      isPublished: [false],
      contentItems: this.fb.array([])
    });
  }

  private loadCategories() {
    this.contentService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadTags() {
    this.contentService.getTags().subscribe(tags => {
      this.availableTags = tags;
    });
  }

  private loadCourse(id: string) {
    this.contentService.getCourse(id).subscribe(course => {
      if (course) {
        this.populateForm(course);
      }
    });
  }

  private populateForm(course: Course) {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      category: course.category,
      tags: course.tags,
      difficultyLevel: course.difficultyLevel,
      instructor: course.instructor,
      duration: course.duration,
      isPublished: course.isPublished
    });

    // Populate prerequisites
    const prerequisitesArray = this.prerequisites;
    course.prerequisites.forEach(prerequisite => {
      prerequisitesArray.push(this.fb.control(prerequisite));
    });

    // Populate learning objectives
    const objectivesArray = this.learningObjectives;
    course.learningObjectives.forEach(objective => {
      objectivesArray.push(this.fb.control(objective));
    });

    // Populate content items
    const contentItemsArray = this.contentItems;
    course.contentItems.forEach(item => {
      contentItemsArray.push(this.createContentItemForm(item));
    });
  }

  get prerequisites(): FormArray {
    return this.courseForm.get('prerequisites') as FormArray;
  }

  get learningObjectives(): FormArray {
    return this.courseForm.get('learningObjectives') as FormArray;
  }

  get contentItems(): FormArray {
    return this.courseForm.get('contentItems') as FormArray;
  }

  addPrerequisite() {
    this.prerequisites.push(this.fb.control('', Validators.required));
  }

  removePrerequisite(index: number) {
    this.prerequisites.removeAt(index);
  }

  addLearningObjective() {
    this.learningObjectives.push(this.fb.control('', Validators.required));
  }

  removeLearningObjective(index: number) {
    this.learningObjectives.removeAt(index);
  }

  addContentItem(type: ContentType) {
    const contentItem = this.createContentItemForm(null, type);
    this.contentItems.push(contentItem);
  }

  removeContentItem(index: number) {
    this.contentItems.removeAt(index);
  }

  private createContentItemForm(item?: ContentItem | null, type?: ContentType): FormGroup {
    return this.fb.group({
      id: [item?.id || this.generateId()],
      title: [item?.title || '', Validators.required],
      type: [item?.type || type || ContentType.LESSON, Validators.required],
      duration: [item?.duration || 0],
      isRequired: [item?.isRequired ?? true],
      order: [item?.order || this.contentItems.length]
    });
  }

  saveCourse() {
    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;
      
      const courseData = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        tags: formValue.tags,
        difficultyLevel: formValue.difficultyLevel,
        prerequisites: formValue.prerequisites.filter((p: string) => p.trim()),
        learningObjectives: formValue.learningObjectives.filter((o: string) => o.trim()),
        instructor: formValue.instructor,
        duration: formValue.duration,
        isPublished: formValue.isPublished,
        contentItems: formValue.contentItems.map((item: any, index: number) => ({
          ...item,
          courseId: this.courseId || 'new',
          order: index,
          content: this.createEmptyContent(item.type),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      };

      if (this.isEditing && this.courseId) {
        this.contentService.updateCourse(this.courseId, courseData).subscribe({
          next: (course) => {
            this.snackBar.open('Course updated successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/content/courses']);
          },
          error: (error) => {
            this.snackBar.open('Error updating course: ' + error.message, 'Close', { duration: 5000 });
          }
        });
      } else {
        this.contentService.createCourse(courseData).subscribe({
          next: (course) => {
            this.snackBar.open('Course created successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/content/courses']);
          },
          error: (error) => {
            this.snackBar.open('Error creating course: ' + error.message, 'Close', { duration: 5000 });
          }
        });
      }
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  private createEmptyContent(type: ContentType): any {
    switch (type) {
      case ContentType.LESSON:
        return {
          id: this.generateId(),
          title: '',
          htmlContent: '',
          attachments: []
        } as LessonContent;
      
      case ContentType.VIDEO:
        return {
          id: this.generateId(),
          title: '',
          videoUrl: '',
          duration: 0
        } as VideoContent;
      
      case ContentType.QUIZ:
        return {
          id: this.generateId(),
          title: '',
          instructions: '',
          questions: [],
          passingScore: 70,
          allowRetakes: true
        } as QuizContent;
      
      case ContentType.ASSIGNMENT:
        return {
          id: this.generateId(),
          title: '',
          description: '',
          instructions: '',
          maxPoints: 100,
          submissionType: 'text',
          autoGrade: false
        } as Assignment;
      
      default:
        return {};
    }
  }

  cancel() {
    this.router.navigate(['/content/courses']);
  }

  previewCourse() {
    // Implement course preview functionality
    console.log('Course preview:', this.courseForm.value);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getDifficultyLevelDisplay(level: DifficultyLevel): string {
    const levelMap = {
      [DifficultyLevel.BEGINNER]: 'Beginner',
      [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
      [DifficultyLevel.ADVANCED]: 'Advanced',
      [DifficultyLevel.EXPERT]: 'Expert'
    };
    return levelMap[level] || level;
  }

  getContentTypeDisplay(type: ContentType): string {
    const typeMap = {
      [ContentType.LESSON]: 'Lesson',
      [ContentType.VIDEO]: 'Video',
      [ContentType.QUIZ]: 'Quiz',
      [ContentType.ASSIGNMENT]: 'Assignment',
      [ContentType.SIMULATION]: 'Simulation',
      [ContentType.RESOURCE]: 'Resource'
    };
    return typeMap[type] || type;
  }

  getTotalDuration(): number {
    return this.contentItems.controls.reduce((total, item) => {
      return total + (item.get('duration')?.value || 0);
    }, 0);
  }
}

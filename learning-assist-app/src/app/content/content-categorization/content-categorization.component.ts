import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ContentCategory, Tag } from '../../models/content.model';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-content-categorization',
  templateUrl: './content-categorization.component.html',
  styleUrls: ['./content-categorization.component.scss']
})
export class ContentCategorizationComponent implements OnInit {
  categories$: Observable<ContentCategory[]>;
  tags$: Observable<Tag[]>;
  
  categoryForm!: FormGroup;
  tagForm!: FormGroup;
  
  showCategoryForm = false;
  showTagForm = false;
  editingCategory: ContentCategory | null = null;
  editingTag: Tag | null = null;

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private snackBar: MatSnackBar
  ) {
    this.categories$ = this.contentService.getCategories();
    this.tags$ = this.contentService.getTags();
  }

  ngOnInit() {
    this.initializeForms();
  }

  private initializeForms() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parentId: [null]
    });

    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['']
    });
  }

  // Category Management
  addCategory() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryForm = true;
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const categoryData = {
        ...this.categoryForm.value,
        id: this.editingCategory?.id
      };

      this.contentService.createCategory(categoryData).subscribe({
        next: (category) => {
          this.snackBar.open('Category saved successfully!', 'Close', { duration: 3000 });
          this.cancelCategoryForm();
        },
        error: (error) => {
          this.snackBar.open('Error saving category', 'Close', { duration: 3000 });
          console.error('Error saving category:', error);
        }
      });
    }
  }

  cancelCategoryForm() {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  // Tag Management
  addTag() {
    this.editingTag = null;
    this.tagForm.reset();
    this.showTagForm = true;
  }

  saveTag() {
    if (this.tagForm.valid) {
      const tagData = {
        ...this.tagForm.value,
        id: this.editingTag?.id
      };

      this.contentService.createTag(tagData).subscribe({
        next: (tag) => {
          this.snackBar.open('Tag saved successfully!', 'Close', { duration: 3000 });
          this.cancelTagForm();
        },
        error: (error) => {
          this.snackBar.open('Error saving tag', 'Close', { duration: 3000 });
          console.error('Error saving tag:', error);
        }
      });
    }
  }

  cancelTagForm() {
    this.showTagForm = false;
    this.editingTag = null;
    this.tagForm.reset();
  }
}

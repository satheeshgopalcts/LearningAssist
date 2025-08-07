import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InteractiveLearningRoutingModule } from './interactive-learning-routing.module';
import { DiscussionForumsComponent } from './components/discussion-forums/discussion-forums.component';
import { VirtualClassroomComponent } from './components/virtual-classroom/virtual-classroom.component';
import { CollaborativeProjectsComponent } from './components/collaborative-projects/collaborative-projects.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InteractiveLearningRoutingModule,
    
    // Angular Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatListModule,
    MatBadgeModule,
    MatTabsModule,
    MatExpansionModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatProgressBarModule,

    // Standalone components
    DiscussionForumsComponent,
    VirtualClassroomComponent,
    CollaborativeProjectsComponent
  ]
})
export class InteractiveLearningModule { }

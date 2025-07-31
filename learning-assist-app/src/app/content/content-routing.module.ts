import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseCreationComponent } from './course-creation/course-creation.component';
import { ContentViewerComponent } from './content-viewer/content-viewer.component';
import { ContentCategorizationComponent } from './content-categorization/content-categorization.component';

const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { path: 'courses', component: ContentViewerComponent },
  { path: 'create', component: CourseCreationComponent },
  { path: 'categorization', component: ContentCategorizationComponent },
  { path: 'course/:id', component: ContentViewerComponent },
  { path: 'course/:id/edit', component: CourseCreationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }

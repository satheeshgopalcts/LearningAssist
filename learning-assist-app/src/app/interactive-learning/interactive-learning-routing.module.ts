import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionForumsComponent } from './components/discussion-forums/discussion-forums.component';
import { VirtualClassroomComponent } from './components/virtual-classroom/virtual-classroom.component';
import { CollaborativeProjectsComponent } from './components/collaborative-projects/collaborative-projects.component';

const routes: Routes = [
  { path: '', redirectTo: 'forums', pathMatch: 'full' },
  { path: 'forums', component: DiscussionForumsComponent },
  { path: 'classroom', component: VirtualClassroomComponent },
  { path: 'projects', component: CollaborativeProjectsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteractiveLearningRoutingModule { }

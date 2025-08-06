import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResourceDiscoveryComponent } from './components/resource-discovery/resource-discovery.component';
import { ContentAggregationComponent } from './components/content-aggregation/content-aggregation.component';
import { PersonalizedMaterialsComponent } from './components/personalized-materials/personalized-materials.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'discovery',
    pathMatch: 'full'
  },
  {
    path: 'discovery',
    component: ResourceDiscoveryComponent,
    data: { 
      title: 'Resource Discovery',
      description: 'AI-powered resource discovery and recommendations'
    }
  },
  {
    path: 'aggregation',
    component: ContentAggregationComponent,
    data: { 
      title: 'Content Aggregation',
      description: 'Multi-source content aggregation and expert resources'
    }
  },
  {
    path: 'personalized',
    component: PersonalizedMaterialsComponent,
    data: { 
      title: 'Personalized Materials',
      description: 'Personalized and adaptive learning materials'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRecommendationRoutingModule { }

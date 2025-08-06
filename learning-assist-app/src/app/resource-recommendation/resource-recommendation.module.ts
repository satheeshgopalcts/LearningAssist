import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ResourceRecommendationRoutingModule } from './resource-recommendation-routing.module';
import { ResourceRecommendationService } from './resource-recommendation.service';

// Components
import { ResourceDiscoveryComponent } from './components/resource-discovery/resource-discovery.component';
import { ContentAggregationComponent } from './components/content-aggregation/content-aggregation.component';
import { PersonalizedMaterialsComponent } from './components/personalized-materials/personalized-materials.component';

@NgModule({
  declarations: [
    ResourceDiscoveryComponent,
    ContentAggregationComponent,
    PersonalizedMaterialsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ResourceRecommendationRoutingModule
  ],
  providers: [
    ResourceRecommendationService
  ],
  exports: [
    ResourceDiscoveryComponent,
    ContentAggregationComponent,
    PersonalizedMaterialsComponent
  ]
})
export class ResourceRecommendationModule { }

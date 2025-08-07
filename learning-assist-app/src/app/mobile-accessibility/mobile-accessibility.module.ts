import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { ResponsiveLayoutComponent } from './components/responsive-layout/responsive-layout.component';
import { AccessibilityControlsComponent } from './components/accessibility-controls/accessibility-controls.component';
import { OfflineManagerComponent } from './components/offline-manager/offline-manager.component';

// Services
import { MobileAccessibilityService } from './services/mobile-accessibility.service';

// Container Component
@Component({
  selector: 'app-mobile-accessibility-container',
  template: `
    <div class="mobile-accessibility-container">
      <mat-card class="overview-card">
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>mobile_friendly</mat-icon>
          </div>
          <mat-card-title>Mobile & Accessibility Features</mat-card-title>
          <mat-card-subtitle>Cross-platform compatibility and accessibility compliance</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-tab-group class="feature-tabs">
        <mat-tab label="Responsive Layout">
          <div class="tab-content">
            <app-responsive-layout></app-responsive-layout>
          </div>
        </mat-tab>
        
        <mat-tab label="Accessibility Controls">
          <div class="tab-content">
            <app-accessibility-controls></app-accessibility-controls>
          </div>
        </mat-tab>
        
        <mat-tab label="Offline Manager">
          <div class="tab-content">
            <app-offline-manager></app-offline-manager>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .mobile-accessibility-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .overview-card {
      margin-bottom: 24px;

      .mat-card-avatar mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        line-height: 40px;
        color: #2196f3;
      }
    }

    .feature-tabs {
      margin-top: 16px;
    }

    .tab-content {
      padding: 16px 0;
    }

    @media (max-width: 768px) {
      .mobile-accessibility-container {
        padding: 8px;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    ResponsiveLayoutComponent,
    AccessibilityControlsComponent,
    OfflineManagerComponent
  ]
})
export class MobileAccessibilityContainerComponent { }

const routes: Routes = [
  {
    path: '',
    component: MobileAccessibilityContainerComponent
  },
  {
    path: 'responsive',
    component: ResponsiveLayoutComponent
  },
  {
    path: 'accessibility',
    component: AccessibilityControlsComponent
  },
  {
    path: 'offline',
    component: OfflineManagerComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatRadioModule,
    MatProgressBarModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatTabsModule,
    ResponsiveLayoutComponent,
    AccessibilityControlsComponent,
    OfflineManagerComponent,
    MobileAccessibilityContainerComponent
  ],
  providers: [
    MobileAccessibilityService
  ],
  exports: [
    ResponsiveLayoutComponent,
    AccessibilityControlsComponent,
    OfflineManagerComponent,
    MobileAccessibilityContainerComponent
  ]
})
export class MobileAccessibilityModule { }

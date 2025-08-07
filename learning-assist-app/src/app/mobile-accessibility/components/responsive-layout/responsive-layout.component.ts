import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil } from 'rxjs';

import { MobileAccessibilityService } from '../../services/mobile-accessibility.service';
import { 
  ResponsiveBreakpoint, 
  AdaptiveUI, 
  CardLayout, 
  ListDensity,
  NavigationType 
} from '../../../models/mobile-accessibility.model';

@Component({
  selector: 'app-responsive-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatTabsModule,
    MatChipsModule,
    MatFormFieldModule
  ],
  templateUrl: './responsive-layout.component.html',
  styleUrls: ['./responsive-layout.component.scss']
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Public enums for template access
  CardLayout = CardLayout;
  ListDensity = ListDensity;
  NavigationType = NavigationType;

  // Component state
  currentBreakpoint: ResponsiveBreakpoint | null = null;
  adaptiveUI: AdaptiveUI | null = null;
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  // Forms
  layoutForm: FormGroup;

  // Demo content
  demoCards = [
    {
      id: 1,
      title: 'Mobile Learning',
      content: 'Optimized learning experience for mobile devices with touch-friendly interfaces.',
      icon: 'phone_android'
    },
    {
      id: 2,
      title: 'Responsive Design',
      content: 'Layouts that adapt seamlessly across all screen sizes and orientations.',
      icon: 'devices'
    },
    {
      id: 3,
      title: 'Touch Interactions',
      content: 'Intuitive touch gestures and interactions for enhanced mobile experience.',
      icon: 'touch_app'
    },
    {
      id: 4,
      title: 'Progressive Enhancement',
      content: 'Features that enhance based on device capabilities and network conditions.',
      icon: 'trending_up'
    },
    {
      id: 5,
      title: 'Offline Support',
      content: 'Seamless offline capabilities with intelligent content synchronization.',
      icon: 'offline_bolt'
    },
    {
      id: 6,
      title: 'Performance Optimized',
      content: 'Fast loading and smooth interactions across all device types.',
      icon: 'speed'
    }
  ];

  constructor(
    private mobileAccessibilityService: MobileAccessibilityService,
    private fb: FormBuilder
  ) {
    this.layoutForm = this.createLayoutForm();
  }

  ngOnInit(): void {
    this.subscribeToBreakpointChanges();
    this.subscribeToAdaptiveUI();
    this.subscribeToDeviceTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Layout Control Methods
  toggleCardLayout(): void {
    if (!this.adaptiveUI) return;
    
    const currentLayout = this.adaptiveUI.layout.cardLayout;
    const newLayout = currentLayout === CardLayout.GRID ? CardLayout.LIST : CardLayout.GRID;
    
    // This would typically update the service state
    console.log('Toggling card layout:', newLayout);
  }

  changeDensity(density: ListDensity): void {
    console.log('Changing density:', density);
    this.layoutForm.patchValue({ density });
  }

  changeColumns(columns: number): void {
    console.log('Changing columns:', columns);
    this.layoutForm.patchValue({ columns });
  }

  // Responsive Testing Methods
  simulateBreakpoint(breakpointId: string): void {
    const breakpoints = this.mobileAccessibilityService.getBreakpoints();
    const breakpoint = breakpoints.find(bp => bp.id === breakpointId);
    
    if (breakpoint) {
      // Simulate window resize to trigger breakpoint
      const width = breakpoint.minWidth + 50;
      console.log(`Simulating ${breakpoint.name} (${width}px)`);
      
      // In a real app, you might want to temporarily override the breakpoint
      // This is just for demonstration
    }
  }

  testOrientation(): void {
    console.log('Testing orientation change');
    // Simulate orientation change
    const currentOrientation = screen.orientation?.type;
    console.log('Current orientation:', currentOrientation);
  }

  // Demo Methods
  getDemoGridCols(): number {
    if (this.isMobile) return 1;
    if (this.isTablet) return 2;
    return 3;
  }

  getCardClass(): string {
    if (!this.adaptiveUI) return '';
    
    const layout = this.adaptiveUI.layout.cardLayout;
    const density = this.adaptiveUI.layout.listDensity;
    
    return `card-${layout} density-${density}`;
  }

  getGridRowHeight(): string {
    if (this.isMobile) return '200px';
    if (this.isTablet) return '180px';
    return '160px';
  }

  getDeviceIcon(): string {
    if (!this.currentBreakpoint) return 'devices';
    
    switch (this.currentBreakpoint.id) {
      case 'xs':
      case 'sm':
        return 'phone_android';
      case 'md':
        return 'tablet';
      case 'lg':
      case 'xl':
        return 'computer';
      default:
        return 'devices';
    }
  }

  // Private Methods
  private subscribeToBreakpointChanges(): void {
    this.mobileAccessibilityService.getCurrentBreakpoint()
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakpoint => {
        this.currentBreakpoint = breakpoint;
        this.updateLayoutForm();
      });
  }

  private subscribeToAdaptiveUI(): void {
    this.mobileAccessibilityService.getAdaptiveUI()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ui => {
        this.adaptiveUI = ui;
        this.updateLayoutForm();
      });
  }

  private subscribeToDeviceTypes(): void {
    this.mobileAccessibilityService.isMobile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => this.isMobile = isMobile);

    this.mobileAccessibilityService.isTablet()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTablet => this.isTablet = isTablet);

    this.mobileAccessibilityService.isDesktop()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDesktop => this.isDesktop = isDesktop);
  }

  private createLayoutForm(): FormGroup {
    return this.fb.group({
      cardLayout: [CardLayout.GRID],
      density: [ListDensity.STANDARD],
      columns: [3],
      spacing: [16],
      margins: [24]
    });
  }

  private updateLayoutForm(): void {
    if (this.adaptiveUI) {
      this.layoutForm.patchValue({
        cardLayout: this.adaptiveUI.layout.cardLayout,
        density: this.adaptiveUI.layout.listDensity,
        columns: this.adaptiveUI.layout.columns,
        spacing: this.adaptiveUI.layout.spacing,
        margins: this.adaptiveUI.layout.margins
      });
    }
  }
}

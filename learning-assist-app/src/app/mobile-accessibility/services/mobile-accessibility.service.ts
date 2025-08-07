import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import {
  ResponsiveBreakpoint,
  DeviceCapability,
  AccessibilitySettings,
  OfflineContent,
  PWACapabilities,
  TouchGesture,
  PerformanceMetrics,
  AdaptiveUI,
  FontSize,
  ColorScheme,
  ConnectionType,
  ContentType,
  SyncStatus,
  OfflinePriority,
  StorageQuota,
  ScreenOrientation,
  NavigationType,
  NavigationPosition,
  LayoutConfiguration,
  CardLayout,
  ListDensity,
  Platform
} from '../../models/mobile-accessibility.model';

@Injectable({
  providedIn: 'root'
})
export class MobileAccessibilityService {
  private currentBreakpoint$ = new BehaviorSubject<ResponsiveBreakpoint>(this.getInitialBreakpoint());
  private deviceCapabilities$ = new BehaviorSubject<DeviceCapability>(this.detectDeviceCapabilities());
  private accessibilitySettings$ = new BehaviorSubject<AccessibilitySettings>(this.getDefaultAccessibilitySettings());
  private offlineContent$ = new BehaviorSubject<OfflineContent[]>(this.getMockOfflineContent());
  private pwaCapabilities$ = new BehaviorSubject<PWACapabilities>(this.detectPWACapabilities());
  private storageQuota$ = new BehaviorSubject<StorageQuota>(this.getStorageInfo());
  private performanceMetrics$ = new BehaviorSubject<PerformanceMetrics[]>([]);
  private adaptiveUI$ = new BehaviorSubject<AdaptiveUI>(this.getInitialAdaptiveUI());

  // Responsive breakpoints
  private breakpoints: ResponsiveBreakpoint[] = [
    {
      id: 'xs',
      name: 'Extra Small',
      minWidth: 0,
      maxWidth: 575,
      description: 'Mobile phones (portrait)'
    },
    {
      id: 'sm',
      name: 'Small',
      minWidth: 576,
      maxWidth: 767,
      description: 'Mobile phones (landscape)'
    },
    {
      id: 'md',
      name: 'Medium',
      minWidth: 768,
      maxWidth: 991,
      description: 'Tablets'
    },
    {
      id: 'lg',
      name: 'Large',
      minWidth: 992,
      maxWidth: 1199,
      description: 'Desktop'
    },
    {
      id: 'xl',
      name: 'Extra Large',
      minWidth: 1200,
      description: 'Large desktop'
    }
  ];

  // Additional observables for offline manager
  private offlineStatus$ = new BehaviorSubject<'online' | 'offline'>('online');
  private syncStatus$ = new BehaviorSubject<SyncStatus>(SyncStatus.SYNCED);

  constructor() {
    this.initializeResponsiveDetection();
    this.initializeAccessibilityObservers();
    this.initializePerformanceMonitoring();
  }

  // Responsive Design Methods
  getCurrentBreakpoint(): Observable<ResponsiveBreakpoint> {
    return this.currentBreakpoint$.asObservable();
  }

  getBreakpoints(): ResponsiveBreakpoint[] {
    return this.breakpoints;
  }

  isMobile(): Observable<boolean> {
    return this.currentBreakpoint$.pipe(
      map(breakpoint => breakpoint.id === 'xs' || breakpoint.id === 'sm')
    );
  }

  isTablet(): Observable<boolean> {
    return this.currentBreakpoint$.pipe(
      map(breakpoint => breakpoint.id === 'md')
    );
  }

  isDesktop(): Observable<boolean> {
    return this.currentBreakpoint$.pipe(
      map(breakpoint => breakpoint.id === 'lg' || breakpoint.id === 'xl')
    );
  }

  // Device Capabilities
  getDeviceCapabilities(): Observable<DeviceCapability> {
    return this.deviceCapabilities$.asObservable();
  }

  updateNetworkStatus(): void {
    const capability = this.deviceCapabilities$.value;
    capability.networkSupport = {
      online: navigator.onLine,
      connectionType: this.detectConnectionType(),
      effectiveType: (navigator as any).connection?.effectiveType || '4g',
      downlink: (navigator as any).connection?.downlink || 10,
      rtt: (navigator as any).connection?.rtt || 100
    };
    this.deviceCapabilities$.next(capability);
  }

  // Accessibility Settings
  getAccessibilitySettings(): Observable<AccessibilitySettings> {
    return this.accessibilitySettings$.asObservable();
  }

  updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    const current = this.accessibilitySettings$.value;
    const updated = { ...current, ...settings, updatedAt: new Date() };
    this.accessibilitySettings$.next(updated);
    this.applyAccessibilitySettings(updated);
  }

  toggleHighContrast(): void {
    const current = this.accessibilitySettings$.value;
    this.updateAccessibilitySettings({ highContrast: !current.highContrast });
  }

  setFontSize(fontSize: FontSize): void {
    this.updateAccessibilitySettings({ fontSize });
  }

  setColorScheme(colorScheme: ColorScheme): void {
    this.updateAccessibilitySettings({ colorScheme });
  }

  // Offline Content Management
  getOfflineContent(): Observable<OfflineContent[]> {
    return this.offlineContent$.asObservable();
  }

  downloadContent(contentId: string): Observable<OfflineContent> {
    return new Observable(observer => {
      // Simulate download process
      const content = this.createOfflineContent(contentId);
      
      // Simulate download progress
      setTimeout(() => {
        content.syncStatus = SyncStatus.DOWNLOADING;
        observer.next(content);
      }, 100);

      setTimeout(() => {
        content.syncStatus = SyncStatus.SYNCED;
        content.downloadedAt = new Date();
        
        const currentContent = this.offlineContent$.value;
        const updatedContent = [...currentContent, content];
        this.offlineContent$.next(updatedContent);
        
        observer.next(content);
        observer.complete();
      }, 2000);
    });
  }

  deleteOfflineContent(contentId: string): void {
    const currentContent = this.offlineContent$.value;
    const filteredContent = currentContent.filter(c => c.id !== contentId);
    this.offlineContent$.next(filteredContent);
    this.updateStorageQuota();
  }

  syncOfflineContent(): Observable<OfflineContent[]> {
    return new Observable(observer => {
      const content = this.offlineContent$.value;
      const pendingSync = content.filter(c => c.syncStatus === SyncStatus.PENDING_UPLOAD);
      
      // Simulate sync process
      let completed = 0;
      pendingSync.forEach((item, index) => {
        setTimeout(() => {
          item.syncStatus = SyncStatus.SYNCED;
          completed++;
          
          if (completed === pendingSync.length) {
            this.offlineContent$.next([...content]);
            observer.next(content);
            observer.complete();
          }
        }, (index + 1) * 500);
      });
      
      if (pendingSync.length === 0) {
        observer.next(content);
        observer.complete();
      }
    });
  }

  // Storage Management
  getStorageQuota(): StorageQuota {
    return this.storageQuota$.value;
  }

  getStorageQuotaObservable(): Observable<StorageQuota> {
    return this.storageQuota$.asObservable();
  }

  updateStorageQuota(): void {
    const quota = this.calculateStorageQuota();
    this.storageQuota$.next(quota);
  }

  clearStorageCache(): void {
    // Simulate cache clearing
    const quota = this.storageQuota$.value;
    quota.used = quota.used * 0.3; // Simulate 70% cleanup
    quota.available = quota.total - quota.used;
    this.storageQuota$.next(quota);
  }

  // PWA Capabilities
  getPWACapabilities(): Observable<PWACapabilities> {
    return this.pwaCapabilities$.asObservable();
  }

  installPWA(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate PWA installation
      setTimeout(() => {
        const capabilities = this.pwaCapabilities$.value;
        capabilities.installable = false;
        capabilities.standalone = true;
        this.pwaCapabilities$.next(capabilities);
        resolve(true);
      }, 1000);
    });
  }

  // Performance Monitoring
  getPerformanceMetrics(): Observable<PerformanceMetrics[]> {
    return this.performanceMetrics$.asObservable();
  }

  recordPerformanceMetric(metric: Partial<PerformanceMetrics>): void {
    const fullMetric: PerformanceMetrics = {
      id: this.generateId(),
      deviceInfo: this.getDeviceInfo(),
      loadTime: metric.loadTime || 0,
      renderTime: metric.renderTime || 0,
      interactionTime: metric.interactionTime || 0,
      memoryUsage: metric.memoryUsage || 0,
      batteryLevel: (navigator as any).battery?.level,
      networkLatency: metric.networkLatency || 0,
      timestamp: new Date()
    };

    const currentMetrics = this.performanceMetrics$.value;
    const updatedMetrics = [...currentMetrics, fullMetric].slice(-50); // Keep last 50 metrics
    this.performanceMetrics$.next(updatedMetrics);
  }

  // Adaptive UI
  getAdaptiveUI(): Observable<AdaptiveUI> {
    return this.adaptiveUI$.asObservable();
  }

  updateAdaptiveUI(breakpoint: ResponsiveBreakpoint): void {
    const adaptiveUI = this.createAdaptiveUIForBreakpoint(breakpoint);
    this.adaptiveUI$.next(adaptiveUI);
  }

  // Touch and Gesture Support
  registerTouchGesture(gesture: TouchGesture): void {
    // Touch gesture registration logic would go here
    console.log('Touch gesture registered:', gesture);
  }

  // Offline Status Methods
  getOfflineStatus(): Observable<'online' | 'offline'> {
    return this.offlineStatus$.asObservable();
  }

  getSyncStatus(): Observable<SyncStatus> {
    return this.syncStatus$.asObservable();
  }

  getDownloadedContent(): OfflineContent[] {
    return this.offlineContent$.value.filter(content => content.downloadedAt);
  }

  async removeOfflineContent(contentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const currentContent = this.offlineContent$.value;
      const updatedContent = currentContent.filter(content => content.id !== contentId);
      this.offlineContent$.next(updatedContent);
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to remove content' };
    }
  }

  async syncContent(contentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      this.syncStatus$.next(SyncStatus.UPLOADING);
      
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentContent = this.offlineContent$.value;
      const updatedContent = currentContent.map(content => 
        content.id === contentId 
          ? { ...content, syncStatus: SyncStatus.SYNCED, lastAccessed: new Date() }
          : content
      );
      
      this.offlineContent$.next(updatedContent);
      this.syncStatus$.next(SyncStatus.SYNCED);
      
      return { success: true };
    } catch (error) {
      this.syncStatus$.next(SyncStatus.ERROR);
      return { success: false, message: 'Sync failed' };
    }
  }

  async syncAllContent(): Promise<{ success: boolean; message?: string }> {
    try {
      this.syncStatus$.next(SyncStatus.UPLOADING);
      
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const currentContent = this.offlineContent$.value;
      const updatedContent = currentContent.map(content => ({
        ...content,
        syncStatus: SyncStatus.SYNCED,
        lastAccessed: new Date()
      }));
      
      this.offlineContent$.next(updatedContent);
      this.syncStatus$.next(SyncStatus.SYNCED);
      
      return { success: true };
    } catch (error) {
      this.syncStatus$.next(SyncStatus.ERROR);
      return { success: false, message: 'Sync failed' };
    }
  }

  async clearOfflineStorage(): Promise<{ success: boolean; message?: string }> {
    try {
      this.offlineContent$.next([]);
      this.storageQuota$.next({
        total: 5000,
        used: 0,
        available: 5000,
        byCategory: new Map(),
        warnings: []
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to clear storage' };
    }
  }

  // Private Methods
  private initializeResponsiveDetection(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(250),
        startWith(null),
        map(() => this.detectCurrentBreakpoint())
      )
      .subscribe(breakpoint => {
        this.currentBreakpoint$.next(breakpoint);
        this.updateAdaptiveUI(breakpoint);
      });
  }

  private initializeAccessibilityObservers(): void {
    // Listen for system preference changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        if (this.accessibilitySettings$.value.colorScheme === ColorScheme.AUTO) {
          this.applyColorScheme(e.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
        }
      });

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.addEventListener('change', (e) => {
        this.updateAccessibilitySettings({ reducedMotion: e.matches });
      });
    }

    // Network status changes
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());
  }

  private initializePerformanceMonitoring(): void {
    // Record initial page load metrics
    if (performance && performance.timing) {
      const timing = performance.timing;
      this.recordPerformanceMetric({
        loadTime: timing.loadEventEnd - timing.navigationStart,
        renderTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart
      });
    }
  }

  private detectCurrentBreakpoint(): ResponsiveBreakpoint {
    const width = window.innerWidth;
    return this.breakpoints.find(bp => 
      width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)
    ) || this.breakpoints[0];
  }

  private getInitialBreakpoint(): ResponsiveBreakpoint {
    return this.detectCurrentBreakpoint();
  }

  private detectDeviceCapabilities(): DeviceCapability {
    return {
      touchSupport: 'ontouchstart' in window,
      orientationSupport: 'orientation' in window,
      geolocationSupport: 'geolocation' in navigator,
      cameraSupport: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      accelerometerSupport: 'DeviceMotionEvent' in window,
      storageQuota: this.estimateStorageQuota(),
      networkSupport: {
        online: navigator.onLine,
        connectionType: this.detectConnectionType(),
        effectiveType: (navigator as any).connection?.effectiveType || '4g',
        downlink: (navigator as any).connection?.downlink || 10,
        rtt: (navigator as any).connection?.rtt || 100
      }
    };
  }

  private detectConnectionType(): ConnectionType {
    const connection = (navigator as any).connection;
    if (!connection) return ConnectionType.UNKNOWN;
    
    switch (connection.type) {
      case 'wifi': return ConnectionType.WIFI;
      case 'cellular': return ConnectionType.CELLULAR;
      case 'bluetooth': return ConnectionType.BLUETOOTH;
      case 'ethernet': return ConnectionType.ETHERNET;
      default: return ConnectionType.UNKNOWN;
    }
  }

  private estimateStorageQuota(): number {
    // Estimate storage quota (simplified)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        return estimate.quota || 50 * 1024 * 1024; // 50MB default
      });
    }
    return 50 * 1024 * 1024; // 50MB default
  }

  private detectPWACapabilities(): PWACapabilities {
    return {
      installable: 'serviceWorker' in navigator && window.matchMedia('(display-mode: browser)').matches,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      offlineSupport: 'serviceWorker' in navigator,
      pushMessaging: 'serviceWorker' in navigator && 'PushManager' in window,
      webShare: 'share' in navigator
    };
  }

  private getDefaultAccessibilitySettings(): AccessibilitySettings {
    return {
      id: this.generateId(),
      userId: 'current-user',
      highContrast: false,
      fontSize: FontSize.MEDIUM,
      colorScheme: ColorScheme.AUTO,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      screenReaderEnabled: false,
      keyboardNavigationEnabled: true,
      focusIndicatorEnhanced: false,
      audioDescriptions: false,
      captionsEnabled: false,
      voiceControlEnabled: false,
      updatedAt: new Date()
    };
  }

  private applyAccessibilitySettings(settings: AccessibilitySettings): void {
    // Apply font size
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Apply color scheme
    this.applyColorScheme(settings.colorScheme);
    
    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
    
    // Apply enhanced focus indicators
    document.documentElement.classList.toggle('enhanced-focus', settings.focusIndicatorEnhanced);
  }

  private applyColorScheme(scheme: ColorScheme): void {
    const html = document.documentElement;
    html.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');
    
    switch (scheme) {
      case ColorScheme.LIGHT:
        html.classList.add('light-theme');
        break;
      case ColorScheme.DARK:
        html.classList.add('dark-theme');
        break;
      case ColorScheme.HIGH_CONTRAST:
        html.classList.add('high-contrast-theme');
        break;
      case ColorScheme.AUTO:
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        break;
    }
  }

  private getMockOfflineContent(): OfflineContent[] {
    return [
      {
        id: 'offline-1',
        contentId: 'lesson-101',
        title: 'Introduction to Programming',
        type: ContentType.LESSON,
        size: 2048000, // 2MB
        downloadedAt: new Date(),
        lastAccessed: new Date(),
        priority: OfflinePriority.HIGH,
        syncStatus: SyncStatus.SYNCED,
        metadata: {
          version: '1.0.0',
          checksum: 'abc123',
          dependencies: [],
          requirements: {
            minStorageSpace: 2048000,
            requiresNetwork: false,
            supportedPlatforms: [Platform.WEB, Platform.PWA]
          }
        }
      },
      {
        id: 'offline-2',
        contentId: 'video-201',
        title: 'JavaScript Fundamentals',
        type: ContentType.VIDEO,
        size: 15728640, // 15MB
        downloadedAt: new Date(),
        lastAccessed: new Date(),
        priority: OfflinePriority.MEDIUM,
        syncStatus: SyncStatus.SYNCED,
        metadata: {
          version: '1.0.0',
          checksum: 'def456',
          dependencies: ['lesson-101'],
          requirements: {
            minStorageSpace: 15728640,
            requiresNetwork: false,
            supportedPlatforms: [Platform.WEB, Platform.PWA]
          }
        }
      }
    ];
  }

  private createOfflineContent(contentId: string): OfflineContent {
    return {
      id: this.generateId(),
      contentId,
      title: `Content ${contentId}`,
      type: ContentType.LESSON,
      size: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
      downloadedAt: new Date(),
      lastAccessed: new Date(),
      priority: OfflinePriority.MEDIUM,
      syncStatus: SyncStatus.PENDING_DOWNLOAD,
      metadata: {
        version: '1.0.0',
        checksum: this.generateId(),
        dependencies: [],
        requirements: {
          minStorageSpace: 1000000,
          requiresNetwork: false,
          supportedPlatforms: [Platform.WEB, Platform.PWA]
        }
      }
    };
  }

  private getStorageInfo(): StorageQuota {
    const totalStorage = 100 * 1024 * 1024; // 100MB
    const usedStorage = 25 * 1024 * 1024; // 25MB
    
    return {
      total: totalStorage,
      used: usedStorage,
      available: totalStorage - usedStorage,
      byCategory: new Map([
        [ContentType.LESSON, 10 * 1024 * 1024],
        [ContentType.VIDEO, 15 * 1024 * 1024],
        [ContentType.ASSESSMENT, 0]
      ]),
      warnings: []
    };
  }

  private calculateStorageQuota(): StorageQuota {
    const content = this.offlineContent$.value;
    const totalSize = content.reduce((sum, item) => sum + item.size, 0);
    const totalStorage = 100 * 1024 * 1024; // 100MB
    
    const byCategory = new Map();
    content.forEach(item => {
      const currentSize = byCategory.get(item.type) || 0;
      byCategory.set(item.type, currentSize + item.size);
    });

    return {
      total: totalStorage,
      used: totalSize,
      available: totalStorage - totalSize,
      byCategory,
      warnings: totalSize > totalStorage * 0.8 ? [{
        id: this.generateId(),
        type: 'low_space' as any,
        message: 'Storage space is running low',
        threshold: 0.8,
        severity: 'warning' as any,
        createdAt: new Date()
      }] : []
    };
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelDensity: window.devicePixelRatio,
      touchPoints: navigator.maxTouchPoints || 0,
      orientation: screen.orientation?.type?.includes('portrait') ? 
        ScreenOrientation.PORTRAIT : ScreenOrientation.LANDSCAPE
    };
  }

  private getInitialAdaptiveUI(): AdaptiveUI {
    const breakpoint = this.getInitialBreakpoint();
    return this.createAdaptiveUIForBreakpoint(breakpoint);
  }

  private createAdaptiveUIForBreakpoint(breakpoint: ResponsiveBreakpoint): AdaptiveUI {
    const isMobile = breakpoint.id === 'xs' || breakpoint.id === 'sm';
    const isTablet = breakpoint.id === 'md';
    
    return {
      breakpoint,
      layout: {
        columns: isMobile ? 1 : isTablet ? 2 : 3,
        spacing: isMobile ? 8 : 16,
        margins: isMobile ? 16 : 24,
        cardLayout: isMobile ? CardLayout.LIST : CardLayout.GRID,
        listDensity: isMobile ? ListDensity.COMFORTABLE : ListDensity.STANDARD
      },
      navigation: {
        type: isMobile ? NavigationType.BOTTOM_NAV : NavigationType.TOP_NAV,
        position: isMobile ? NavigationPosition.BOTTOM : NavigationPosition.TOP,
        collapsible: !isMobile,
        swipeEnabled: isMobile
      },
      interactions: {
        touchTargetSize: isMobile ? 48 : 40,
        hapticFeedback: isMobile,
        gesturesEnabled: isMobile,
        voiceControlEnabled: false
      }
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

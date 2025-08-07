// Mobile Accessibility Models
export interface ResponsiveBreakpoint {
  id: string;
  name: string;
  minWidth: number;
  maxWidth?: number;
  description: string;
}

export interface DeviceCapability {
  touchSupport: boolean;
  orientationSupport: boolean;
  geolocationSupport: boolean;
  cameraSupport: boolean;
  accelerometerSupport: boolean;
  storageQuota: number;
  networkSupport: NetworkCapability;
}

export interface NetworkCapability {
  online: boolean;
  connectionType: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
}

export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  BLUETOOTH = 'bluetooth',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown'
}

export enum EffectiveConnectionType {
  SLOW_2G = 'slow-2g',
  TWO_G = '2g',
  THREE_G = '3g',
  FOUR_G = '4g'
}

// Accessibility Models
export interface AccessibilitySettings {
  id: string;
  userId: string;
  highContrast: boolean;
  fontSize: FontSize;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  screenReaderEnabled: boolean;
  keyboardNavigationEnabled: boolean;
  focusIndicatorEnhanced: boolean;
  audioDescriptions: boolean;
  captionsEnabled: boolean;
  voiceControlEnabled: boolean;
  customCss?: string;
  updatedAt: Date;
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
}

export enum ColorScheme {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high-contrast',
  AUTO = 'auto'
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  action: string;
  description: string;
  category: ShortcutCategory;
  enabled: boolean;
}

export enum ShortcutCategory {
  NAVIGATION = 'navigation',
  CONTENT = 'content',
  ACCESSIBILITY = 'accessibility',
  LEARNING = 'learning'
}

// Offline Capabilities Models
export interface OfflineContent {
  id: string;
  contentId: string;
  title: string;
  type: ContentType;
  size: number;
  downloadedAt: Date;
  lastAccessed: Date;
  priority: OfflinePriority;
  expiresAt?: Date;
  syncStatus: SyncStatus;
  metadata: OfflineMetadata;
}

export enum ContentType {
  LESSON = 'lesson',
  VIDEO = 'video',
  ASSESSMENT = 'assessment',
  RESOURCE = 'resource',
  DOCUMENT = 'document'
}

export enum OfflinePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING_DOWNLOAD = 'pending_download',
  DOWNLOADING = 'downloading',
  PENDING_UPLOAD = 'pending_upload',
  UPLOADING = 'uploading',
  CONFLICT = 'conflict',
  ERROR = 'error'
}

export interface OfflineMetadata {
  version: string;
  checksum: string;
  dependencies: string[];
  requirements: OfflineRequirements;
}

export interface OfflineRequirements {
  minStorageSpace: number;
  requiresNetwork: boolean;
  supportedPlatforms: Platform[];
}

export enum Platform {
  WEB = 'web',
  PWA = 'pwa',
  ANDROID = 'android',
  IOS = 'ios'
}

export interface StorageQuota {
  total: number;
  used: number;
  available: number;
  byCategory: Map<ContentType, number>;
  warnings: StorageWarning[];
}

export interface StorageWarning {
  id: string;
  type: WarningType;
  message: string;
  threshold: number;
  severity: WarningSeverity;
  createdAt: Date;
}

export enum WarningType {
  LOW_SPACE = 'low_space',
  QUOTA_EXCEEDED = 'quota_exceeded',
  CLEANUP_REQUIRED = 'cleanup_required'
}

export enum WarningSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

// PWA Models
export interface PWAInstallPrompt {
  available: boolean;
  platform: Platform;
  prompt?: any;
  installDate?: Date;
  dismissed: boolean;
}

export interface PWACapabilities {
  installable: boolean;
  standalone: boolean;
  notifications: boolean;
  backgroundSync: boolean;
  offlineSupport: boolean;
  pushMessaging: boolean;
  webShare: boolean;
}

// Touch and Gesture Models
export interface TouchGesture {
  id: string;
  type: GestureType;
  element: string;
  action: GestureAction;
  enabled: boolean;
  sensitivity: number;
}

export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap',
  LONG_PRESS = 'long_press',
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  PINCH = 'pinch',
  ZOOM = 'zoom'
}

export enum GestureAction {
  NAVIGATE = 'navigate',
  SELECT = 'select',
  SCROLL = 'scroll',
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
  CONTEXT_MENU = 'context_menu',
  CUSTOM = 'custom'
}

// Screen Reader Models
export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  timestamp: Date;
  acknowledged: boolean;
}

export enum AnnouncementPriority {
  POLITE = 'polite',
  ASSERTIVE = 'assertive',
  OFF = 'off'
}

export enum AnnouncementType {
  NAVIGATION = 'navigation',
  STATUS = 'status',
  ERROR = 'error',
  SUCCESS = 'success',
  INFORMATION = 'information'
}

// Mobile Performance Models
export interface PerformanceMetrics {
  id: string;
  deviceInfo: DeviceInfo;
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  batteryLevel?: number;
  networkLatency: number;
  timestamp: Date;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  pixelDensity: number;
  touchPoints: number;
  orientation: ScreenOrientation;
}

export enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
  PORTRAIT_SECONDARY = 'portrait-secondary',
  LANDSCAPE_SECONDARY = 'landscape-secondary'
}

// Progressive Enhancement Models
export interface FeatureSupport {
  feature: string;
  supported: boolean;
  fallback?: string;
  enhancement?: string;
}

export interface AdaptiveUI {
  breakpoint: ResponsiveBreakpoint;
  layout: LayoutConfiguration;
  navigation: NavigationConfiguration;
  interactions: InteractionConfiguration;
}

export interface LayoutConfiguration {
  columns: number;
  spacing: number;
  margins: number;
  cardLayout: CardLayout;
  listDensity: ListDensity;
}

export enum CardLayout {
  GRID = 'grid',
  LIST = 'list',
  COMPACT = 'compact'
}

export enum ListDensity {
  COMFORTABLE = 'comfortable',
  STANDARD = 'standard',
  COMPACT = 'compact'
}

export interface NavigationConfiguration {
  type: NavigationType;
  position: NavigationPosition;
  collapsible: boolean;
  swipeEnabled: boolean;
}

export enum NavigationType {
  TABS = 'tabs',
  DRAWER = 'drawer',
  BOTTOM_NAV = 'bottom_nav',
  TOP_NAV = 'top_nav'
}

export enum NavigationPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface InteractionConfiguration {
  touchTargetSize: number;
  hapticFeedback: boolean;
  gesturesEnabled: boolean;
  voiceControlEnabled: boolean;
}

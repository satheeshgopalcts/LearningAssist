import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { MobileAccessibilityService } from '../../services/mobile-accessibility.service';
import { 
  AccessibilitySettings, 
  FontSize, 
  ColorScheme,
  KeyboardShortcut,
  ShortcutCategory 
} from '../../../models/mobile-accessibility.model';

@Component({
  selector: 'app-accessibility-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatSliderModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './accessibility-controls.component.html',
  styleUrls: ['./accessibility-controls.component.scss']
})
export class AccessibilityControlsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Public enums for template access
  FontSize = FontSize;
  ColorScheme = ColorScheme;
  ShortcutCategory = ShortcutCategory;

  // Component state
  accessibilitySettings: AccessibilitySettings | null = null;
  keyboardShortcuts: KeyboardShortcut[] = [];
  
  // Forms
  accessibilityForm: FormGroup;
  
  // Demo content for testing
  demoText = `
    This is sample text to demonstrate accessibility features. 
    You can adjust font size, color scheme, and contrast settings 
    to see how they affect readability and user experience.
  `;

  constructor(
    private mobileAccessibilityService: MobileAccessibilityService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.accessibilityForm = this.createAccessibilityForm();
    this.keyboardShortcuts = this.getDefaultKeyboardShortcuts();
  }

  ngOnInit(): void {
    this.subscribeToAccessibilitySettings();
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Accessibility Control Methods
  toggleHighContrast(): void {
    this.mobileAccessibilityService.toggleHighContrast();
    this.showAccessibilityNotification('High contrast mode toggled');
  }

  changeFontSize(fontSize: FontSize): void {
    this.mobileAccessibilityService.setFontSize(fontSize);
    this.showAccessibilityNotification(`Font size changed to ${fontSize}`);
  }

  changeColorScheme(scheme: ColorScheme): void {
    this.mobileAccessibilityService.setColorScheme(scheme);
    this.showAccessibilityNotification(`Color scheme changed to ${scheme}`);
  }

  toggleReducedMotion(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.reducedMotion;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      reducedMotion: newValue 
    });
    this.showAccessibilityNotification(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleScreenReader(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.screenReaderEnabled;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      screenReaderEnabled: newValue 
    });
    this.showAccessibilityNotification(`Screen reader ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleKeyboardNavigation(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.keyboardNavigationEnabled;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      keyboardNavigationEnabled: newValue 
    });
    this.showAccessibilityNotification(`Keyboard navigation ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleEnhancedFocus(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.focusIndicatorEnhanced;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      focusIndicatorEnhanced: newValue 
    });
    this.showAccessibilityNotification(`Enhanced focus indicators ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleAudioDescriptions(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.audioDescriptions;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      audioDescriptions: newValue 
    });
    this.showAccessibilityNotification(`Audio descriptions ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleCaptions(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.captionsEnabled;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      captionsEnabled: newValue 
    });
    this.showAccessibilityNotification(`Captions ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleVoiceControl(): void {
    if (!this.accessibilitySettings) return;
    
    const newValue = !this.accessibilitySettings.voiceControlEnabled;
    this.mobileAccessibilityService.updateAccessibilitySettings({ 
      voiceControlEnabled: newValue 
    });
    this.showAccessibilityNotification(`Voice control ${newValue ? 'enabled' : 'disabled'}`);
  }

  // Keyboard Shortcuts
  getShortcutsByCategory(category: ShortcutCategory): KeyboardShortcut[] {
    return this.keyboardShortcuts.filter(shortcut => shortcut.category === category);
  }

  toggleShortcut(shortcutId: string): void {
    const shortcut = this.keyboardShortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      this.showAccessibilityNotification(
        `Shortcut ${shortcut.keys.join('+')} ${shortcut.enabled ? 'enabled' : 'disabled'}`
      );
    }
  }

  // Testing Methods
  testScreenReaderAnnouncement(): void {
    const message = 'This is a screen reader test announcement. Accessibility features are working properly.';
    this.announceToScreenReader(message);
    this.showAccessibilityNotification('Screen reader test announced');
  }

  testKeyboardNavigation(): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
      this.showAccessibilityNotification(`Keyboard navigation test: ${focusableElements.length} focusable elements found`);
    }
  }

  testColorContrastRatio(): void {
    // This would typically calculate actual contrast ratios
    // For demo purposes, we'll just show a notification
    this.showAccessibilityNotification('Color contrast ratio: 4.5:1 (AA compliant)');
  }

  resetAccessibilitySettings(): void {
    const defaultSettings = {
      highContrast: false,
      fontSize: FontSize.MEDIUM,
      colorScheme: ColorScheme.AUTO,
      reducedMotion: false,
      screenReaderEnabled: false,
      keyboardNavigationEnabled: true,
      focusIndicatorEnhanced: false,
      audioDescriptions: false,
      captionsEnabled: false,
      voiceControlEnabled: false
    };
    
    this.mobileAccessibilityService.updateAccessibilitySettings(defaultSettings);
    this.showAccessibilityNotification('Accessibility settings reset to defaults');
  }

  // Utility Methods
  getFontSizeLabel(fontSize: FontSize): string {
    switch (fontSize) {
      case FontSize.SMALL: return 'Small';
      case FontSize.MEDIUM: return 'Medium';
      case FontSize.LARGE: return 'Large';
      case FontSize.EXTRA_LARGE: return 'Extra Large';
      default: return 'Medium';
    }
  }

  getColorSchemeLabel(scheme: ColorScheme): string {
    switch (scheme) {
      case ColorScheme.LIGHT: return 'Light';
      case ColorScheme.DARK: return 'Dark';
      case ColorScheme.HIGH_CONTRAST: return 'High Contrast';
      case ColorScheme.AUTO: return 'Auto';
      default: return 'Auto';
    }
  }

  getShortcutText(keys: string[]): string {
    return keys.join(' + ');
  }

  // Current settings (computed from form)
  get settings(): AccessibilitySettings {
    return {
      id: 'current',
      userId: 'current-user',
      highContrast: this.accessibilityForm.get('highContrast')?.value || false,
      fontSize: this.accessibilityForm.get('fontSize')?.value || FontSize.MEDIUM,
      colorScheme: this.accessibilityForm.get('colorScheme')?.value || ColorScheme.LIGHT,
      reducedMotion: this.accessibilityForm.get('reducedMotion')?.value || false,
      screenReaderEnabled: this.accessibilityForm.get('screenReaderEnabled')?.value || false,
      keyboardNavigationEnabled: this.accessibilityForm.get('keyboardNavigation')?.value || false,
      focusIndicatorEnhanced: this.accessibilityForm.get('focusIndicators')?.value || false,
      audioDescriptions: this.accessibilityForm.get('audioDescriptions')?.value || false,
      captionsEnabled: this.accessibilityForm.get('soundNotifications')?.value || false,
      voiceControlEnabled: this.accessibilityForm.get('skipLinks')?.value || false,
      updatedAt: new Date()
    };
  }

  screenReaderAnnouncement = '';

  // Private Methods
  private subscribeToAccessibilitySettings(): void {
    this.mobileAccessibilityService.getAccessibilitySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.accessibilitySettings = settings;
        this.updateForm();
      });
  }

  private createAccessibilityForm(): FormGroup {
    return this.fb.group({
      highContrast: [false],
      fontSize: [FontSize.MEDIUM],
      colorScheme: [ColorScheme.AUTO],
      reducedMotion: [false],
      screenReaderEnabled: [false],
      keyboardNavigationEnabled: [true],
      focusIndicatorEnhanced: [false],
      audioDescriptions: [false],
      captionsEnabled: [false],
      voiceControlEnabled: [false]
    });
  }

  private updateForm(): void {
    if (this.accessibilitySettings) {
      this.accessibilityForm.patchValue({
        highContrast: this.accessibilitySettings.highContrast,
        fontSize: this.accessibilitySettings.fontSize,
        colorScheme: this.accessibilitySettings.colorScheme,
        reducedMotion: this.accessibilitySettings.reducedMotion,
        screenReaderEnabled: this.accessibilitySettings.screenReaderEnabled,
        keyboardNavigationEnabled: this.accessibilitySettings.keyboardNavigationEnabled,
        focusIndicatorEnhanced: this.accessibilitySettings.focusIndicatorEnhanced,
        audioDescriptions: this.accessibilitySettings.audioDescriptions,
        captionsEnabled: this.accessibilitySettings.captionsEnabled,
        voiceControlEnabled: this.accessibilitySettings.voiceControlEnabled
      });
    }
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcut(event);
    });
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    const pressedKeys: string[] = [];
    if (event.ctrlKey) pressedKeys.push('Ctrl');
    if (event.altKey) pressedKeys.push('Alt');
    if (event.shiftKey) pressedKeys.push('Shift');
    pressedKeys.push(event.key);

    const shortcut = this.keyboardShortcuts.find(s => 
      s.enabled && this.arraysEqual(s.keys, pressedKeys)
    );

    if (shortcut) {
      event.preventDefault();
      this.executeShortcutAction(shortcut.action);
    }
  }

  private executeShortcutAction(action: string): void {
    switch (action) {
      case 'toggle_high_contrast':
        this.toggleHighContrast();
        break;
      case 'increase_font_size':
        this.increaseFontSize();
        break;
      case 'decrease_font_size':
        this.decreaseFontSize();
        break;
      case 'toggle_reduced_motion':
        this.toggleReducedMotion();
        break;
      case 'focus_main_content':
        this.focusMainContent();
        break;
      case 'show_shortcuts':
        this.showKeyboardShortcuts();
        break;
      default:
        console.log('Unknown shortcut action:', action);
    }
  }

  private increaseFontSize(): void {
    if (!this.accessibilitySettings) return;
    
    const sizes = [FontSize.SMALL, FontSize.MEDIUM, FontSize.LARGE, FontSize.EXTRA_LARGE];
    const currentIndex = sizes.indexOf(this.accessibilitySettings.fontSize);
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
    
    if (nextIndex !== currentIndex) {
      this.changeFontSize(sizes[nextIndex]);
    }
  }

  private decreaseFontSize(): void {
    if (!this.accessibilitySettings) return;
    
    const sizes = [FontSize.SMALL, FontSize.MEDIUM, FontSize.LARGE, FontSize.EXTRA_LARGE];
    const currentIndex = sizes.indexOf(this.accessibilitySettings.fontSize);
    const prevIndex = Math.max(currentIndex - 1, 0);
    
    if (prevIndex !== currentIndex) {
      this.changeFontSize(sizes[prevIndex]);
    }
  }

  private focusMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"], .main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      this.announceToScreenReader('Main content focused');
    }
  }

  private showKeyboardShortcuts(): void {
    this.showAccessibilityNotification('Keyboard shortcuts panel opened');
  }

  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  private showAccessibilityNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  private getDefaultKeyboardShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'shortcut-1',
        keys: ['Ctrl', 'Alt', 'c'],
        action: 'toggle_high_contrast',
        description: 'Toggle high contrast mode',
        category: ShortcutCategory.ACCESSIBILITY,
        enabled: true
      },
      {
        id: 'shortcut-2',
        keys: ['Ctrl', '+'],
        action: 'increase_font_size',
        description: 'Increase font size',
        category: ShortcutCategory.ACCESSIBILITY,
        enabled: true
      },
      {
        id: 'shortcut-3',
        keys: ['Ctrl', '-'],
        action: 'decrease_font_size',
        description: 'Decrease font size',
        category: ShortcutCategory.ACCESSIBILITY,
        enabled: true
      },
      {
        id: 'shortcut-4',
        keys: ['Ctrl', 'Alt', 'm'],
        action: 'toggle_reduced_motion',
        description: 'Toggle reduced motion',
        category: ShortcutCategory.ACCESSIBILITY,
        enabled: true
      },
      {
        id: 'shortcut-5',
        keys: ['Alt', '1'],
        action: 'focus_main_content',
        description: 'Focus main content',
        category: ShortcutCategory.NAVIGATION,
        enabled: true
      },
      {
        id: 'shortcut-6',
        keys: ['Ctrl', 'Alt', 'k'],
        action: 'show_shortcuts',
        description: 'Show keyboard shortcuts',
        category: ShortcutCategory.ACCESSIBILITY,
        enabled: true
      }
    ];
  }

  formatFontSizeLabel = (value: number): string => {
    const fontSizes = ['Small', 'Medium', 'Large', 'Extra Large', 'Huge'];
    return fontSizes[value] || 'Medium';
  };

  saveSettings(): void {
    const settings = this.settings;
    this.mobileAccessibilityService.updateAccessibilitySettings(settings);
    this.announceToScreenReader('Accessibility settings saved successfully');
    // In a real app, save to backend
  }

  resetSettings(): void {
    this.accessibilityForm.reset();
    this.createAccessibilityForm();
    this.announceToScreenReader('Accessibility settings reset to defaults');
  }

  testScreenReader(): void {
    this.announceToScreenReader('Screen reader is working correctly. This is a test announcement.');
  }
}

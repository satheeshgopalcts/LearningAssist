import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { MobileAccessibilityService } from '../../services/mobile-accessibility.service';
import { 
  OfflineContent, 
  SyncStatus,
  ContentType,
  StorageQuota
} from '../../../models/mobile-accessibility.model';

@Component({
  selector: 'app-offline-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './offline-manager.component.html',
  styleUrls: ['./offline-manager.component.scss']
})
export class OfflineManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isOffline = false;
  availableContent: any[] = [];
  downloadedContent: OfflineContent[] = [];
  syncStatus: SyncStatus = SyncStatus.SYNCED;
  downloadProgress: { [key: string]: number } = {};
  storageQuota: StorageQuota | null = null;
  
  readonly SyncStatus = SyncStatus;
  readonly ContentType = ContentType;

  constructor(
    private mobileService: MobileAccessibilityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeOfflineManager();
    this.subscribeToStatusChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeOfflineManager(): void {
    this.loadAvailableContent();
    this.loadDownloadedContent();
    this.updateStorageInfo();
  }

  private subscribeToStatusChanges(): void {
    // Subscribe to offline status
    this.mobileService.getOfflineStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isOffline = status === 'offline';
        if (status === 'online' && this.hasUnsyncedContent()) {
          this.promptAutoSync();
        }
      });

    // Subscribe to sync status
    this.mobileService.getSyncStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.syncStatus = status;
      });
  }

  private loadAvailableContent(): void {
    // Simulate loading available content for download
    this.availableContent = [
      {
        id: '1',
        title: 'Angular Fundamentals Course',
        description: 'Complete Angular fundamentals with examples',
        contentType: ContentType.LESSON,
        size: 25.5,
        isDownloaded: false
      },
      {
        id: '2',
        title: 'JavaScript Assessment', 
        description: 'Test your JavaScript knowledge',
        contentType: ContentType.ASSESSMENT,
        size: 2.1,
        isDownloaded: false
      },
      {
        id: '3',
        title: 'TypeScript Reference Guide',
        description: 'Complete TypeScript reference documentation',
        contentType: ContentType.RESOURCE,
        size: 8.3,
        isDownloaded: false
      }
    ];
  }

  private loadDownloadedContent(): void {
    this.downloadedContent = this.mobileService.getDownloadedContent();
  }

  private updateStorageInfo(): void {
    this.storageQuota = this.mobileService.getStorageQuota();
  }

  async downloadContent(content: any): Promise<void> {
    try {
      this.downloadProgress[content.id] = 0;
      
      // Simulate download progress
      const result = await this.mobileService.downloadContent(content.id);
      
      this.mobileService.downloadContent(content.id).subscribe(
        (downloadedContent: OfflineContent) => {
          // Move from available to downloaded
          this.availableContent = this.availableContent.filter(c => c.id !== content.id);
          this.downloadedContent.push(downloadedContent);
          
          this.updateStorageInfo();
          this.showMessage(`${content.title} downloaded successfully`);
          delete this.downloadProgress[content.id];
        },
        (error) => {
          this.showMessage(`Failed to download ${content.title}`, 'error');
          delete this.downloadProgress[content.id];
        }
      );
    } catch (error) {
      console.error('Download error:', error);
      this.showMessage(`Error downloading ${content.title}`, 'error');
      delete this.downloadProgress[content.id];
    }
  }

  async removeContent(content: OfflineContent): Promise<void> {
    try {
      const result = await this.mobileService.removeOfflineContent(content.id);
      
      if (result.success) {
        // Move from downloaded to available
        this.downloadedContent = this.downloadedContent.filter(c => c.id !== content.id);
        
        const availableContent = {
          id: content.id,
          title: content.title,
          description: `Offline content: ${content.title}`,
          contentType: content.type,
          size: content.size,
          isDownloaded: false
        };
        
        this.availableContent.push(availableContent);
        this.updateStorageInfo();
        this.showMessage(`${content.title} removed from offline storage`);
      }
    } catch (error) {
      console.error('Remove content error:', error);
      this.showMessage(`Error removing ${content.title}`, 'error');
    }
  }

  async syncContent(content?: OfflineContent): Promise<void> {
    try {
      this.syncStatus = SyncStatus.UPLOADING;
      
      let result;
      if (content) {
        result = await this.mobileService.syncContent(content.id);
        if (result.success) {
          this.showMessage(`${content.title} synced successfully`);
        }
      } else {
        result = await this.mobileService.syncAllContent();
        if (result.success) {
          this.showMessage('All content synced successfully');
        }
      }
      
      this.syncStatus = SyncStatus.SYNCED;
    } catch (error) {
      console.error('Sync error:', error);
      this.syncStatus = SyncStatus.ERROR;
      this.showMessage('Sync failed. Please try again.', 'error');
    }
  }

  clearStorage(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { 
        title: 'Clear Offline Storage',
        message: 'This will remove all downloaded content. Are you sure?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performClearStorage();
      }
    });
  }

  private async performClearStorage(): Promise<void> {
    try {
      const result = await this.mobileService.clearOfflineStorage();
      if (result.success) {
        this.downloadedContent.forEach(content => {
          const availableContent = {
            id: content.id,
            title: content.title,
            description: `Offline content: ${content.title}`,
            contentType: content.type,
            size: content.size,
            isDownloaded: false
          };
          this.availableContent.push(availableContent);
        });
        
        this.downloadedContent = [];
        this.updateStorageInfo();
        this.showMessage('Offline storage cleared');
      }
    } catch (error) {
      console.error('Clear storage error:', error);
      this.showMessage('Failed to clear storage', 'error');
    }
  }

  private hasUnsyncedContent(): boolean {
    return this.downloadedContent.some(content => content.syncStatus !== SyncStatus.SYNCED);
  }

  private promptAutoSync(): void {
    if (this.hasUnsyncedContent()) {
      this.snackBar
        .open('You have unsynced content. Sync now?', 'SYNC', {
          duration: 5000
        })
        .onAction()
        .subscribe(() => {
          this.syncContent();
        });
    }
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'CLOSE', {
      duration: 3000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar'
    });
  }

  getContentIcon(contentType: ContentType): string {
    switch (contentType) {
      case ContentType.LESSON:
        return 'school';
      case ContentType.ASSESSMENT:
        return 'quiz';
      case ContentType.RESOURCE:
        return 'library_books';
      case ContentType.VIDEO:
        return 'play_circle';
      default:
        return 'description';
    }
  }

  formatFileSize(sizeInMB: number): string {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  }

  getStorageColor(): string {
    if (!this.storageQuota) return 'primary';
    const percentage = (this.storageQuota.used / this.storageQuota.total) * 100;
    if (percentage > 90) return 'warn';
    if (percentage > 70) return 'accent';
    return 'primary';
  }

  getStoragePercentage(): number {
    if (!this.storageQuota) return 0;
    return (this.storageQuota.used / this.storageQuota.total) * 100;
  }

  getSyncStatusText(): string {
    switch (this.syncStatus) {
      case SyncStatus.PENDING_DOWNLOAD:
        return 'Pending download';
      case SyncStatus.DOWNLOADING:
        return 'Downloading';
      case SyncStatus.PENDING_UPLOAD:
        return 'Pending sync';
      case SyncStatus.UPLOADING:
        return 'Syncing';
      case SyncStatus.CONFLICT:
        return 'Sync conflict';
      case SyncStatus.ERROR:
        return 'Sync error';
      default:
        return 'Synced';
    }
  }
}

// Simple confirm dialog component
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="warn" (click)="onConfirm()">Confirm</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

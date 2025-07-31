import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentUploadProgress } from '../../models/content.model';

@Component({
  selector: 'app-video-uploader',
  templateUrl: './video-uploader.component.html',
  styleUrls: ['./video-uploader.component.scss']
})
export class VideoUploaderComponent {
  @Input() accept = 'video/*';
  @Input() maxFileSize = 100 * 1024 * 1024; // 100MB
  @Output() uploadComplete = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  uploadProgress: ContentUploadProgress | null = null;
  isDragOver = false;

  constructor(private contentService: ContentService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  private uploadFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      this.uploadError.emit('Please select a valid video file.');
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.uploadError.emit(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit.`);
      return;
    }

    // Start upload
    this.contentService.uploadVideo(file).subscribe({
      next: (progress) => {
        this.uploadProgress = progress;
        if (progress.status === 'completed') {
          this.uploadComplete.emit(`/uploads/videos/${file.name}`);
          setTimeout(() => {
            this.uploadProgress = null;
          }, 2000);
        } else if (progress.status === 'error') {
          this.uploadError.emit(progress.error || 'Upload failed');
          this.uploadProgress = null;
        }
      },
      error: (error) => {
        this.uploadError.emit('Upload failed: ' + error.message);
        this.uploadProgress = null;
      }
    });
  }

  cancelUpload() {
    this.uploadProgress = null;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
    fileInput?.click();
  }
}

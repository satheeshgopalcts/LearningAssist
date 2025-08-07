import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { InteractiveLearningService } from '../../interactive-learning.service';
import {
  VirtualClassroom,
  ClassroomParticipant,
  ChatMessage,
  WhiteboardElement,
  ClassroomStatus,
  ClassroomFeature,
  ParticipantRole,
  MessageType,
  AttendanceStatus,
  ElementType
} from '../../../models/interactive-learning.model';

@Component({
  selector: 'app-virtual-classroom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatListModule,
    MatBadgeModule,
    MatTabsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule
  ],
  templateUrl: './virtual-classroom.component.html',
  styleUrls: ['./virtual-classroom.component.scss']
})
export class VirtualClassroomComponent implements OnInit {
  @ViewChild('whiteboardCanvas') whiteboardCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  // Expose enums to template
  ElementType = ElementType;

  classrooms$: Observable<VirtualClassroom[]>;
  selectedClassroom: VirtualClassroom | null = null;
  currentUser = 'current-user';
  currentUserName = 'Current User';
  
  // View modes
  viewMode: 'list' | 'classroom' = 'list';
  sidenavOpen = true;
  
  // Form models for creating classroom
  newClassroomTitle = '';
  newClassroomDescription = '';
  newClassroomStartDate = new Date();
  newClassroomEndDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
  newClassroomMaxParticipants = 30;
  
  // Chat
  chatMessage = '';
  chatMessages: ChatMessage[] = [];
  
  // Whiteboard
  whiteboardContext!: CanvasRenderingContext2D;
  isDrawing = false;
  currentDrawingTool: ElementType = ElementType.DRAWING;
  drawingColor = '#000000';
  drawingSize = 2;
  
  // User controls
  micEnabled = false;
  cameraEnabled = false;
  screenSharing = false;
  
  // Classroom features
  readonly ClassroomFeature = ClassroomFeature;
  readonly ClassroomStatus = ClassroomStatus;
  readonly ParticipantRole = ParticipantRole;
  readonly AttendanceStatus = AttendanceStatus;

  constructor(
    private interactiveLearningService: InteractiveLearningService,
    private snackBar: MatSnackBar
  ) {
    this.classrooms$ = this.interactiveLearningService.getClassrooms();
  }

  ngOnInit(): void {
    this.initializeWhiteboard();
  }

  // Classroom Management
  createClassroom(): void {
    if (!this.newClassroomTitle.trim() || !this.newClassroomDescription.trim()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const classroomData = {
      title: this.newClassroomTitle,
      description: this.newClassroomDescription,
      scheduledStart: this.newClassroomStartDate,
      scheduledEnd: this.newClassroomEndDate,
      maxParticipants: this.newClassroomMaxParticipants,
      features: [
        ClassroomFeature.VIDEO_CONFERENCE,
        ClassroomFeature.CHAT,
        ClassroomFeature.WHITEBOARD,
        ClassroomFeature.SCREEN_SHARE
      ]
    };

    this.interactiveLearningService.createClassroom(classroomData).subscribe({
      next: (classroom) => {
        this.snackBar.open('Virtual classroom created successfully!', 'Close', { duration: 3000 });
        this.resetClassroomForm();
      },
      error: (error) => {
        this.snackBar.open('Error creating classroom. Please try again.', 'Close', { duration: 3000 });
        console.error('Error creating classroom:', error);
      }
    });
  }

  resetClassroomForm(): void {
    this.newClassroomTitle = '';
    this.newClassroomDescription = '';
    this.newClassroomStartDate = new Date();
    this.newClassroomEndDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    this.newClassroomMaxParticipants = 30;
  }

  joinClassroom(classroom: VirtualClassroom): void {
    this.interactiveLearningService.joinClassroom(
      classroom.id,
      this.currentUser,
      this.currentUserName
    ).subscribe({
      next: (success) => {
        if (success) {
          this.selectedClassroom = classroom;
          this.viewMode = 'classroom';
          this.chatMessages = classroom.chatMessages || [];
          this.snackBar.open('Joined classroom successfully!', 'Close', { duration: 3000 });
          this.initializeClassroomFeatures();
        }
      },
      error: (error) => {
        this.snackBar.open('Error joining classroom. Please try again.', 'Close', { duration: 3000 });
        console.error('Error joining classroom:', error);
      }
    });
  }

  leaveClassroom(): void {
    if (this.selectedClassroom) {
      this.selectedClassroom = null;
      this.viewMode = 'list';
      this.chatMessages = [];
      this.cleanupClassroomFeatures();
      this.snackBar.open('Left classroom', 'Close', { duration: 2000 });
    }
  }

  // Chat Functions
  sendChatMessage(): void {
    if (!this.chatMessage.trim() || !this.selectedClassroom) return;

    const message: ChatMessage = {
      id: this.generateId(),
      classroomId: this.selectedClassroom.id,
      senderId: this.currentUser,
      senderName: this.currentUserName,
      message: this.chatMessage,
      timestamp: new Date(),
      type: MessageType.TEXT,
      isPrivate: false
    };

    this.chatMessages.push(message);
    this.chatMessage = '';
    
    // Scroll to bottom of chat
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  // Media Controls
  toggleMicrophone(): void {
    this.micEnabled = !this.micEnabled;
    const status = this.micEnabled ? 'enabled' : 'disabled';
    this.snackBar.open(`Microphone ${status}`, 'Close', { duration: 2000 });
    
    // In a real implementation, this would interact with WebRTC/media APIs
    this.updateParticipantStatus();
  }

  toggleCamera(): void {
    this.cameraEnabled = !this.cameraEnabled;
    const status = this.cameraEnabled ? 'enabled' : 'disabled';
    this.snackBar.open(`Camera ${status}`, 'Close', { duration: 2000 });
    
    // In a real implementation, this would interact with WebRTC/media APIs
    this.updateParticipantStatus();
  }

  toggleScreenShare(): void {
    this.screenSharing = !this.screenSharing;
    const status = this.screenSharing ? 'started' : 'stopped';
    this.snackBar.open(`Screen sharing ${status}`, 'Close', { duration: 2000 });
    
    // In a real implementation, this would use the Screen Capture API
    this.updateParticipantStatus();
  }

  // Whiteboard Functions
  initializeWhiteboard(): void {
    // This will be called after view init when canvas is available
  }

  ngAfterViewInit(): void {
    if (this.whiteboardCanvas) {
      this.whiteboardContext = this.whiteboardCanvas.nativeElement.getContext('2d')!;
      this.setupWhiteboardEvents();
    }
  }

  setupWhiteboardEvents(): void {
    const canvas = this.whiteboardCanvas.nativeElement;
    
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseEvent);
    });
  }

  startDrawing(event: MouseEvent): void {
    if (this.currentDrawingTool !== ElementType.DRAWING) return;
    
    this.isDrawing = true;
    const rect = this.whiteboardCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.whiteboardContext.beginPath();
    this.whiteboardContext.moveTo(x, y);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || this.currentDrawingTool !== ElementType.DRAWING) return;
    
    const rect = this.whiteboardCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.whiteboardContext.lineWidth = this.drawingSize;
    this.whiteboardContext.lineCap = 'round';
    this.whiteboardContext.strokeStyle = this.drawingColor;
    this.whiteboardContext.lineTo(x, y);
    this.whiteboardContext.stroke();
    this.whiteboardContext.beginPath();
    this.whiteboardContext.moveTo(x, y);
  }

  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.whiteboardContext.beginPath();
    }
  }

  clearWhiteboard(): void {
    const canvas = this.whiteboardCanvas.nativeElement;
    this.whiteboardContext.clearRect(0, 0, canvas.width, canvas.height);
    this.snackBar.open('Whiteboard cleared', 'Close', { duration: 2000 });
  }

  addTextToWhiteboard(): void {
    const text = prompt('Enter text to add to whiteboard:');
    if (text) {
      this.whiteboardContext.font = '16px Arial';
      this.whiteboardContext.fillStyle = this.drawingColor;
      this.whiteboardContext.fillText(text, 50, 50);
    }
  }

  // Recording Functions
  startRecording(): void {
    if (!this.selectedClassroom) return;
    
    this.selectedClassroom.status = ClassroomStatus.RECORDING;
    this.snackBar.open('Recording started', 'Close', { duration: 2000 });
    
    // In a real implementation, this would start screen/audio recording
  }

  stopRecording(): void {
    if (!this.selectedClassroom) return;
    
    this.selectedClassroom.recordingUrl = '/recordings/' + this.generateId() + '.mp4';
    this.snackBar.open('Recording stopped and saved', 'Close', { duration: 3000 });
  }

  // Utility Functions
  private initializeClassroomFeatures(): void {
    // Initialize video conferencing, whiteboard, etc.
    setTimeout(() => {
      if (this.whiteboardCanvas) {
        this.setupWhiteboardEvents();
      }
    }, 100);
  }

  private cleanupClassroomFeatures(): void {
    // Clean up media streams, connections, etc.
    this.micEnabled = false;
    this.cameraEnabled = false;
    this.screenSharing = false;
  }

  private updateParticipantStatus(): void {
    if (!this.selectedClassroom) return;
    
    const participant = this.selectedClassroom.participants.find(p => p.userId === this.currentUser);
    if (participant) {
      participant.micEnabled = this.micEnabled;
      participant.cameraEnabled = this.cameraEnabled;
      participant.screenSharing = this.screenSharing;
    }
  }

  private generateId(): string {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // Template helper methods
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getClassroomStatusIcon(status: ClassroomStatus): string {
    const iconMap = {
      [ClassroomStatus.SCHEDULED]: 'schedule',
      [ClassroomStatus.LIVE]: 'play_circle_filled',
      [ClassroomStatus.ENDED]: 'stop_circle',
      [ClassroomStatus.CANCELLED]: 'cancel',
      [ClassroomStatus.RECORDING]: 'fiber_record'
    };
    return iconMap[status] || 'schedule';
  }

  getClassroomStatusColor(status: ClassroomStatus): string {
    const colorMap = {
      [ClassroomStatus.SCHEDULED]: 'primary',
      [ClassroomStatus.LIVE]: 'accent',
      [ClassroomStatus.ENDED]: 'warn',
      [ClassroomStatus.CANCELLED]: 'warn',
      [ClassroomStatus.RECORDING]: 'warn'
    };
    return colorMap[status] || 'primary';
  }

  getRoleIcon(role: ParticipantRole): string {
    const iconMap = {
      [ParticipantRole.INSTRUCTOR]: 'school',
      [ParticipantRole.STUDENT]: 'person',
      [ParticipantRole.ASSISTANT]: 'support_agent',
      [ParticipantRole.MODERATOR]: 'admin_panel_settings'
    };
    return iconMap[role] || 'person';
  }

  isClassroomLive(classroom: VirtualClassroom): boolean {
    return classroom.status === ClassroomStatus.LIVE;
  }

  canJoinClassroom(classroom: VirtualClassroom): boolean {
    const now = new Date();
    const start = new Date(classroom.scheduledStart);
    const end = new Date(classroom.scheduledEnd);
    
    return (
      classroom.status === ClassroomStatus.SCHEDULED ||
      classroom.status === ClassroomStatus.LIVE
    ) && now >= new Date(start.getTime() - 15 * 60 * 1000) && now <= end;
  }

  getParticipantCount(classroom: VirtualClassroom): number {
    return classroom.participants?.length || 0;
  }

  hasFeature(classroom: VirtualClassroom, feature: ClassroomFeature): boolean {
    return classroom.features.includes(feature);
  }
}

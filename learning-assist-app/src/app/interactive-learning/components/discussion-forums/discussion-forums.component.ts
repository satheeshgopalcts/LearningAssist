import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { InteractiveLearningService } from '../../interactive-learning.service';
import {
  DiscussionForum,
  ForumTopic,
  ForumReply,
  ForumCategory,
  TopicStatus
} from '../../../models/interactive-learning.model';

@Component({
  selector: 'app-discussion-forums',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './discussion-forums.component.html',
  styleUrls: ['./discussion-forums.component.scss']
})
export class DiscussionForumsComponent implements OnInit {
  forums$: Observable<DiscussionForum[]>;
  selectedForum: DiscussionForum | null = null;
  selectedTopic: ForumTopic | null = null;
  viewMode: 'forums' | 'forum-topics' | 'topic-detail' = 'forums';
  
  // Form models
  newForumTitle = '';
  newForumDescription = '';
  newForumCategory = ForumCategory.GENERAL_DISCUSSION;
  
  newTopicTitle = '';
  newTopicContent = '';
  newTopicTags = '';
  
  newReplyContent = '';
  replyToId: string | null = null;
  
  // Search and filter
  searchQuery = '';
  selectedCategory: ForumCategory | 'all' = 'all';
  
  // Categories for dropdown
  forumCategories = Object.values(ForumCategory);
  
  constructor(
    private interactiveLearningService: InteractiveLearningService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.forums$ = this.interactiveLearningService.getForums();
  }

  ngOnInit(): void {
    // Initialize component
  }

  // Navigation methods
  selectForum(forum: DiscussionForum): void {
    this.selectedForum = forum;
    this.viewMode = 'forum-topics';
  }

  selectTopic(topic: ForumTopic): void {
    this.selectedTopic = topic;
    this.viewMode = 'topic-detail';
    // Increment view count (in real app, this would be handled by the service)
    topic.views++;
  }

  goBack(): void {
    if (this.viewMode === 'topic-detail') {
      this.viewMode = 'forum-topics';
      this.selectedTopic = null;
    } else if (this.viewMode === 'forum-topics') {
      this.viewMode = 'forums';
      this.selectedForum = null;
    }
  }

  // Forum management
  createForum(): void {
    if (!this.newForumTitle.trim() || !this.newForumDescription.trim()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const forumData = {
      title: this.newForumTitle,
      description: this.newForumDescription,
      category: this.newForumCategory
    };

    this.interactiveLearningService.createForum(forumData).subscribe({
      next: (forum) => {
        this.snackBar.open('Forum created successfully!', 'Close', { duration: 3000 });
        this.resetForumForm();
      },
      error: (error) => {
        this.snackBar.open('Error creating forum. Please try again.', 'Close', { duration: 3000 });
        console.error('Error creating forum:', error);
      }
    });
  }

  resetForumForm(): void {
    this.newForumTitle = '';
    this.newForumDescription = '';
    this.newForumCategory = ForumCategory.GENERAL_DISCUSSION;
  }

  // Topic management
  createTopic(): void {
    if (!this.selectedForum || !this.newTopicTitle.trim() || !this.newTopicContent.trim()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const topicData = {
      title: this.newTopicTitle,
      content: this.newTopicContent,
      tags: this.newTopicTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    this.interactiveLearningService.createTopic(this.selectedForum.id, topicData).subscribe({
      next: (topic) => {
        this.snackBar.open('Topic created successfully!', 'Close', { duration: 3000 });
        this.resetTopicForm();
        // Refresh forum data
        this.selectedForum!.topics.push(topic);
      },
      error: (error) => {
        this.snackBar.open('Error creating topic. Please try again.', 'Close', { duration: 3000 });
        console.error('Error creating topic:', error);
      }
    });
  }

  resetTopicForm(): void {
    this.newTopicTitle = '';
    this.newTopicContent = '';
    this.newTopicTags = '';
  }

  // Reply management
  createReply(topicId: string, parentReplyId?: string): void {
    if (!this.newReplyContent.trim()) {
      this.snackBar.open('Please enter your reply', 'Close', { duration: 3000 });
      return;
    }

    const replyData = {
      content: this.newReplyContent,
      parentReplyId: parentReplyId
    };

    this.interactiveLearningService.replyToTopic(topicId, replyData).subscribe({
      next: (reply) => {
        this.snackBar.open('Reply posted successfully!', 'Close', { duration: 3000 });
        this.newReplyContent = '';
        this.replyToId = null;
        // Refresh topic data
        if (this.selectedTopic && this.selectedTopic.id === topicId) {
          this.selectedTopic.replies.push(reply);
        }
      },
      error: (error) => {
        this.snackBar.open('Error posting reply. Please try again.', 'Close', { duration: 3000 });
        console.error('Error creating reply:', error);
      }
    });
  }

  startReply(replyId?: string): void {
    this.replyToId = replyId || null;
  }

  cancelReply(): void {
    this.replyToId = null;
    this.newReplyContent = '';
  }

  // Voting methods
  upvoteTopic(topic: ForumTopic): void {
    topic.upvotes++;
    this.snackBar.open('Upvote recorded!', 'Close', { duration: 2000 });
  }

  downvoteTopic(topic: ForumTopic): void {
    topic.downvotes++;
    this.snackBar.open('Downvote recorded!', 'Close', { duration: 2000 });
  }

  upvoteReply(reply: ForumReply): void {
    reply.upvotes++;
    this.snackBar.open('Upvote recorded!', 'Close', { duration: 2000 });
  }

  downvoteReply(reply: ForumReply): void {
    reply.downvotes++;
    this.snackBar.open('Downvote recorded!', 'Close', { duration: 2000 });
  }

  // Mark as best answer
  markBestAnswer(reply: ForumReply): void {
    if (this.selectedTopic) {
      // Unmark previous best answer
      this.selectedTopic.replies.forEach(r => r.isBestAnswer = false);
      // Mark new best answer
      reply.isBestAnswer = true;
      this.selectedTopic.status = TopicStatus.ANSWERED;
      this.snackBar.open('Best answer marked!', 'Close', { duration: 3000 });
    }
  }

  // Utility methods
  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }

  getCategoryIcon(category: ForumCategory): string {
    const iconMap = {
      [ForumCategory.COURSE_SPECIFIC]: 'school',
      [ForumCategory.GENERAL_DISCUSSION]: 'forum',
      [ForumCategory.TECHNICAL_HELP]: 'build',
      [ForumCategory.CAREER_ADVICE]: 'work',
      [ForumCategory.STUDY_GROUPS]: 'groups',
      [ForumCategory.ANNOUNCEMENTS]: 'campaign'
    };
    return iconMap[category] || 'forum';
  }

  getCategoryColor(category: ForumCategory): string {
    const colorMap = {
      [ForumCategory.COURSE_SPECIFIC]: 'primary',
      [ForumCategory.GENERAL_DISCUSSION]: 'accent',
      [ForumCategory.TECHNICAL_HELP]: 'warn',
      [ForumCategory.CAREER_ADVICE]: 'primary',
      [ForumCategory.STUDY_GROUPS]: 'accent',
      [ForumCategory.ANNOUNCEMENTS]: 'warn'
    };
    return colorMap[category] || 'primary';
  }

  getTopicStatusIcon(status: TopicStatus): string {
    const iconMap = {
      [TopicStatus.OPEN]: 'help_outline',
      [TopicStatus.ANSWERED]: 'check_circle',
      [TopicStatus.CLOSED]: 'lock',
      [TopicStatus.PINNED]: 'push_pin',
      [TopicStatus.LOCKED]: 'lock'
    };
    return iconMap[status] || 'help_outline';
  }

  getTopicStatusColor(status: TopicStatus): string {
    const colorMap = {
      [TopicStatus.OPEN]: 'primary',
      [TopicStatus.ANSWERED]: 'accent',
      [TopicStatus.CLOSED]: 'warn',
      [TopicStatus.PINNED]: 'primary',
      [TopicStatus.LOCKED]: 'warn'
    };
    return colorMap[status] || 'primary';
  }

  // Filter and search methods
  getFilteredForums(): Observable<DiscussionForum[]> {
    // This would typically be handled by the service with proper filtering
    return this.forums$;
  }

  getFilteredTopics(): ForumTopic[] {
    if (!this.selectedForum) return [];
    
    let topics = this.selectedForum.topics;
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      topics = topics.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return topics.sort((a, b) => {
      // Sort by pinned first, then by last activity
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime();
    });
  }

  getRepliesForDisplay(): ForumReply[] {
    if (!this.selectedTopic) return [];
    
    return this.selectedTopic.replies.sort((a, b) => {
      // Sort by best answer first, then by votes, then by date
      if (a.isBestAnswer && !b.isBestAnswer) return -1;
      if (!a.isBestAnswer && b.isBestAnswer) return 1;
      
      const aScore = a.upvotes - a.downvotes;
      const bScore = b.upvotes - b.downvotes;
      if (aScore !== bScore) return bScore - aScore;
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  trackByForumId(index: number, forum: DiscussionForum): string {
    return forum.id;
  }

  trackByTopicId(index: number, topic: ForumTopic): string {
    return topic.id;
  }

  trackByReplyId(index: number, reply: ForumReply): string {
    return reply.id;
  }

  getFirstThreeTags(tags: string[]): string[] {
    return tags.slice(0, 3);
  }

  getRemainingTagsCount(tags: string[]): number {
    return Math.max(0, tags.length - 3);
  }
}

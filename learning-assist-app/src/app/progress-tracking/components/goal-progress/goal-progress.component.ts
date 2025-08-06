import { Component, Input } from '@angular/core';
import { LearningGoal } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-goal-progress',
  templateUrl: './goal-progress.component.html',
  styleUrls: ['./goal-progress.component.scss']
})
export class GoalProgressComponent {
  @Input() goal!: LearningGoal;

  getProgressPercentage(): number {
    return Math.min(Math.round((this.goal.currentValue / this.goal.targetValue) * 100), 100);
  }

  getDaysRemaining(): number {
    const today = new Date();
    const deadline = new Date(this.goal.deadline);
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 50) return '#f39c12';
    return '#e74c3c';
  }
}

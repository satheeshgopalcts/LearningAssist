import { Component, Input } from '@angular/core';
import { Badge } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-badge-display',
  templateUrl: './badge-display.component.html',
  styleUrls: ['./badge-display.component.scss']
})
export class BadgeDisplayComponent {
  @Input() badge!: Badge;

  getBadgeLevelColor(level: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
    const colors = {
      'bronze': '#cd7f32',
      'silver': '#c0c0c0',
      'gold': '#ffd700',
      'platinum': '#e5e4e2'
    };
    return colors[level];
  }

  getBadgeLevelGradient(level: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
    const gradients = {
      'bronze': 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
      'silver': 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
      'gold': 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
      'platinum': 'linear-gradient(135deg, #e5e4e2 0%, #d3d3d3 100%)'
    };
    return gradients[level];
  }
}

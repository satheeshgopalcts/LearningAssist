import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdaptiveSettings, LearningStyleType, DifficultyProgression, AdaptationFrequency } from '../../../models/adaptive-learning.model';

@Component({
  selector: 'app-adaptive-settings',
  templateUrl: './adaptive-settings.component.html',
  styleUrls: ['./adaptive-settings.component.scss']
})
export class AdaptiveSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  
  learningStyles = Object.values(LearningStyleType);
  difficultyProgressions = Object.values(DifficultyProgression);
  adaptationFrequencies = Object.values(AdaptationFrequency);

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      learningStyle: [LearningStyleType.VISUAL],
      difficultyProgression: [DifficultyProgression.ADAPTIVE],
      adaptationFrequency: [AdaptationFrequency.REAL_TIME],
      interventionThreshold: [0.7],
      personalizedRecommendations: [true],
      realTimeAdjustments: [true]
    });
  }

  ngOnInit(): void {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings from service
    // This would typically come from the backend
  }

  onSaveSettings(): void {
    if (this.settingsForm.valid) {
      const settings: AdaptiveSettings = this.settingsForm.value;
      console.log('Saving settings:', settings);
      // Save to service/backend
    }
  }

  onResetToDefaults(): void {
    this.settingsForm.reset({
      learningStyle: LearningStyleType.VISUAL,
      difficultyProgression: DifficultyProgression.ADAPTIVE,
      adaptationFrequency: AdaptationFrequency.REAL_TIME,
      interventionThreshold: 0.7,
      personalizedRecommendations: true,
      realTimeAdjustments: true
    });
  }
}

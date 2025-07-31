import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningStyleQuizComponent } from './learning-style-quiz.component';

describe('LearningStyleQuizComponent', () => {
  let component: LearningStyleQuizComponent;
  let fixture: ComponentFixture<LearningStyleQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningStyleQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningStyleQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

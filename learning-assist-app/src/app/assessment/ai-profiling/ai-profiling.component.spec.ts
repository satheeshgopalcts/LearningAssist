import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiProfilingComponent } from './ai-profiling.component';

describe('AiProfilingComponent', () => {
  let component: AiProfilingComponent;
  let fixture: ComponentFixture<AiProfilingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiProfilingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiProfilingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

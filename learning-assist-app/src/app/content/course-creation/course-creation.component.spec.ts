import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCreationComponent } from './course-creation.component';

describe('CourseCreationComponent', () => {
  let component: CourseCreationComponent;
  let fixture: ComponentFixture<CourseCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

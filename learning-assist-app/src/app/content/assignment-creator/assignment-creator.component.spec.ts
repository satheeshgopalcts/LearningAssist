import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentCreatorComponent } from './assignment-creator.component';

describe('AssignmentCreatorComponent', () => {
  let component: AssignmentCreatorComponent;
  let fixture: ComponentFixture<AssignmentCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

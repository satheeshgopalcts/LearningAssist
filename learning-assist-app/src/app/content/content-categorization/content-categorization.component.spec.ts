import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCategorizationComponent } from './content-categorization.component';

describe('ContentCategorizationComponent', () => {
  let component: ContentCategorizationComponent;
  let fixture: ComponentFixture<ContentCategorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCategorizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentCategorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

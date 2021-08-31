import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripTemplateComponent } from './trip-template.component';

describe('TripTemplateComponent', () => {
  let component: TripTemplateComponent;
  let fixture: ComponentFixture<TripTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

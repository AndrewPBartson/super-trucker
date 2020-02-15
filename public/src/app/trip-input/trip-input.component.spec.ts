import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripInputComponent } from './trip-input.component';

describe('TripInputComponent', () => {
  let component: TripInputComponent;
  let fixture: ComponentFixture<TripInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

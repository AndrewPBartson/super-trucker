import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAreaComponent } from './ui-area.component';

describe('UiAreaComponent', () => {
  let component: UiAreaComponent;
  let fixture: ComponentFixture<UiAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UiAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

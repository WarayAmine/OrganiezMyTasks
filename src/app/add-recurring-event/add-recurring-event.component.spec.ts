import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecurringEventComponent } from './add-recurring-event.component';

describe('AddRecurringEventComponent', () => {
  let component: AddRecurringEventComponent;
  let fixture: ComponentFixture<AddRecurringEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRecurringEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecurringEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

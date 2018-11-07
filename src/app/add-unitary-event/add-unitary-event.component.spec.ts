import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUnitaryEventComponent } from './add-unitary-event.component';

describe('AddUnitaryEventComponent', () => {
  let component: AddUnitaryEventComponent;
  let fixture: ComponentFixture<AddUnitaryEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUnitaryEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUnitaryEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

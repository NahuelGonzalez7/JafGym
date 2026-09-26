import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from '../toast/toast';
import { ToastService } from '../../../core/services/toast.service';
import { signal } from '@angular/core';

const toastServiceMock = {
  toasts: signal([]),
  remove: jest.fn()
};

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
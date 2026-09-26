import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentFormComponent } from './payment-form';
import { PaymentsService } from '../payments.service';
import { MembershipsService } from '../membership-manager/memberships.service';
import { StudentsService } from '../../students/students.service';

const paymentsServiceMock = {
  create: jest.fn().mockResolvedValue({})
};

const membershipsServiceMock = {
  getAll: jest.fn().mockResolvedValue([
    { id: '1', name: 'Mensual', price: 10000, duration_days: 30 }
  ])
};

const studentsServiceMock = {
  getAll: jest.fn().mockResolvedValue([
    { id: '1', first_name: 'Juan', last_name: 'García', dni: '12345678' }
  ])
};

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent],
      providers: [
        { provide: PaymentsService, useValue: paymentsServiceMock },
        { provide: MembershipsService, useValue: membershipsServiceMock },
        { provide: StudentsService, useValue: studentsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail validation without student', () => {
    component.selectedStudent = null;
    component.selectedMembership = { id: '1', name: 'Mensual', price: 10000, duration_days: 30, active: true };
    component.form.amount = 10000;
    expect(component.validate()).toBe(false);
    expect(component.errors['student']).toBeTruthy();
  });

  it('should fail validation without membership', () => {
    component.selectedStudent = { id: '1' } as any;
    component.selectedMembership = null;
    component.form.amount = 10000;
    expect(component.validate()).toBe(false);
    expect(component.errors['membership']).toBeTruthy();
  });

  it('should fail validation with amount 0', () => {
    component.selectedStudent = { id: '1' } as any;
    component.selectedMembership = { id: '1', name: 'Mensual', price: 10000, duration_days: 30, active: true };
    component.form.amount = 0;
    expect(component.validate()).toBe(false);
    expect(component.errors['amount']).toBeTruthy();
  });

  it('should calculate valid until correctly', () => {
    component.selectedMembership = { id: '1', name: 'Mensual', price: 10000, duration_days: 30, active: true };
    component.form.valid_from = '2025-01-01';
    const result = component.getValidUntil();
    expect(result).toContain('2025');
  });

  it('should filter students by name', () => {
    component.students = [
      { id: '1', first_name: 'Juan', last_name: 'García', dni: '12345678' } as any,
      { id: '2', first_name: 'María', last_name: 'López', dni: '87654321' } as any
    ];
    component.studentSearch = 'juan';
    component.searchStudents();
    expect(component.filteredStudents).toHaveLength(1);
  });
});
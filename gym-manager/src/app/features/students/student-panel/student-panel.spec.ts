import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentPanelComponent } from './student-panel';
import { StudentsService } from '../students.service';
import { ToastService } from '../../../core/services/toast.service';

const studentsServiceMock = {
  create: jest.fn().mockResolvedValue({ id: 'new-id' }),
  update: jest.fn().mockResolvedValue(undefined),
  deactivate: jest.fn().mockResolvedValue(undefined),
  reactivate: jest.fn().mockResolvedValue(undefined),
  uploadPhoto: jest.fn().mockResolvedValue('http://photo-url'),
};

const mockStudent = {
  id: 'student-1',
  first_name: 'Juan',
  last_name: 'García',
  dni: '12345678',
  phone: '1112345678',
  email: 'juan@email.com',
  birth_date: '1995-01-01',
  photo_url: null,
  active: true,
  quota_status: 'ok',
  valid_until: '2099-12-31'
};

describe('StudentPanelComponent', () => {
  let component: StudentPanelComponent;
  let fixture: ComponentFixture<StudentPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPanelComponent],
      providers: [
        { provide: StudentsService, ToastService, useValue: studentsServiceMock },
        {
          provide: ToastService,
          useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail validation with empty first name', () => {
    component.form.first_name = '';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    const result = component.validate();
    expect(result).toBe(false);
    expect(component.errors['first_name']).toBeTruthy();
  });

  it('should fail validation with invalid DNI', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '1234';
    const result = component.validate();
    expect(result).toBe(false);
    expect(component.errors['dni']).toBeTruthy();
  });

  it('should fail validation with email without @', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    component.form.email = 'invalidemail.com';
    const result = component.validate();
    expect(result).toBe(false);
    expect(component.errors['email']).toBeTruthy();
  });

  it('should pass validation with valid data', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    component.form.email = 'juan@email.com';
    component.form.phone = '1112345678';
    const result = component.validate();
    expect(result).toBe(true);
  });

  it('should fail validation with phone longer than 10 digits', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    component.form.phone = '12345678901';
    const result = component.validate();
    expect(result).toBe(false);
    expect(component.errors['phone']).toBeTruthy();
  });

  it('should pass with empty birth_date', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    component.form.birth_date = '';
    expect(component.validate()).toBe(true);
  });

  it('should fail with invalid birth_date', () => {
    component.form.first_name = 'Juan';
    component.form.last_name = 'García';
    component.form.dni = '12345678';
    component.form.birth_date = 'fecha-invalida';
    expect(component.validate()).toBe(false);
    expect(component.errors['birth_date']).toBeTruthy();
  });

  it('should reactivate student', async () => {
    component.student = { ...mockStudent, active: false } as any;
    await component.reactivate();
    expect(studentsServiceMock.reactivate).toHaveBeenCalledWith(mockStudent.id);
  });
});

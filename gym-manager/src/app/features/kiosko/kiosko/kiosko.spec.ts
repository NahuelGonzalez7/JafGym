import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KioskoComponent } from './kiosko';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LicenseService } from '../../../core/services/license.service';
import { AttendanceService } from '../../attendance/attendance.service';

const mockStudent = {
  id: 'student-1',
  first_name: 'Juan',
  last_name: 'García',
  photo_url: null,
  active: true,
  payments: [{ valid_until: '2099-12-31' }]
};

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockStudent, error: null })
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123'),
  validateLicense: jest.fn().mockResolvedValue(true), 
  getStoredToken: jest.fn().mockReturnValue('GYM-TOKEN')
};

const attendanceMock = {
  registerAttendance: jest.fn().mockResolvedValue(undefined)
};

describe('KioskoComponent', () => {
  let component: KioskoComponent;
  let fixture: ComponentFixture<KioskoComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [KioskoComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock },
        { provide: AttendanceService, useValue: attendanceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KioskoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in idle state', () => {
    expect(component.state).toBe('idle');
  });

  it('should not search with empty DNI', async () => {
    component.dni = '';
    await component.search();
    expect(supabaseMock.client.from).not.toHaveBeenCalled();
  });

  it('should not search with DNI less than 8 digits', async () => {
    component.dni = '1234';
    await component.search();
    expect(supabaseMock.client.from).not.toHaveBeenCalled();
  });

  it('should set state to success on valid student with active quota', async () => {
    component.dni = '12345678';
    await component.search();
    expect(component.state).toBe('success');
    expect(component.student?.first_name).toBe('Juan');
  });

  it('should set state to notfound when student does not exist', async () => {
    supabaseMock.client.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
    });
    component.dni = '99999999';
    await component.search();
    expect(component.state).toBe('notfound');
  });

  it('should set state to expired when quota is expired', async () => {
    supabaseMock.client.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { ...mockStudent, payments: [{ valid_until: '2020-01-01' }] },
        error: null
      })
    });
    component.dni = '12345678';
    await component.search();
    expect(component.state).toBe('expired');
  });

  it('should register attendance on successful search', async () => {
    component.dni = '12345678';
    await component.search();
    expect(attendanceMock.registerAttendance).toHaveBeenCalledWith('student-1');
  });

  it('should reset state correctly', () => {
    component.state = 'success';
    component.student = { id: '1' } as any;
    component.dni = '12345678';
    component.reset();
    expect(component.state).toBe('idle');
    expect(component.student).toBeNull();
    expect(component.dni).toBe('');
  });

  it('should strip dots from DNI before searching', async () => {
    component.dni = '12.345.678';
    await component.search();
    expect(component.state).toBe('success');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2025-12-31');
    expect(result).toContain('2025');
  });
});
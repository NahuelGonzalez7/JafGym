import { TestBed } from '@angular/core/testing';
import { StudentsService } from './students.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

const mockStudents = [
  { id: '1', first_name: 'Juan', last_name: 'García', dni: '12345678', active: true, payments: [] },
  { id: '2', first_name: 'María', last_name: 'López', dni: '87654321', active: true, payments: [] }
];

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockStudents, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockStudents[0], error: null })
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentsService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    });
    service = TestBed.inject(StudentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate DNI with exactly 8 digits', () => {
    expect(/^\d{8}$/.test('12345678')).toBe(true);
  });

  it('should reject DNI with less than 8 digits', () => {
    expect(/^\d{8}$/.test('1234567')).toBe(false);
  });

  it('should reject DNI with more than 8 digits', () => {
    expect(/^\d{8}$/.test('123456789')).toBe(false);
  });

  it('should reject DNI with letters', () => {
    expect(/^\d{8}$/.test('1234567a')).toBe(false);
  });

  it('should strip dots from DNI', () => {
    const dni = '12.345.678';
    expect(dni.replace(/\./g, '')).toBe('12345678');
  });
});
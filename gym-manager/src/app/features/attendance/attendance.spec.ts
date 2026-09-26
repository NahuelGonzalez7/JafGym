import { TestBed } from '@angular/core/testing';
import { AttendanceService } from './attendance.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

const mockAttendances = [
  {
    id: '1',
    student_id: 'student-1',
    attended_at: new Date().toISOString(),
    students: { first_name: 'Juan', last_name: 'García', dni: '12345678', photo_url: null }
  }
];

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockAttendances, error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      count: 0
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    });
    service = TestBed.inject(AttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get attendances by date', async () => {
    const result = await service.getByDate('2025-01-01');
    expect(result).toHaveLength(1);
    expect(result[0].students?.first_name).toBe('Juan');
  });

  it('should get attendances by date range', async () => {
    const result = await service.getByDateRange('2025-01-01', '2025-01-31');
    expect(result).toHaveLength(1);
  });
});
import { TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

const mockAttendances = [
  { student_id: '1' },
  { student_id: '2' },
  { student_id: '1' } // duplicado para testear unique
];

const mockStudents = [
  { id: '1', created_at: new Date().toISOString(), active: true },
  { id: '2', created_at: new Date().toISOString(), active: true }
];

const mockPayments = [
  { student_id: '1', valid_until: '2020-01-01', amount: 10000, memberships: { name: 'Mensual' } },
  { student_id: '2', valid_until: '2099-12-31', amount: 25000, memberships: { name: 'Trimestral' } }
];

const supabaseMock = {
  client: {
    from: jest.fn().mockImplementation((table: string) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: table === 'attendances' ? mockAttendances
            : table === 'students'   ? mockStudents
            : mockPayments,
        error: null
      })
    }))
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatsService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    });
    service = TestBed.inject(StatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct range for today', () => {
    const today = new Date().toISOString().split('T')[0];
    const range = service.getDateRange('today');
    expect(range.from).toBe(today);
    expect(range.to).toBe(today);
  });

  it('should return 7 days ago for week', () => {
    const expected = new Date();
    expected.setDate(expected.getDate() - 7);
    const range = service.getDateRange('week');
    expect(range.from).toBe(expected.toISOString().split('T')[0]);
  });

  it('should return 30 days ago for month', () => {
    const expected = new Date();
    expected.setDate(expected.getDate() - 30);
    const range = service.getDateRange('month');
    expect(range.from).toBe(expected.toISOString().split('T')[0]);
  });
});
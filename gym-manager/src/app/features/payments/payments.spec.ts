import { TestBed } from '@angular/core/testing';
import { PaymentsService } from './payments.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null })
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentsService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    });
    service = TestBed.inject(PaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate valid_until adding duration days', () => {
    const from = new Date('2025-01-01');
    const duration = 30;
    const result = new Date(from);
    result.setDate(result.getDate() + duration);
    expect(result.toISOString().split('T')[0]).toBe('2025-01-31');
  });

  it('should calculate valid_until for 90 days', () => {
    const from = new Date('2025-01-01');
    const result = new Date(from);
    result.setDate(result.getDate() + 90);
    expect(result.toISOString().split('T')[0]).toBe('2025-04-01');
  });
});
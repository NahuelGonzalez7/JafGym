import { TestBed } from '@angular/core/testing';
import { MembershipsService } from './membership-manager/memberships.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

const mockMemberships = [
  { id: '1', name: 'Mensual', price: 10000, duration_days: 30, active: true },
  { id: '2', name: 'Trimestral', price: 25000, duration_days: 90, active: true }
];

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockMemberships, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockMemberships[0], error: null })
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('MembershipsService', () => {
  let service: MembershipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MembershipsService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    });
    service = TestBed.inject(MembershipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all memberships', async () => {
    const result = await service.getAll();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Mensual');
  });

  it('should return memberships sorted by price', async () => {
    const result = await service.getAll();
    expect(result[0].price).toBeLessThanOrEqual(result[1].price);
  });
});
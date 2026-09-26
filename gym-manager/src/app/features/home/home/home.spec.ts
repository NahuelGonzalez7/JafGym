import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LicenseService } from '../../../core/services/license.service';

const supabaseMock = {
  client: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      count: 0
    })
  }
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123')
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return Buen día between 6 and 12', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(9);
    expect(component.getGreeting()).toBe('Buen día');
  });

  it('should return Buenas tardes between 13 and 19', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(16);
    expect(component.getGreeting()).toBe('Buenas tardes');
  });

  it('should return Buenas noches from 20 onwards', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(22);
    expect(component.getGreeting()).toBe('Buenas noches');
  });
});
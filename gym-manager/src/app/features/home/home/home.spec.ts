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
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      count: 0,
    }),
  },
};

const licenseMock = {
  getTenantId: jest.fn().mockReturnValue('tenant-123'),
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: LicenseService, useValue: licenseMock },
      ],
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

  it('should return correct birthday label for today', () => {
    expect(component.birthdayLabel(0)).toBe('🎂 Hoy');
  });

  it('should return correct birthday label for tomorrow', () => {
    expect(component.birthdayLabel(1)).toBe('Mañana');
  });

  it('should return correct birthday label for future days', () => {
    expect(component.birthdayLabel(5)).toBe('En 5 días');
  });

  it('should format amount correctly', () => {
    const result = component.formatAmount(15000);
    expect(result).toContain('15');
  });

  it('should initialize stats with zeros', () => {
    expect(component.stats.totalToday).toBe(0);
    expect(component.stats.activeStudents).toBe(0);
    expect(component.stats.upToDateStudents).toBe(0);
    expect(component.stats.todayPayments).toBe(0);
    expect(component.stats.todayIncome).toBe(0);
  });

  it('should initialize empty birthdays', () => {
    expect(component.upcomingBirthdays).toEqual([]);
  });
});

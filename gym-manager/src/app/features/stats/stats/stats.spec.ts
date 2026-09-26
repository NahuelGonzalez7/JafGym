import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from './stats';
import { StatsService } from '../stats.service';
import { AttendanceService } from '../../attendance/attendance.service';

const statsServiceMock = {
  getDateRange: jest.fn().mockReturnValue({
    from: '2025-01-01',
    to: '2025-01-31',
  }),
  getSummary: jest.fn().mockResolvedValue({
    totalAttendances: 42,
    uniqueStudents: 15,
    newStudents: 3,
    expiredQuotas: 2,
    expiringQuotas: 1,
  }),
  getAttendances: jest.fn().mockResolvedValue([]),
  getStudentStats: jest.fn().mockResolvedValue({
    all: [],
    newStudents: [],
    inactive: [],
  }),
  getFinanceSummary: jest.fn().mockResolvedValue({
    payments: [],
    totalIncome: 0,
    byMembership: {},
  }),
};

const attendanceServiceMock = {
  getByDate: jest.fn().mockResolvedValue([]),
  getByDateRange: jest.fn().mockResolvedValue([]),
};

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [
        { provide: StatsService, useValue: statsServiceMock },
        { provide: AttendanceService, useValue: attendanceServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to summary tab', () => {
    expect(component.activeTab).toBe('summary');
  });

  it('should default to today period', () => {
    expect(component.period).toBe('today');
  });

  it('should return "hoy" for today period', () => {
    component.period = 'today';
    expect(component.periodLabel()).toBe('hoy');
  });

  it('should return "los últimos 7 días" for week period', () => {
    component.period = 'week';
    expect(component.periodLabel()).toBe('los últimos 7 días');
  });

  it('should return "los últimos 30 días" for month period', () => {
    component.period = 'month';
    expect(component.periodLabel()).toBe('los últimos 30 días');
  });

  it('should load summary on tab change to summary', async () => {
    await component.onTabChange('summary');
    expect(statsServiceMock.getSummary).toHaveBeenCalled();
    expect(component.summary).toBeTruthy();
    expect(component.summary?.totalAttendances).toBe(42);
  });

  it('should load attendances on tab change to attendance', async () => {
    await component.onTabChange('attendance');
    expect(statsServiceMock.getAttendances).toHaveBeenCalled();
  });

  it('should load student stats on tab change to students', async () => {
    await component.onTabChange('students');
    expect(statsServiceMock.getStudentStats).toHaveBeenCalled();
  });

  it('should load finance stats on tab change to finance', async () => {
    await component.onTabChange('finance');
    expect(statsServiceMock.getFinanceSummary).toHaveBeenCalled();
  });

  it('should not apply custom range without both dates', async () => {
    jest.clearAllMocks();
    component.customFrom = '';
    component.customTo = '';
    await component.applyCustomRange();
    expect(statsServiceMock.getSummary).not.toHaveBeenCalled();
  });

  it('should apply custom range with both dates', async () => {
    component.period = 'custom';
    component.customFrom = '2025-01-01';
    component.customTo = '2025-01-31';
    await component.applyCustomRange();
    expect(statsServiceMock.getSummary).toHaveBeenCalled();
  });

  it('should format amount correctly', () => {
    const result = component.formatAmount(10000);
    expect(result).toContain('10');
  });

  it('should return object keys', () => {
    const obj = { Mensual: 1, Trimestral: 2 };
    expect(component.getKeys(obj)).toEqual(['Mensual', 'Trimestral']);
  });

  it('should return empty array for null object', () => {
    expect(component.getKeys(null)).toEqual([]);
  });
});

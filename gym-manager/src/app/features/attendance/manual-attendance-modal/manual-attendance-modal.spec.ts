import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualAttendanceModalComponent } from '../manual-attendance-modal/manual-attendance-modal';
import { StudentsService } from '../../students/students.service';
import { AttendanceService } from '../attendance.service';

const mockStudents = [
  { id: '1', first_name: 'Juan', last_name: 'García', dni: '12345678', quota_status: 'ok', photo_url: null },
  { id: '2', first_name: 'María', last_name: 'López', dni: '87654321', quota_status: 'expired', photo_url: null }
];

const studentsServiceMock = {
  getAll: jest.fn().mockResolvedValue(mockStudents)
};

const attendanceServiceMock = {
  registerAttendance: jest.fn().mockResolvedValue(undefined),
  alreadyCheckedInToday: jest.fn().mockResolvedValue(false)
};

describe('ManualAttendanceModalComponent', () => {
  let component: ManualAttendanceModalComponent;
  let fixture: ComponentFixture<ManualAttendanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualAttendanceModalComponent],
      providers: [
        { provide: StudentsService, useValue: studentsServiceMock },
        { provide: AttendanceService, useValue: attendanceServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualAttendanceModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', async () => {
    await component.ngOnInit();
    expect(component.students).toHaveLength(2);
  });

  it('should filter students by name', async () => {
    await component.ngOnInit();
    component.search = 'juan';
    component.searchStudents();
    expect(component.filtered).toHaveLength(1);
    expect(component.filtered[0].first_name).toBe('Juan');
  });

  it('should filter students by DNI', async () => {
    await component.ngOnInit();
    component.search = '87654321';
    component.searchStudents();
    expect(component.filtered).toHaveLength(1);
    expect(component.filtered[0].last_name).toBe('López');
  });

  it('should clear filtered on empty search', async () => {
    await component.ngOnInit();
    component.search = '';
    component.searchStudents();
    expect(component.filtered).toHaveLength(0);
  });

  it('should select student and check if already in', async () => {
    await component.ngOnInit();
    await component.selectStudent(mockStudents[0] as any);
    expect(component.selected).toBe(mockStudents[0]);
    expect(attendanceServiceMock.alreadyCheckedInToday).toHaveBeenCalledWith('1');
  });

  it('should not register without selected student', async () => {
    component.selected = null;
    await component.register();
    expect(attendanceServiceMock.registerAttendance).not.toHaveBeenCalled();
  });

  it('should register attendance and show success', async () => {
    jest.useFakeTimers();
    component.selected = mockStudents[0] as any;
    await component.register();
    expect(attendanceServiceMock.registerAttendance).toHaveBeenCalledWith('1');
    expect(component.success).toBe(true);
    jest.useRealTimers();
  });

  it('should return correct quota label for ok', () => {
    component.selected = { ...mockStudents[0], quota_status: 'ok' } as any;
    expect(component.getQuotaLabel()).toContain('al día');
  });

  it('should return correct quota label for expired', () => {
    component.selected = { ...mockStudents[0], quota_status: 'expired' } as any;
    expect(component.getQuotaLabel()).toContain('vencida');
  });

  it('should return correct quota class for warning', () => {
    component.selected = { ...mockStudents[0], quota_status: 'warning' } as any;
    expect(component.getQuotaClass()).toBe('quota--warning');
  });
});
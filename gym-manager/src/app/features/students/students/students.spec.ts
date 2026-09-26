import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsComponent } from './students';
import { StudentsService } from '../students.service';

const studentsServiceMock = {
  getAll: jest.fn().mockResolvedValue([
    { id: '1', first_name: 'Juan', last_name: 'García', dni: '12345678', quota_status: 'ok' },
    { id: '2', first_name: 'María', last_name: 'López', dni: '87654321', quota_status: 'expired' }
  ])
};

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        { provide: StudentsService, useValue: studentsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
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
    component.applyFilter();
    expect(component.filtered).toHaveLength(1);
    expect(component.filtered[0].first_name).toBe('Juan');
  });

  it('should filter students by DNI', async () => {
    await component.ngOnInit();
    component.search = '87654321';
    component.applyFilter();
    expect(component.filtered).toHaveLength(1);
    expect(component.filtered[0].last_name).toBe('López');
  });

  it('should return empty array when no match', async () => {
    await component.ngOnInit();
    component.search = 'zzz';
    component.applyFilter();
    expect(component.filtered).toHaveLength(0);
  });

  it('should return correct status icon', () => {
    expect(component.statusIcon('ok')).toBe('●');
    expect(component.statusIcon('warning')).toBe('⚠');
    expect(component.statusIcon('expired')).toBe('✕');
    expect(component.statusIcon('none')).toBe('○');
  });

  it('should select student and hide form', () => {
    const student = { id: '1' } as any;
    component.select(student);
    expect(component.selected).toBe(student);
    expect(component.showForm).toBe(false);
  });
});
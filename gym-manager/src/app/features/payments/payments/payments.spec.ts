import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments';
import { PaymentsService } from '../payments.service';

const paymentsServiceMock = {
  getRecent: jest.fn().mockResolvedValue([
    {
      id: '1',
      amount: 10000,
      paid_at: '2025-01-01',
      valid_until: '2025-01-31',
      students: { first_name: 'Juan', last_name: 'García', dni: '12345678' },
      memberships: { name: 'Mensual' }
    }
  ])
};

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [
        { provide: PaymentsService, useValue: paymentsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payments on init', async () => {
    await component.ngOnInit();
    expect(component.payments).toHaveLength(1);
  });

  it('should filter by student name', async () => {
    await component.ngOnInit();
    component.search = 'juan';
    component.applyFilter();
    expect(component.filtered).toHaveLength(1);
  });

  it('should return empty on no match', async () => {
    await component.ngOnInit();
    component.search = 'zzz';
    component.applyFilter();
    expect(component.filtered).toHaveLength(0);
  });

  it('should format amount correctly', () => {
    const formatted = component.formatAmount(10000);
    expect(formatted).toContain('10');
  });

  it('should switch tabs correctly', () => {
    component.activeTab = 'payments';
    expect(component.activeTab).toBe('payments');
    component.activeTab = 'memberships';
    expect(component.activeTab).toBe('memberships');
  });
});
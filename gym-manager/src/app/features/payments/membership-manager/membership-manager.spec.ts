import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembershipManagerComponent } from './membership-manager';
import { MembershipsService } from '../membership-manager/memberships.service';

const membershipsServiceMock = {
  getAll: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({}),
  deactivate: jest.fn().mockResolvedValue(undefined)
};

describe('MembershipManagerComponent', () => {
  let component: MembershipManagerComponent;
  let fixture: ComponentFixture<MembershipManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipManagerComponent],
      providers: [
        { provide: MembershipsService, useValue: membershipsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail validation with empty name', () => {
    component.form.name = '';
    component.form.price = 10000;
    component.form.duration_days = 30;
    expect(component.validate()).toBe(false);
    expect(component.errors['name']).toBeTruthy();
  });

  it('should fail validation with price 0', () => {
    component.form.name = 'Mensual';
    component.form.price = 0;
    component.form.duration_days = 30;
    expect(component.validate()).toBe(false);
    expect(component.errors['price']).toBeTruthy();
  });

  it('should pass validation with valid data', () => {
    component.form.name = 'Mensual';
    component.form.price = 10000;
    component.form.duration_days = 30;
    expect(component.validate()).toBe(true);
  });
});
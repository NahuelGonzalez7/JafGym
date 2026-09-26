import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivateComponent } from './activate';
import { LicenseService } from '../../../core/services/license.service';
import { Router } from '@angular/router';

describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;
  let licenseServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    licenseServiceMock = {
      saveToken: jest.fn(),
      validateLicense: jest.fn().mockResolvedValue(true),
      clearLicense: jest.fn(),
      getStoredToken: jest.fn().mockReturnValue(null),
      getTenantId: jest.fn().mockReturnValue(null)
    };

    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ActivateComponent],
      providers: [
        { provide: LicenseService, useValue: licenseServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not activate with empty token', async () => {
    component.token = '';
    await component.activate();
    expect(licenseServiceMock.saveToken).not.toHaveBeenCalled();
  });

  it('should navigate to home on valid license', async () => {
    component.token = 'GYM-VALID-TOKEN';
    licenseServiceMock.validateLicense.mockResolvedValue(true);
    await component.activate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show error on invalid token', async () => {
    component.token = 'INVALID';
    licenseServiceMock.validateLicense.mockResolvedValue(false);
    await component.activate();
    expect(component.error).toBeTruthy();
    expect(licenseServiceMock.clearLicense).toHaveBeenCalled();
  });

  it('should set loading to false after activation', async () => {
    component.token = 'GYM-TOKEN';
    await component.activate();
    expect(component.loading).toBe(false);
  });
});
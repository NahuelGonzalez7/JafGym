import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { LicenseService } from '../services/license.service';

@Injectable({ providedIn: 'root' })
export class LicenseGuard implements CanActivate {

  constructor(
    private licenseService: LicenseService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    // El kiosko maneja su propia licencia
    if (route.routeConfig?.path === 'kiosko') return true;

    const valid = await this.licenseService.validateLicense();

    if (!valid) {
      this.router.navigate(['/activate']);
      return false;
    }

    return true;
  }
}
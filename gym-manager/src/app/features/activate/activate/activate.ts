import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LicenseService } from '../../../core/services/license.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './activate.html',
  styleUrl: './activate.scss'
})
export class ActivateComponent {
  token = '';
  loading = false;
  error = '';

  constructor(
    private licenseService: LicenseService,
    private router: Router
  ) {}

  async activate() {
    if (!this.token.trim()) return;

    this.loading = true;
    this.error = '';

    this.licenseService.saveToken(this.token.trim());
    const valid = await this.licenseService.validateLicense();

    if (valid) {
      this.router.navigate(['/']); // navegá al home
    } else {
      this.licenseService.clearLicense();
      this.error = 'Token inválido o licencia inactiva. Contactá al soporte.';
    }

    this.loading = false;
  }
}
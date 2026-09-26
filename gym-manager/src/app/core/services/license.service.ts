import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

const LICENSE_KEY = 'gym_license_token';

@Injectable({ providedIn: 'root' })
export class LicenseService {

  private tenantId: string | null = null;

  constructor(private supabase: SupabaseService,
    private router: Router
  ) {}

  // Guarda el token localmente (solo se hace una vez al activar)
  saveToken(token: string): void {
    localStorage.setItem(LICENSE_KEY, token);
  }

  // Lee el token guardado
  getStoredToken(): string | null {
    return localStorage.getItem(LICENSE_KEY);
  }

  // Valida el token contra Supabase
async validateLicense(): Promise<boolean> {
  if (this.tenantId) return true;

  const token = this.getStoredToken();
  if (!token) return false;

  const { data, error } = await this.supabase.client
    .from('tenants')
    .select('id, active, expires_at')
    .eq('token', token.trim()) // trim por si hay espacios
    .maybeSingle(); // usa maybeSingle en vez de single, no tira error si no encuentra nada

  if (!data) return false;
  if (!data.active) return false;

  if (data.expires_at) {
    const expired = new Date(data.expires_at) < new Date();
    if (expired) return false;
  }

  this.tenantId = data.id;
  this.router.navigate(['/']);
  return true;
}

  getTenantId(): string | null {
    return this.tenantId;
  }

  clearLicense(): void {
    localStorage.removeItem(LICENSE_KEY);
    this.tenantId = null;
  }
}
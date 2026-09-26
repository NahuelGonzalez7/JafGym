import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LicenseService } from './license.service';

export interface AppError {
  message: string;
  stack?: string;
  context?: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorLoggerService {

  private appVersion = '1.0.0';

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  async log(error: Error | AppError, context?: string): Promise<void> {
    const payload = {
      tenant_id:     this.licenseService.getTenantId() ?? null,
      error_message: error.message,
      stack_trace:   error instanceof Error ? error.stack ?? null : null,
      context:       context ?? null,
      app_version:   this.appVersion
    };

    // Siempre loggeamos en consola también
    console.error(`[${context ?? 'unknown'}]`, error);

    try {
      await this.supabase.client
        .from('error_logs')
        .insert(payload);
    } catch (e) {
      // Si falla el logging, no rompemos la app
      console.error('Error al guardar en error_logs:', e);
    }
  }
}
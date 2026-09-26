import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LicenseService } from '../../../core/services/license.service';
import { AttendanceService } from '../../attendance/attendance.service';

type KioskoState = 'idle' | 'loading' | 'success' | 'expired' | 'notfound' | 'error';

interface StudentResult {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  valid_until: string | null;
  quota_status: 'ok' | 'warning' | 'expired' | 'none';
  membership_name: string | null;
}

@Component({
  selector: 'app-kiosko',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kiosko.html',
  styleUrl: './kiosko.scss',
})
export class KioskoComponent implements OnInit, OnDestroy {
  dni = '';
  state: KioskoState = 'idle';
  student: StudentResult | null = null;
  private resetTimer: any = null;

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService,
    private attendanceService: AttendanceService,
  ) {}

  ngOnInit() {
    // Validar licencia en esta ventana también
    this.initLicense();
    setTimeout(() => {
      document.getElementById('dni-input')?.focus();
    }, 100);
  }

  private async initLicense() {
    const valid = await this.licenseService.validateLicense();
    if (!valid) {
      this.state = 'error';
    }
  }

  ngOnDestroy() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  async search() {
    const dniClean = this.dni.replace(/\./g, '').trim();
    if (!dniClean || dniClean.length !== 8) return;

    this.state = 'loading';
    this.student = null;

    try {
      // Buscar alumno por DNI
      const { data: studentData, error } = await this.supabase.client
        .from('students')
        .select(
          `
    *,
    payments(
      valid_until,
      memberships(name)
    )
  `,
        )
        .eq('tenant_id', this.licenseService.getTenantId())
        .eq('dni', dniClean)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!studentData) {
        this.state = 'notfound';
        this.scheduleReset(7500);
        return;
      }

      // Calcular estado de cuota
      const payments = studentData.payments ?? [];
      const latest = payments.sort(
        (a: any, b: any) => new Date(b.valid_until).getTime() - new Date(a.valid_until).getTime(),
      )[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let quota_status: StudentResult['quota_status'] = 'none';
      let valid_until = null;

      if (latest) {
        const expiry = new Date(latest.valid_until);
        expiry.setHours(0, 0, 0, 0);
        const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
        valid_until = latest.valid_until;

        if (daysLeft < 0) quota_status = 'expired';
        else if (daysLeft <= 7) quota_status = 'warning';
        else quota_status = 'ok';
      }

      this.student = {
        id: studentData.id,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        photo_url: studentData.photo_url,
        valid_until,
        quota_status,
        membership_name: latest?.memberships?.name ?? null,
      };

      // Registrar asistencia siempre, incluso con cuota vencida
      await this.attendanceService.registerAttendance(studentData.id);

      this.state = quota_status === 'expired' ? 'expired' : 'success';
      this.scheduleReset(7500);
    } catch (e) {
      console.error(e);
      this.state = 'error';
      this.scheduleReset(7500);
    }
  }

  scheduleReset(ms: number) {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.reset(), ms);
  }

  reset() {
    this.dni = '';
    this.state = 'idle';
    this.student = null;
    setTimeout(() => {
      document.getElementById('dni-input')?.focus();
    }, 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LicenseService } from '../../../core/services/license.service';
import { RouterLink } from '@angular/router';
import { ManualAttendanceModalComponent } from '../../attendance/manual-attendance-modal/manual-attendance-modal';

interface DayStats {
  totalToday: number;
  expiringCount: number;
  expiredCount: number;
  activeStudents: number;
  upToDateStudents: number;
}

interface ExpiringStudent {
  id: string;
  first_name: string;
  last_name: string;
  valid_until: string;
  daysLeft: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ManualAttendanceModalComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {

  today = new Date();
  stats: DayStats = { totalToday: 0, expiringCount: 0, expiredCount: 0, activeStudents: 0, upToDateStudents: 0 };
  expiringStudents: ExpiringStudent[] = [];
  loading = true;
  showManualModal = false;

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadTodayStats(),
      this.loadExpiringStudents()
    ]);
    this.loading = false;
  }

async loadTodayStats() {
  const tenantId = this.licenseService.getTenantId();
  const todayStr = new Date().toISOString().split('T')[0];

  const [attendances, students, payments] = await Promise.all([
    this.supabase.client
      .from('attendances')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('attended_at', `${todayStr}T00:00:00`)
      .lte('attended_at', `${todayStr}T23:59:59`),

    this.supabase.client
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('active', true),

    this.supabase.client
      .from('payments')
      .select('student_id, valid_until')
      .eq('tenant_id', tenantId)
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Último pago por alumno
  const latestByStudent = new Map<string, string>();
  for (const p of (payments.data ?? [])) {
    const current = latestByStudent.get(p.student_id);
    if (!current || p.valid_until > current) {
      latestByStudent.set(p.student_id, p.valid_until);
    }
  }

  let upToDate = 0;
  for (const [, validUntil] of latestByStudent) {
    const expiry = new Date(validUntil);
    expiry.setHours(0, 0, 0, 0);
    if (expiry >= today) upToDate++;
  }

  this.stats.totalToday      = attendances.count ?? 0;
  this.stats.activeStudents  = students.count ?? 0;
  this.stats.upToDateStudents = upToDate;
}

  async loadExpiringStudents() {
    const tenantId = this.licenseService.getTenantId();
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    // Vencidos
    const { data: expired } = await this.supabase.client
      .from('payments')
      .select('student_id, valid_until, students(id, first_name, last_name)')
      .eq('tenant_id', tenantId)
      .lt('valid_until', todayStr)
      .order('valid_until', { ascending: false });

    // Por vencer en 7 días
    const { data: expiring } = await this.supabase.client
      .from('payments')
      .select('student_id, valid_until, students(id, first_name, last_name)')
      .eq('tenant_id', tenantId)
      .gte('valid_until', todayStr)
      .lte('valid_until', in7DaysStr)
      .order('valid_until', { ascending: true });

    const mapStudent = (item: any, daysLeft: number): ExpiringStudent => ({
      id: item.students.id,
      first_name: item.students.first_name,
      last_name: item.students.last_name,
      valid_until: item.valid_until,
      daysLeft
    });

    const expiredMapped = (expired ?? []).map(item => {
      const diff = Math.floor((new Date(item.valid_until).getTime() - today.getTime()) / 86400000);
      return mapStudent(item, diff);
    });

    const expiringMapped = (expiring ?? []).map(item => {
      const diff = Math.floor((new Date(item.valid_until).getTime() - today.getTime()) / 86400000);
      return mapStudent(item, diff);
    });

    this.expiringStudents = [...expiredMapped, ...expiringMapped];
    this.stats.expiredCount = expiredMapped.length;
    this.stats.expiringCount = expiringMapped.length;
  }

  getStatusClass(daysLeft: number): string {
    if (daysLeft < 0) return 'status--expired';
    if (daysLeft <= 7) return 'status--warning';
    return '';
  }

  getStatusLabel(daysLeft: number): string {
    if (daysLeft < 0) return `Vencida hace ${Math.abs(daysLeft)} días`;
    if (daysLeft === 0) return 'Vence hoy';
    return `Vence en ${daysLeft} días`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 13)  return 'Buen día';
  if (hour >= 13 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

async onAttendanceRegistered() {
  this.showManualModal = false;
  await this.loadTodayStats(); // refresca el contador
}
}
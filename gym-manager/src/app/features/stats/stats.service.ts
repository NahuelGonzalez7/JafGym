import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

export interface StatsSummary {
  totalAttendances: number;
  uniqueStudents: number;
  newStudents: number;
  expiredQuotas: number;
  expiringQuotas: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  private get tenantId() {
    return this.licenseService.getTenantId();
  }

  private get today() {
    return new Date().toISOString().split('T')[0];
  }

  getDateRange(period: 'today' | 'week' | 'month'): { from: string; to: string } {
    const to = this.today;
    const from = new Date();

    if (period === 'week')  from.setDate(from.getDate() - 7);
    if (period === 'month') from.setDate(from.getDate() - 30);

    return { from: from.toISOString().split('T')[0], to };
  }

  async getSummary(from: string, to: string): Promise<StatsSummary> {
    const [attendances, students, payments] = await Promise.all([
      this.supabase.client
        .from('attendances')
        .select('student_id')
        .eq('tenant_id', this.tenantId)
        .gte('attended_at', `${from}T00:00:00`)
        .lte('attended_at', `${to}T23:59:59`),

      this.supabase.client
        .from('students')
        .select('id, created_at')
        .eq('tenant_id', this.tenantId)
        .eq('active', true),

      this.supabase.client
        .from('payments')
        .select('student_id, valid_until')
        .eq('tenant_id', this.tenantId)
    ]);

    const attendanceData = attendances.data ?? [];
    const studentData = students.data ?? [];
    const paymentData = payments.data ?? [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const newStudents = studentData.filter(s => {
      const created = new Date(s.created_at);
      return created >= new Date(from) && created <= new Date(to);
    }).length;

    const uniqueStudents = new Set(attendanceData.map(a => a.student_id)).size;

    // último pago por alumno
    const latestPayments = new Map<string, string>();
    for (const p of paymentData) {
      const current = latestPayments.get(p.student_id);
      if (!current || p.valid_until > current) {
        latestPayments.set(p.student_id, p.valid_until);
      }
    }

    let expiredQuotas = 0;
    let expiringQuotas = 0;
    for (const [, validUntil] of latestPayments) {
      const expiry = new Date(validUntil);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
      if (daysLeft < 0) expiredQuotas++;
      else if (daysLeft <= 7) expiringQuotas++;
    }

    return {
      totalAttendances: attendanceData.length,
      uniqueStudents,
      newStudents,
      expiredQuotas,
      expiringQuotas
    };
  }

  async getAttendances(from: string, to: string, search = '') {
    const { data, error } = await this.supabase.client
      .from('attendances')
      .select(`*, students(first_name, last_name, dni, photo_url)`)
      .eq('tenant_id', this.tenantId)
      .gte('attended_at', `${from}T00:00:00`)
      .lte('attended_at', `${to}T23:59:59`)
      .order('attended_at', { ascending: false });

    if (error) throw error;

    const results = data ?? [];
    if (!search) return results;

    const q = search.toLowerCase();
    return results.filter(a =>
      `${a.students?.first_name} ${a.students?.last_name}`.toLowerCase().includes(q) ||
      a.students?.dni?.includes(q)
    );
  }

  async getStudentStats(from: string, to: string) {
    const { data, error } = await this.supabase.client
      .from('students')
      .select('id, first_name, last_name, created_at, active')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const all = data ?? [];
    const newStudents = all.filter(s => {
      const created = new Date(s.created_at);
      return created >= new Date(from) && created <= new Date(to);
    });
    const inactive = all.filter(s => !s.active);

    return { all, newStudents, inactive };
  }

  async getFinanceSummary(from: string, to: string) {
  const { data, error } = await this.supabase.client
    .from('payments')
    .select(`
      *,
      students(first_name, last_name, dni),
      memberships(name)
    `)
    .eq('tenant_id', this.tenantId)
    .gte('paid_at', from)
    .lte('paid_at', to)
    .order('paid_at', { ascending: false });

  if (error) throw error;

  const payments = data ?? [];
  const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const byMembership = payments.reduce((acc: any, p) => {
    const name = p.memberships?.name ?? 'Sin membresía';
    if (!acc[name]) acc[name] = { count: 0, total: 0 };
    acc[name].count++;
    acc[name].total += Number(p.amount);
    return acc;
  }, {});

  return { payments, totalIncome, byMembership };
}
}
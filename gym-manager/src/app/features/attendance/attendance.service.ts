import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

export interface Attendance {
  id: string;
  student_id: string;
  attended_at: string;
  students?: { first_name: string; last_name: string; dni: string; photo_url: string | null };
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  private get tenantId() {
    return this.licenseService.getTenantId();
  }

  async registerAttendance(studentId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('attendances')
      .insert({
        tenant_id: this.tenantId,
        student_id: studentId,
        attended_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getByDate(date: string): Promise<Attendance[]> {
    const { data, error } = await this.supabase.client
      .from('attendances')
      .select(`*, students(first_name, last_name, dni, photo_url)`)
      .eq('tenant_id', this.tenantId)
      .gte('attended_at', `${date}T00:00:00`)
      .lte('attended_at', `${date}T23:59:59`)
      .order('attended_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getByDateRange(from: string, to: string): Promise<Attendance[]> {
    const { data, error } = await this.supabase.client
      .from('attendances')
      .select(`*, students(first_name, last_name, dni, photo_url)`)
      .eq('tenant_id', this.tenantId)
      .gte('attended_at', `${from}T00:00:00`)
      .lte('attended_at', `${to}T23:59:59`)
      .order('attended_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async alreadyCheckedInToday(studentId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await this.supabase.client
      .from('attendances')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', this.tenantId)
      .eq('student_id', studentId)
      .gte('attended_at', `${today}T00:00:00`)
      .lte('attended_at', `${today}T23:59:59`);

    return (count ?? 0) > 0;
  }
}
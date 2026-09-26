import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

export interface Payment {
  id: string;
  student_id: string;
  membership_id: string;
  amount: number;
  paid_at: string;
  valid_from: string;
  valid_until: string;
  notes: string;
  students?: { first_name: string; last_name: string; dni: string };
  memberships?: { name: string };
}

export interface CreatePaymentDto {
  student_id: string;
  membership_id: string;
  amount: number;
  paid_at: string;
  valid_from: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  private get tenantId() {
    return this.licenseService.getTenantId();
  }

  async getRecent(limit = 50): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select(`
        *,
        students (first_name, last_name, dni),
        memberships (name)
      `)
      .eq('tenant_id', this.tenantId)
      .order('paid_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  async getByStudent(studentId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select(`*, memberships(name)`)
      .eq('tenant_id', this.tenantId)
      .eq('student_id', studentId)
      .order('paid_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async create(dto: CreatePaymentDto, durationDays: number): Promise<Payment> {
    const validFrom = new Date(dto.valid_from);
    const validUntil = new Date(validFrom);
    validUntil.setDate(validUntil.getDate() + durationDays);

    const { data, error } = await this.supabase.client
      .from('payments')
      .insert({
        ...dto,
        tenant_id:   this.tenantId,
        valid_until: validUntil.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
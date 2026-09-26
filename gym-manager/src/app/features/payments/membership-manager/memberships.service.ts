import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LicenseService } from '../../../core/services/license.service';

export interface Membership {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  active: boolean;
}

export interface CreateMembershipDto {
  name: string;
  price: number;
  duration_days: number;
}

@Injectable({ providedIn: 'root' })
export class MembershipsService {

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  private get tenantId() {
    return this.licenseService.getTenantId();
  }

  async getAll(): Promise<Membership[]> {
    const { data, error } = await this.supabase.client
      .from('memberships')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async create(dto: CreateMembershipDto): Promise<Membership> {
    const { data, error } = await this.supabase.client
      .from('memberships')
      .insert({ ...dto, tenant_id: this.tenantId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('memberships')
      .update({ active: false })
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }
}
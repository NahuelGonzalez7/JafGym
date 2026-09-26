import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { LicenseService } from '../../core/services/license.service';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  birth_date: string;
  photo_url: string | null;
  active: boolean;
  created_at: string;
  // calculado en el frontend
  quota_status?: 'ok' | 'warning' | 'expired' | 'none';
  valid_until?: string | null;
}

export interface CreateStudentDto {
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  birth_date: string | null;
}

@Injectable({ providedIn: 'root' })
export class StudentsService {

  constructor(
    private supabase: SupabaseService,
    private licenseService: LicenseService
  ) {}

  private get tenantId() {
    return this.licenseService.getTenantId();
  }

async getAll(includeInactive = false): Promise<Student[]> {
  let query = this.supabase.client
    .from('students')
    .select(`*, payments(valid_until)`)
    .eq('tenant_id', this.tenantId)
    .order('first_name', { ascending: true });

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(s => this.mapWithQuotaStatus(s));
}

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await this.supabase.client
      .from('students')
      .select(`*, payments(valid_until, paid_at, amount, memberships(name))`)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) throw error;
    return data ? this.mapWithQuotaStatus(data) : null;
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const { data, error } = await this.supabase.client
      .from('students')
      .insert({ ...dto, tenant_id: this.tenantId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: Partial<CreateStudentDto>): Promise<void> {
    const { error } = await this.supabase.client
      .from('students')
      .update(dto)
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('students')
      .update({ active: false })
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  async uploadPhoto(studentId: string, file: File): Promise<string> {
    // Comprimimos antes de subir
    const compressed = await this.compressImage(file, 200);
    const path = `${this.tenantId}/${studentId}.jpg`;

    const { error } = await this.supabase.client.storage
      .from('student-photos')
      .upload(path, compressed, { upsert: true });

    if (error) throw error;

    const { data } = this.supabase.client.storage
      .from('student-photos')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  private mapWithQuotaStatus(s: any): Student {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tomamos el pago más reciente
    const payments = s.payments ?? [];
    const latest = payments
      .sort((a: any, b: any) =>
        new Date(b.valid_until).getTime() - new Date(a.valid_until).getTime()
      )[0];

    let quota_status: Student['quota_status'] = 'none';
    let valid_until: string | null = null;

    if (latest) {
      const expiry = new Date(latest.valid_until);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
      valid_until = latest.valid_until;

      if (daysLeft < 0)      quota_status = 'expired';
      else if (daysLeft <= 7) quota_status = 'warning';
      else                    quota_status = 'ok';
    }

    return { ...s, quota_status, valid_until };
  }

  private compressImage(file: File, maxSizeKB: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => blob ? resolve(blob) : reject('Compression failed'),
          'image/jpeg',
          0.8
        );

        URL.revokeObjectURL(url);
      };

      img.onerror = reject;
    });
  }

  async reactivate(id: string): Promise<void> {
  const { error } = await this.supabase.client
    .from('students')
    .update({ active: true })
    .eq('id', id)
    .eq('tenant_id', this.tenantId);

  if (error) throw error;
}
}
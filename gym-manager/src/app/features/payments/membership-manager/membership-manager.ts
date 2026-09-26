import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembershipsService, Membership, CreateMembershipDto } from './memberships.service';

@Component({
  selector: 'app-membership-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membership-manager.html',
  styleUrl: './membership-manager.scss'
})
export class MembershipManagerComponent implements OnInit {

  memberships: Membership[] = [];
  loading = false;
  showForm = false;
  errors: Record<string, string> = {};

  form: CreateMembershipDto = { name: '', price: 0, duration_days: 30 };

  constructor(private membershipsService: MembershipsService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.memberships = await this.membershipsService.getAll();
    this.loading = false;
  }

  validate(): boolean {
    this.errors = {};
    if (!this.form.name.trim())      this.errors['name']         = 'El nombre es obligatorio';
    if (this.form.price <= 0)        this.errors['price']        = 'El precio debe ser mayor a 0';
    if (this.form.duration_days <= 0) this.errors['duration_days'] = 'La duración debe ser mayor a 0';
    return Object.keys(this.errors).length === 0;
  }

  async save() {
    if (!this.validate()) return;
    this.loading = true;
    await this.membershipsService.create(this.form);
    this.form = { name: '', price: 0, duration_days: 30 };
    this.showForm = false;
    await this.load();
    this.loading = false;
  }

  async deactivate(id: string) {
    await this.membershipsService.deactivate(id);
    await this.load();
  }
}
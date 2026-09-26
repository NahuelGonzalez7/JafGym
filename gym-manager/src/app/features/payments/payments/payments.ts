import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsService, Payment } from '../payments.service';
import { PaymentFormComponent } from '../payment-form/payment-form';
import { MembershipManagerComponent } from '../membership-manager/membership-manager';

type Tab = 'payments' | 'memberships';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentFormComponent, MembershipManagerComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class PaymentsComponent implements OnInit {

  activeTab: Tab = 'payments';
  payments: Payment[] = [];
  filtered: Payment[] = [];
  search = '';
  loading = true;
  showForm = false;

  constructor(private paymentsService: PaymentsService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.payments = await this.paymentsService.getRecent();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.payments.filter(p =>
      `${p.students?.first_name} ${p.students?.last_name}`.toLowerCase().includes(q) ||
      p.students?.dni?.includes(q)
    );
  }

  async onPaymentSaved() {
    this.showForm = false;
    await this.load();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR');
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
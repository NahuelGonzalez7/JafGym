import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService, StatsSummary } from '../stats.service';
import { AttendanceService, Attendance } from '../../attendance/attendance.service';

type MainTab = 'summary' | 'attendance' | 'students' | 'finance';
type Period = 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class StatsComponent implements OnInit {
  activeTab: MainTab = 'summary';
  period: Period = 'today';

  customFrom = '';
  customTo = '';
  search = '';

  summary: StatsSummary | null = null;
  attendances: any[] = [];
  studentStats: any = null;
  financeStats: any = null;

  loading = false;

  constructor(
    private statsService: StatsService,
    private attendanceService: AttendanceService,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  getRange(): { from: string; to: string } {
    if (this.period === 'custom') {
      return {
        from: this.customFrom || new Date().toISOString().split('T')[0],
        to: this.customTo || new Date().toISOString().split('T')[0],
      };
    }
    return this.statsService.getDateRange(this.period);
  }

  async load() {
    this.loading = true;
    const { from, to } = this.getRange();

    try {
      if (this.activeTab === 'summary') {
        this.summary = await this.statsService.getSummary(from, to);
      } else if (this.activeTab === 'attendance') {
        this.attendances = await this.statsService.getAttendances(from, to, this.search);
      } else if (this.activeTab === 'students') {
        this.studentStats = await this.statsService.getStudentStats(from, to);
      } else if (this.activeTab === 'finance') {
        this.financeStats = await this.statsService.getFinanceSummary(from, to);
      }
    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }

  async onTabChange(tab: MainTab) {
    this.activeTab = tab;
    await this.load();
  }

  async onPeriodChange(p: Period) {
    this.period = p;
    if (p !== 'custom') await this.load();
  }

  async applyCustomRange() {
    if (this.customFrom && this.customTo) await this.load();
  }

  periodLabel(): string {
    switch (this.period) {
      case 'today':
        return 'hoy';
      case 'week':
        return 'los últimos 7 días';
      case 'month':
        return 'los últimos 30 días';
      default:
        return 'el período seleccionado';
    }
  }

  formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
}

getKeys(obj: any): string[] {
  return Object.keys(obj ?? {});
}
}

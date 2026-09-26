import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService, Student } from '../../students/students.service';
import { AttendanceService } from '../attendance.service';

@Component({
  selector: 'app-manual-attendance-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-attendance-modal.html',
  styleUrl: './manual-attendance-modal.scss'
})
export class ManualAttendanceModalComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() registered = new EventEmitter<void>();

  students: Student[] = [];
  filtered: Student[] = [];
  search = '';
  selected: Student | null = null;
  alreadyIn = false;
  loading = false;
  success = false;

  constructor(
    private studentsService: StudentsService,
    private attendanceService: AttendanceService
  ) {}

  async ngOnInit() {
    this.students = await this.studentsService.getAll();
  }

  searchStudents() {
    const q = this.search.toLowerCase();
    if (!q) { this.filtered = []; return; }
    this.filtered = this.students.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.dni?.includes(q)
    ).slice(0, 6);
  }

  async selectStudent(student: Student) {
    this.selected = student;
    this.search = `${student.first_name} ${student.last_name}`;
    this.filtered = [];
    this.alreadyIn = await this.attendanceService.alreadyCheckedInToday(student.id);
  }

  async register() {
    if (!this.selected) return;
    this.loading = true;

    try {
      await this.attendanceService.registerAttendance(this.selected.id);
      this.success = true;
      setTimeout(() => {
        this.registered.emit();
        this.close.emit();
      }, 1500);
    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }

  getQuotaClass(): string {
    switch (this.selected?.quota_status) {
      case 'expired': return 'quota--expired';
      case 'warning': return 'quota--warning';
      case 'ok':      return 'quota--ok';
      default:        return 'quota--none';
    }
  }

  getQuotaLabel(): string {
    if (!this.selected) return '';
    switch (this.selected.quota_status) {
      case 'expired': return '⚠ Cuota vencida';
      case 'warning': return '⚠ Cuota por vencer';
      case 'ok':      return '✓ Cuota al día';
      default:        return 'Sin cuota registrada';
    }
  }
}
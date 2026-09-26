import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsService, CreatePaymentDto } from '../payments.service';
import { MembershipsService, Membership } from '../membership-manager/memberships.service';
import { StudentsService, Student } from '../../students/students.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss'
})
export class PaymentFormComponent implements OnInit {

  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  students: Student[] = [];
  memberships: Membership[] = [];
  filteredStudents: Student[] = [];
  studentSearch = '';
  selectedStudent: Student | null = null;
  selectedMembership: Membership | null = null;
  showStudentDropdown = false;

  form = {
    amount: 0,
    paid_at: new Date().toISOString().split('T')[0],
    valid_from: new Date().toISOString().split('T')[0],
    notes: ''
  };

  errors: Record<string, string> = {};
  loading = false;

  constructor(
    private paymentsService: PaymentsService,
    private membershipsService: MembershipsService,
    private studentsService: StudentsService
  ) {}

  async ngOnInit() {
    const [students, memberships] = await Promise.all([
      this.studentsService.getAll(),
      this.membershipsService.getAll()
    ]);
    this.students = students;
    this.memberships = memberships;
  }

  searchStudents() {
    const q = this.studentSearch.toLowerCase();
    this.filteredStudents = this.students.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.dni?.includes(q)
    ).slice(0, 6);
    this.showStudentDropdown = true;
  }

  selectStudent(student: Student) {
    this.selectedStudent = student;
    this.studentSearch = `${student.first_name} ${student.last_name}`;
    this.showStudentDropdown = false;
  }

  selectMembership(membership: Membership) {
    this.selectedMembership = membership;
    this.form.amount = membership.price;
  }

  getValidUntil(): string {
    if (!this.selectedMembership || !this.form.valid_from) return '-';
    const from = new Date(this.form.valid_from);
    from.setDate(from.getDate() + this.selectedMembership.duration_days);
    return from.toLocaleDateString('es-AR');
  }

  validate(): boolean {
    this.errors = {};
    if (!this.selectedStudent)   this.errors['student']    = 'Seleccioná un alumno';
    if (!this.selectedMembership) this.errors['membership'] = 'Seleccioná una membresía';
    if (!this.form.amount || this.form.amount <= 0) this.errors['amount'] = 'Ingresá un monto válido';
    if (!this.form.paid_at)      this.errors['paid_at']    = 'Ingresá la fecha de pago';
    if (!this.form.valid_from)   this.errors['valid_from'] = 'Ingresá la fecha de inicio';
    return Object.keys(this.errors).length === 0;
  }

  async save() {
    if (!this.validate()) return;
    this.loading = true;

    try {
      const dto: CreatePaymentDto = {
        student_id:    this.selectedStudent!.id,
        membership_id: this.selectedMembership!.id,
        amount:        this.form.amount,
        paid_at:       this.form.paid_at,
        valid_from:    this.form.valid_from,
        notes:         this.form.notes
      };
      await this.paymentsService.create(dto, this.selectedMembership!.duration_days);
      this.saved.emit();
    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }
}
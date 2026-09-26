import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentsService, Student, CreateStudentDto } from '../students.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-student-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-panel.html',
  styleUrl: './student-panel.scss',
})

export class StudentPanelComponent implements OnChanges {

  @Input() student: Student | null = null;
  @Input() isNew = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() deactivated = new EventEmitter<void>();

  form: CreateStudentDto = this.emptyForm();
  loading = false;
  photoPreview: string | null = null;
  selectedFile: File | null = null;
  confirmDeactivate = false;

  constructor(private studentsService: StudentsService, private toastService: ToastService) {}

  ngOnChanges() {
    if (this.student) {
      this.form = {
        first_name: this.student.first_name,
        last_name:  this.student.last_name,
        dni:        this.student.dni,
        phone:      this.student.phone,
        email:      this.student.email,
        birth_date: this.student.birth_date
      };
      this.photoPreview = this.student.photo_url;
    } else {
      this.form = this.emptyForm();
      this.photoPreview = null;
    }
    this.confirmDeactivate = false;
    this.selectedFile = null;
  }

  emptyForm(): CreateStudentDto {
    return { first_name: '', last_name: '', dni: '', phone: '', email: '', birth_date: '' };
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.photoPreview = URL.createObjectURL(file);
  }

errors: Record<string, string> = {};

validate(): boolean {
  this.errors = {};

  if (!this.form.first_name.trim())
    this.errors['first_name'] = 'El nombre es obligatorio';

  if (!this.form.last_name.trim())
    this.errors['last_name'] = 'El apellido es obligatorio';

  const dniClean = this.form.dni.replace(/\./g, '').trim();
  if (!dniClean)
    this.errors['dni'] = 'El DNI es obligatorio';
  else if (!/^\d{8}$/.test(dniClean))
    this.errors['dni'] = 'El DNI debe tener exactamente 8 dígitos';

  if (this.form.email && !this.form.email.includes('@'))
    this.errors['email'] = 'El email debe contener @';

  if (this.form.phone) {
    const phoneClean = this.form.phone.replace(/\D/g, '');
    if (phoneClean.length > 10)
      this.errors['phone'] = 'El teléfono debe tener máximo 10 dígitos';
  }

  // fecha de nacimiento: si se ingresa tiene que ser válida
  if (this.form.birth_date && isNaN(new Date(this.form.birth_date).getTime()))
    this.errors['birth_date'] = 'La fecha de nacimiento no es válida';

  return Object.keys(this.errors).length === 0;
}

async save() {
  if (!this.validate()) return;
  this.loading = true;

  const dto = {
    ...this.form,
    dni: this.form.dni.replace(/\./g, '').trim(),
    birth_date: this.form.birth_date || null // null si está vacío
  };

  try {
    if (this.isNew) {
      const created = await this.studentsService.create(dto);
      if (this.selectedFile) {
        await this.studentsService.uploadPhoto(created.id, this.selectedFile);
      }
      this.toastService.success('Alumno creado correctamente');
    } else if (this.student) {
      await this.studentsService.update(this.student.id, dto);
      if (this.selectedFile) {
        await this.studentsService.uploadPhoto(this.student.id, this.selectedFile);
      }
      this.toastService.success('Cambios guardados correctamente');
    }
    this.saved.emit();
  } catch (e: any) {
    this.toastService.error('Ocurrió un error al guardar. Intentá de nuevo.');
    console.error(e);
  }

  this.loading = false;
}

async deactivate() {
  if (!this.student) return;
  this.loading = true;
  try {
    await this.studentsService.deactivate(this.student.id);
    this.toastService.success('Alumno dado de baja correctamente');
    this.deactivated.emit();
  } catch (e) {
    this.toastService.error('No se pudo dar de baja al alumno.');
  }
  this.loading = false;
}

  quotaLabel(): string {
    if (!this.student?.valid_until) return 'Sin cuota registrada';
    const days = Math.floor(
      (new Date(this.student.valid_until).getTime() - new Date().getTime()) / 86400000
    );
    if (days < 0) return `Vencida hace ${Math.abs(days)} días`;
    if (days === 0) return 'Vence hoy';
    return `Vence en ${days} días (${this.student.valid_until})`;
  }

  quotaClass(): string {
    switch (this.student?.quota_status) {
      case 'expired': return 'quota--expired';
      case 'warning': return 'quota--warning';
      case 'ok':      return 'quota--ok';
      default:        return 'quota--none';
    }
  }

  async reactivate() {
  if (!this.student) return;
  this.loading = true;
  try {
    await this.studentsService.reactivate(this.student.id);
    this.toastService.success('Alumno reactivado correctamente');
    this.saved.emit();
  } catch (e) {
    this.toastService.error('No se pudo reactivar el alumno.');
  }
  this.loading = false;
}
}
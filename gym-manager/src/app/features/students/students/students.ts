import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService, Student } from './../students.service';
import { StudentPanelComponent } from './../student-panel/student-panel';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentPanelComponent],
  templateUrl: './students.html',
  styleUrl: './students.scss',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filtered: Student[] = [];
  selected: Student | null = null;
  search = '';
  loading = true;
  showForm = false;
  showInactive = false;

  constructor(private studentsService: StudentsService) {}

  async ngOnInit() {
    await this.load();
  }

  async toggleInactive() {
    this.showInactive = !this.showInactive;
    this.students = await this.studentsService.getAll(this.showInactive);
    this.applyFilter();
  }

  async load() {
    this.loading = true;
    this.students = await this.studentsService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.students.filter(
      (s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.dni?.toLowerCase().includes(q),
    );
  }

  select(student: Student) {
    this.selected = student;
    this.showForm = false;
  }

  openForm() {
    this.selected = null;
    this.showForm = true;
  }

  onPanelClose() {
    this.selected = null;
    this.showForm = false;
  }

  async onStudentSaved() {
    await this.load();
    this.showForm = false;
  }

  async onStudentDeactivated() {
    await this.load();
    this.selected = null;
  }

  statusIcon(status: Student['quota_status']): string {
    switch (status) {
      case 'ok':
        return '●';
      case 'warning':
        return '⚠';
      case 'expired':
        return '✕';
      default:
        return '○';
    }
  }
}

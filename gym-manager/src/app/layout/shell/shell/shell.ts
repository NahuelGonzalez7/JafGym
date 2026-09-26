import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ElectronService } from '../../../core/services/electron.service';
import { ToastComponent } from '../../../shared/components/toast/toast';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {
  constructor(private electronService: ElectronService,
    private toastService: ToastService
  ) {}

    ngOnInit() {
    this.electronService.onUpdateAvailable(() => {
      this.toastService.warning('Hay una actualización disponible. Se instalará al cerrar la app.');
    });

    this.electronService.onUpdateDownloaded(() => {
      this.toastService.success('Actualización descargada. Reiniciá la app para aplicarla.');
    });
  }

  openKiosk() {
    this.electronService.openKiosk();
  }
}

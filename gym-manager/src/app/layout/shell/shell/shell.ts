import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ElectronService } from '../../../core/services/electron.service';
import { ToastComponent } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {
  constructor(private electronService: ElectronService) {}

  openKiosk() {
    this.electronService.openKiosk();
  }
}

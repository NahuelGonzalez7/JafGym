import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private electron: any;

  constructor() {
    if ((window as any).electron) {
      this.electron = (window as any).electron;
    }
  }

  isElectron(): boolean {
    return !!this.electron;
  }

  openKiosk(): void {
    if (this.isElectron()) {
      this.electron.openKiosk();
    }
  }

  onUpdateAvailable(cb: () => void): void {
    if (this.isElectron()) this.electron.onUpdateAvailable(cb);
  }

  onUpdateDownloaded(cb: () => void): void {
    if (this.isElectron()) this.electron.onUpdateDownloaded(cb);
  }
}

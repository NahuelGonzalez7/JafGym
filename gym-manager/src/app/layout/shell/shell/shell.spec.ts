import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShellComponent } from './shell';
import { RouterModule } from '@angular/router';
import { ElectronService } from '../../../core/services/electron.service';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ElectronService,
          useValue: {
            openKiosk: jest.fn(),
            isElectron: jest.fn(),
            onUpdateAvailable: jest.fn(),
            onUpdateDownloaded: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openKiosk on electron service', () => {
    const electronService = TestBed.inject(ElectronService);
    component.openKiosk();
    expect(electronService.openKiosk).toHaveBeenCalled();
  });
});
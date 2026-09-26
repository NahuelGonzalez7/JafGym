import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast on show()', () => {
    service.show('Test message', 'error');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test message');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should add success toast', () => {
    service.success('OK');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('should add warning toast', () => {
    service.warning('Cuidado');
    expect(service.toasts()[0].type).toBe('warning');
  });

  it('should remove toast by id', () => {
    service.show('A', 'error');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should add multiple toasts', () => {
    service.success('uno');
    service.error('dos');
    expect(service.toasts().length).toBe(2);
  });
});
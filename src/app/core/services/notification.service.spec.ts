import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('success() should open snackbar with success panel class', () => {
    service.success('All good!');

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'All good!',
      '✕',
      jasmine.objectContaining({ panelClass: ['snack--success'], duration: 3500 }),
    );
  });

  it('error() should open snackbar with error panel class and longer duration', () => {
    service.error('Something went wrong');

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'Something went wrong',
      '✕',
      jasmine.objectContaining({ panelClass: ['snack--error'], duration: 5000 }),
    );
  });

  it('info() should open snackbar with info panel class', () => {
    service.info('FYI');

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'FYI',
      '✕',
      jasmine.objectContaining({ panelClass: ['snack--info'] }),
    );
  });

  it('warning() should open snackbar with warning panel class', () => {
    service.warning('Watch out');

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'Watch out',
      '✕',
      jasmine.objectContaining({ panelClass: ['snack--warning'] }),
    );
  });

  it('should position snackbar at bottom end', () => {
    service.success('Positioned');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(String),
      jasmine.objectContaining({
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      }),
    );
  });

  it('success() should accept a custom duration', () => {
    service.success('Custom', 1000);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(String),
      jasmine.objectContaining({ duration: 1000 }),
    );
  });
});

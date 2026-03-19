import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Thin wrapper around MatSnackBar.
 * Keeps the same public API so existing call sites need zero changes.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 3500): void {
    this.open(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.open(message, 'error', duration);
  }

  info(message: string, duration = 3500): void {
    this.open(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.open(message, 'warning', duration);
  }

  private open(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number,
  ): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [`snack--${type}`],
    };
    this.snackBar.open(message, '✕', config);
  }
}

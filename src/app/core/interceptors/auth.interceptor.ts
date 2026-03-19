import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../services/notification.service';

/** Frisbii error response body shape */
interface FrisbiiErrorBody {
  code?: number;
  error?: string;
  http_status?: number;
  http_reason?: string;
  path?: string;
  timestamp?: string;
  request_id?: string;
}

/** Extract the most useful human-readable message from a Frisbii error response. */
function extractErrorMessage(err: HttpErrorResponse): string {
  const body = err.error as FrisbiiErrorBody | null;

  // Frisbii returns { error: "Customer not found", http_status: 404, ... }
  if (body?.error) {
    return body.error;
  }

  switch (err.status) {
    case 401:
      return 'Unauthorized — check your API key.';
    case 403:
      return 'Forbidden — you do not have access to this resource.';
    case 404:
      return 'Resource not found.';
    case 422:
      return 'Invalid request — check the submitted data.';
    case 429:
      return 'Too many requests — please slow down.';
    case 500:
      return 'Server error — please try again later.';
    case 0:
      return 'Network error — check your connection.';
    default:
      return `Request failed (HTTP ${err.status})`;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = btoa(`${environment.apiKey}:`);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        notificationService.error(extractErrorMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

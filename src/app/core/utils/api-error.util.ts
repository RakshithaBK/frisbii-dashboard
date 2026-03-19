import { HttpErrorResponse } from '@angular/common/http';

export function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: string } | null;
    return body?.error ?? `Request failed (HTTP ${err.status})`;
  }
  return 'An unexpected error occurred.';
}

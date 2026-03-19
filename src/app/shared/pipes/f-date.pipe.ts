import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fDate',
  standalone: true,
})
export class FDatePipe implements PipeTransform {
  transform(
    value: string | undefined | null,
    format: 'short' | 'long' | 'relative' = 'short',
  ): string {
    if (!value) return '—';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';

    if (format === 'relative') {
      return this.relative(date);
    }

    if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // short
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private relative(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return this.transform(date.toISOString(), 'short');
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }
}

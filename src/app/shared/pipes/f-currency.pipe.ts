import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fCurrency',
  standalone: true,
})
export class FCurrencyPipe implements PipeTransform {
  /**
   * Frisbii amounts are in minor units (cents).
   * E.g. 1000 USD = $10.00
   */
  transform(amount: number | undefined, currency: string | undefined): string {
    if (amount === undefined || amount === null) return '—';
    const curr = (currency ?? 'USD').toUpperCase();

    try {
      const major = amount / 100;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 2,
      }).format(major);
    } catch {
      return `${amount} ${curr}`;
    }
  }
}

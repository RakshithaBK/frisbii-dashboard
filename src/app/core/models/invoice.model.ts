/**
 * Known invoice states.
 */
export type InvoiceState = 'created' | 'pending' | 'settled' | 'authorized' | 'failed' | 'unknown';

/**
 * Invoice resource from Frisbii API.
 */
export interface Invoice {
  handle?: string;
  id: string;
  state: InvoiceState;
  customer: string;
  subscription?: string;
  plan?: string;
  amount: number;
  currency: string;
  created: string;
  settled?: string;
  authorized?: string;
  failed?: string;
  refunded?: number;
  order_lines?: OrderLine[];
  test?: boolean;
  metadata?: Record<string, string>;
}

export interface OrderLine {
  id: string;
  ordertext: string;
  amount: number;
  vat?: number;
  quantity: number;
  origin?: string;
}

/**
 * Normalise an unknown state string to a known InvoiceState.
 */
export function normaliseInvoiceState(raw: string | undefined): InvoiceState {
  const known: InvoiceState[] = ['created', 'pending', 'settled', 'authorized', 'failed'];
  return known.includes(raw as InvoiceState) ? (raw as InvoiceState) : 'unknown';
}

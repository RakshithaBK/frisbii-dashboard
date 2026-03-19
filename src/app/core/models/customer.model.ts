/**
 * Customer resource from Frisbii API.
 */
export interface Customer {
  handle: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  address?: string;
  address2?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  state?: string;
  vat?: string;
  test?: boolean;
  created: string; // ISO 8601 date string
  deleted?: string;
  metadata?: Record<string, string>;
}

export function customerDisplayName(customer: Customer): string {
  const parts = [customer.first_name, customer.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : customer.handle;
}

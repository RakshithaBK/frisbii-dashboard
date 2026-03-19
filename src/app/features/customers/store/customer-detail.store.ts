import { Injectable, signal, computed } from '@angular/core';
import { Customer } from '../../../core/models/customer.model';
import { Subscription, normaliseSubscriptionState } from '../../../core/models/subscription.model';
import { Invoice, normaliseInvoiceState } from '../../../core/models/invoice.model';
import { ApiList } from '../../../core/models/api.model';

/**
 * Holds all reactive state for the Customer Detail page.
 * Contains only signals and computed values — no RxJS, no HTTP calls.
 * Updated exclusively by CustomerDetailEffects.
 */
@Injectable()
export class CustomerDetailStore {
  // ── Customer ──────────────────────────────────────────────────────────────────
  readonly customer = signal<Customer | null>(null);
  readonly loadingCustomer = signal(true);
  readonly customerError = signal<string | null>(null);

  // ── Subscriptions ─────────────────────────────────────────────────────────────
  readonly loadingSubscriptions = signal(true);
  readonly subsError = signal<string | null>(null);
  readonly loadingMoreSubs = signal(false);

  private readonly _subscriptions = signal<Subscription[]>([]);
  private readonly _subPageToken = signal<string | undefined>(undefined);
  private readonly _subOverrides = signal<Record<string, Subscription>>({});

  // ── Invoices ──────────────────────────────────────────────────────────────────
  readonly loadingInvoices = signal(true);
  readonly invoicesError = signal<string | null>(null);
  readonly loadingMoreInvoices = signal(false);

  private readonly _invoices = signal<Invoice[]>([]);
  private readonly _invoicePageToken = signal<string | undefined>(undefined);

  // ── Per-action loading map ────────────────────────────────────────────────────
  readonly actionLoading = signal<Record<string, boolean>>({});

  // ── Computed signals ──────────────────────────────────────────────────────────
  readonly allSubscriptions = computed<Subscription[]>(() => {
    const overrides = this._subOverrides();
    return this._subscriptions().map((s) => overrides[s.handle] ?? s);
  });

  readonly allInvoices = computed<Invoice[]>(() => this._invoices());

  readonly hasMoreSubscriptions = computed(() => !!this._subPageToken());
  readonly hasMoreInvoices = computed(() => !!this._invoicePageToken());

  // Exposed for effects to read when dispatching load-more
  readonly subPageToken = computed(() => this._subPageToken());
  readonly invoicePageToken = computed(() => this._invoicePageToken());

  // ── Customer updaters ─────────────────────────────────────────────────────────
  setCustomer(customer: Customer): void {
    this.customer.set(customer);
    this.loadingCustomer.set(false);
    this.customerError.set(null);
  }

  setCustomerError(message: string): void {
    this.customerError.set(message);
    this.loadingCustomer.set(false);
  }

  // ── Subscription updaters ─────────────────────────────────────────────────────
  setSubscriptions(result: ApiList<Subscription>): void {
    this._subscriptions.set(
      result.content.map((s) => ({ ...s, state: normaliseSubscriptionState(s.state) })),
    );
    this._subPageToken.set(result.next_page_token || undefined);
    this.loadingSubscriptions.set(false);
    this.subsError.set(null);
  }

  setSubscriptionsError(message: string): void {
    this.subsError.set(message);
    this.loadingSubscriptions.set(false);
  }

  appendSubscriptions(result: ApiList<Subscription>): void {
    if (result.content.length === 0) {
      this._subPageToken.set(undefined);
    } else {
      this._subscriptions.update((prev) => [
        ...prev,
        ...result.content.map((s) => ({ ...s, state: normaliseSubscriptionState(s.state) })),
      ]);
      this._subPageToken.set(result.next_page_token || undefined);
    }
    this.loadingMoreSubs.set(false);
  }

  setLoadingMoreSubs(value: boolean): void {
    this.loadingMoreSubs.set(value);
  }

  applySubOverride(handle: string, sub: Subscription): void {
    this._subOverrides.update((prev) => ({ ...prev, [handle]: sub }));
  }

  setActionLoading(handle: string, value: boolean): void {
    this.actionLoading.update((prev) => ({ ...prev, [handle]: value }));
  }

  isActionLoading(handle: string): boolean {
    return !!this.actionLoading()[handle];
  }

  // ── Invoice updaters ──────────────────────────────────────────────────────────
  setInvoices(result: ApiList<Invoice>): void {
    this._invoices.set(
      result.content.map((inv) => ({ ...inv, state: normaliseInvoiceState(inv.state) })),
    );
    this._invoicePageToken.set(result.next_page_token || undefined);
    this.loadingInvoices.set(false);
    this.invoicesError.set(null);
  }

  setInvoicesError(message: string): void {
    this.invoicesError.set(message);
    this.loadingInvoices.set(false);
  }

  appendInvoices(result: ApiList<Invoice>): void {
    if (result.content.length === 0) {
      this._invoicePageToken.set(undefined);
    } else {
      this._invoices.update((prev) => [
        ...prev,
        ...result.content.map((inv) => ({ ...inv, state: normaliseInvoiceState(inv.state) })),
      ]);
      this._invoicePageToken.set(result.next_page_token || undefined);
    }
    this.loadingMoreInvoices.set(false);
  }

  setLoadingMoreInvoices(value: boolean): void {
    this.loadingMoreInvoices.set(value);
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { Customer, customerDisplayName } from '../../../core/models/customer.model';
import { ApiList } from '../../../core/models/api.model';

/**
 * Holds all reactive state for the Customer List page.
 *
 * Loading strategy:
 *  - Page 1 fetched immediately — table renders fast
 *  - Remaining pages fetched silently in the background via expand()
 *  - Search filters allCustomers() in memory — improves as more pages arrive
 *  - backgroundLoading drives a subtle progress indicator during background fetch
 */
@Injectable()
export class CustomerListStore {
  // ── Raw writable signals ───────────────────────────────────────────────────
  /** True only during the initial first-page fetch — drives skeleton */
  readonly loading = signal(true);
  /** True while background pages are being fetched — drives subtle indicator */
  readonly backgroundLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');

  private readonly _customers = signal<Customer[]>([]);
  private readonly _totalCount = signal(0);

  // ── Computed signals ───────────────────────────────────────────────────────
  /** All loaded customers — grows silently as background pages arrive */
  readonly allCustomers = computed(() => this._customers());

  /**
   * Client-side filtered view.
   * Reacts instantly to both searchQuery changes and new background pages.
   * Partial results shown while background loading is in progress.
   */
  readonly visibleCustomers = computed<Customer[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.allCustomers();
    if (!query) return all;

    return all.filter(
      (c) =>
        c.handle.toLowerCase().includes(query) ||
        customerDisplayName(c).toLowerCase().includes(query) ||
        (c.email?.toLowerCase().includes(query) ?? false) ||
        (c.company?.toLowerCase().includes(query) ?? false),
    );
  });

  readonly totalCount = computed(() => this._totalCount());
  readonly isSearching = computed(() => this.searchQuery().trim().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.visibleCustomers().length === 0);

  /** How many records are currently indexed for search */
  readonly indexedCount = computed(() => this._customers().length);

  // ── Updaters ──────────────────────────────────────────────────────────────

  /** Called with page 1 — clears skeleton, shows table immediately */
  setFirstPage(result: ApiList<Customer>): void {
    this._customers.set(result.content);
    this._totalCount.set(result.count);
    this.loading.set(false);
    this.error.set(null);
  }

  /** Called for each subsequent background page — appends silently */
  appendBackgroundPage(customers: Customer[]): void {
    this._customers.update((prev) => [...prev, ...customers]);
  }

  setBackgroundLoading(value: boolean): void {
    this.backgroundLoading.set(value);
  }

  setLoading(value: boolean): void {
    this.loading.set(value);
  }

  setError(message: string | null): void {
    this.error.set(message);
    this.loading.set(false);
    this.backgroundLoading.set(false);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  reset(): void {
    this._customers.set([]);
    this._totalCount.set(0);
    this.backgroundLoading.set(false);
    this.error.set(null);
  }
}

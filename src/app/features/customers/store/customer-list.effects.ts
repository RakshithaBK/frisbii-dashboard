import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, expand, tap, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerListStore } from './customer-list.store';
import { ApiList } from '../../../core/models/api.model';
import { Customer } from '../../../core/models/customer.model';
import { extractApiError } from '../../../core/utils/api-error.util';

/**
 * Manages all RxJS streams for the Customer List page.
 *
 * Progressive loading strategy:
 *  1. Fetch page 1 → render table immediately (fast first paint)
 *  2. If next_page_token exists, silently fetch all remaining pages via expand()
 *     and append each page to the store as it arrives
 *  3. Search is pure client-side — zero API calls, works on whatever is loaded
 *
 * One subscribe handles the entire load + background pagination chain.
 */
@Injectable()
export class CustomerListEffects {
  private readonly store = inject(CustomerListStore);
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        switchMap(() => {
          this.store.reset();
          this.store.setLoading(true);

          return this.customerService.getCustomers(20).pipe(
            tap((firstPage) => {
              // Render page 1 immediately
              this.store.setFirstPage(firstPage);
              if (firstPage.next_page_token) {
                this.store.setBackgroundLoading(true);
              }
            }),
            // expand() fires on page 1 emission — but we only want pages 2+
            // So we use switchMap to transition from page 1 into the expand chain
            switchMap((firstPage) =>
              firstPage.next_page_token
                ? this.customerService
                    .getCustomers(20, firstPage.next_page_token)
                    .pipe(
                      expand((page: ApiList<Customer>) =>
                        page.next_page_token
                          ? this.customerService.getCustomers(20, page.next_page_token)
                          : EMPTY,
                      ),
                    )
                : EMPTY,
            ),
            catchError((err: unknown) => {
              this.store.setError(extractApiError(err));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.store.appendBackgroundPage(page.content);
        if (!page.next_page_token) {
          this.store.setBackgroundLoading(false);
        }
      });
  }

  // ── Public action dispatchers ─────────────────────────────────────────────

  load(): void {
    this.load$.next();
  }

  retry(): void {
    this.load$.next();
  }

  search(query: string): void {
    this.store.setSearchQuery(query);
  }

  clearSearch(): void {
    this.store.setSearchQuery('');
  }
}

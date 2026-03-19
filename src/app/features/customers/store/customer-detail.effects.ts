import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, mergeMap, forkJoin, of, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CustomerService } from '../../../core/services/customer.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Customer } from '../../../core/models/customer.model';
import {
  SUBSCRIPTION_STATES,
  Subscription,
  normaliseSubscriptionState,
} from '../../../core/models/subscription.model';
import { Invoice } from '../../../core/models/invoice.model';
import { ApiList } from '../../../core/models/api.model';
import { CustomerDetailStore } from './customer-detail.store';
import { extractApiError } from '../../../core/utils/api-error.util';

/** Discriminated union for load-more actions */
type LoadMoreAction =
  | { type: 'subs'; handle: string; token: string }
  | { type: 'invoices'; handle: string; token: string };

/** Discriminated union for load-more results */
type LoadMoreResult =
  | { type: 'subs'; result: ApiList<Subscription> }
  | { type: 'invoices'; result: ApiList<Invoice> };

/** Discriminated union for pause / unpause */
type SubAction = { type: 'pause'; sub: Subscription } | { type: 'unpause'; sub: Subscription };

/**
 * Manages all RxJS streams for the Customer Detail page.
 *
 * Consolidated subscribers:
 *  1. forkJoin  — fires customer + subscriptions + invoices in parallel
 *  2. mergeMap  — handles load-more-subs and load-more-invoices via discriminated union
 *  3. mergeMap  — handles pause and unpause via discriminated union
 */
@Injectable()
export class CustomerDetailEffects {
  private readonly store = inject(CustomerDetailStore);
  private readonly customerService = inject(CustomerService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly load$ = new Subject<string>();
  private readonly loadMore$ = new Subject<LoadMoreAction>();
  private readonly subAction$ = new Subject<SubAction>();

  constructor() {
    // ── Stream 1: Initial load — forkJoin fires all 3 in parallel ────────────
    // catchError returns of(null) so forkJoin still completes even if one fails.
    this.load$
      .pipe(
        switchMap((handle) =>
          forkJoin({
            customer: this.customerService.getCustomer(handle).pipe(
              catchError((err: unknown) => {
                this.store.setCustomerError(extractApiError(err));
                return of(null);
              }),
            ),
            subscriptions: this.subscriptionService.getSubscriptions(handle, 20).pipe(
              catchError((err: unknown) => {
                this.store.setSubscriptionsError(extractApiError(err));
                return of(null);
              }),
            ),
            invoices: this.invoiceService.getInvoices(handle, 20).pipe(
              catchError((err: unknown) => {
                this.store.setInvoicesError(extractApiError(err));
                return of(null);
              }),
            ),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ customer, subscriptions, invoices }) => {
        if (customer) this.store.setCustomer(customer as Customer);
        if (subscriptions) this.store.setSubscriptions(subscriptions as ApiList<Subscription>);
        if (invoices) this.store.setInvoices(invoices as ApiList<Invoice>);
      });

    // ── Stream 2: Load more — discriminated union handles subs and invoices ───
    // mergeMap lets both load-more-subs and load-more-invoices run concurrently.
    this.loadMore$
      .pipe(
        mergeMap((action) => {
          if (action.type === 'subs') {
            this.store.setLoadingMoreSubs(true);
            return this.subscriptionService.getSubscriptions(action.handle, 20, action.token).pipe(
              catchError((err: unknown) => {
                this.store.setSubscriptionsError(extractApiError(err));
                this.store.setLoadingMoreSubs(false);
                return EMPTY;
              }),
              switchMap((result) => of<LoadMoreResult>({ type: 'subs', result })),
            );
          } else {
            this.store.setLoadingMoreInvoices(true);
            return this.invoiceService.getInvoices(action.handle, 20, action.token).pipe(
              catchError((err: unknown) => {
                this.store.setInvoicesError(extractApiError(err));
                this.store.setLoadingMoreInvoices(false);
                return EMPTY;
              }),
              switchMap((result) => of<LoadMoreResult>({ type: 'invoices', result })),
            );
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ type, result }) => {
        if (type === 'subs') this.store.appendSubscriptions(result as ApiList<Subscription>);
        if (type === 'invoices') this.store.appendInvoices(result as ApiList<Invoice>);
      });

    // ── Stream 3: Subscription actions — pause/unpause via discriminated union ─
    // mergeMap allows concurrent actions on different subscription handles.
    this.subAction$
      .pipe(
        mergeMap((action) => {
          const { sub } = action;
          const isPause = action.type === 'pause';

          // Optimistic update
          this.store.applySubOverride(sub.handle, {
            ...sub,
            state: isPause ? SUBSCRIPTION_STATES.on_hold : SUBSCRIPTION_STATES.active,
          });
          this.store.setActionLoading(sub.handle, true);

          return (
            isPause
              ? this.subscriptionService.putOnHold(sub.handle)
              : this.subscriptionService.reactivate(sub.handle)
          ).pipe(
            catchError((err: unknown) => {
              // Revert on failure
              this.store.applySubOverride(sub.handle, sub);
              this.notificationService.error(
                `Failed to ${isPause ? 'pause' : 'reactivate'} ${sub.handle}: ${extractApiError(err)}`,
              );
              this.store.setActionLoading(sub.handle, false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        this.store.applySubOverride(updated.handle, {
          ...updated,
          state: normaliseSubscriptionState(updated.state),
        });
        const wasPaused = updated.state === SUBSCRIPTION_STATES.on_hold;
        this.notificationService.success(
          `Subscription ${updated.handle} ${wasPaused ? 'paused' : 'reactivated'} successfully.`,
        );
        this.store.setActionLoading(updated.handle, false);
      });
  }

  // ── Public action dispatchers ────────────────────────────────────────────────
  load(handle: string): void {
    this.load$.next(handle);
  }

  loadMoreSubscriptions(handle: string): void {
    const token = this.store.subPageToken();
    if (token && !this.store.loadingMoreSubs()) {
      this.loadMore$.next({ type: 'subs', handle, token });
    }
  }

  loadMoreInvoices(handle: string): void {
    const token = this.store.invoicePageToken();
    if (token && !this.store.loadingMoreInvoices()) {
      this.loadMore$.next({ type: 'invoices', handle, token });
    }
  }

  pauseSubscription(sub: Subscription): void {
    this.subAction$.next({ type: 'pause', sub });
  }

  unpauseSubscription(sub: Subscription): void {
    this.subAction$.next({ type: 'unpause', sub });
  }
}

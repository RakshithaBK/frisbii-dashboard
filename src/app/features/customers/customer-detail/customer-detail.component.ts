import { Component, inject, computed, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { customerDisplayName } from '../../../core/models/customer.model';
import { SUBSCRIPTION_STATES } from '../../../core/models/subscription.model';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../shared/components/breadcrumb/breadcrumb.component';
import { StateBadgeComponent } from '../../../shared/components/state-badge/state-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FDatePipe } from '../../../shared/pipes/f-date.pipe';
import { FCurrencyPipe } from '../../../shared/pipes/f-currency.pipe';
import { CustomerDetailStore } from '../store/customer-detail.store';
import { CustomerDetailEffects } from '../store/customer-detail.effects';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule,
    BreadcrumbComponent,
    StateBadgeComponent,
    EmptyStateComponent,
    FDatePipe,
    FCurrencyPipe,
  ],
  providers: [CustomerDetailStore, CustomerDetailEffects],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  readonly handle = input.required<string>();

  readonly store = inject(CustomerDetailStore);
  readonly effects = inject(CustomerDetailEffects);
  private readonly router = inject(Router);

  readonly displayName = customerDisplayName;
  readonly SubscriptionState = SUBSCRIPTION_STATES;

  readonly subsColumns = ['handle', 'state', 'plan', 'created', 'actions'];
  readonly invoiceColumns = ['handle', 'state', 'amount', 'created'];

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Customers', path: '/customers' },
    { label: this.store.customer()?.handle ?? this.handle() },
  ]);

  ngOnInit(): void {
    this.effects.load(this.handle());
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}

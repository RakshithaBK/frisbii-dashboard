import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { customerDisplayName } from '../../../core/models/customer.model';
import { FDatePipe } from '../../../shared/pipes/f-date.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CustomerListStore } from '../store/customer-list.store';
import { CustomerListEffects } from '../store/customer-list.effects';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    FDatePipe,
    EmptyStateComponent,
  ],
  providers: [CustomerListStore, CustomerListEffects],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  readonly store = inject(CustomerListStore);
  readonly effects = inject(CustomerListEffects);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly displayName = customerDisplayName;
  readonly columns = ['handle', 'name', 'email', 'company', 'created', 'action'];

  ngOnInit(): void {
    this.effects.load();

    // Restore search from URL on page refresh
    const initialQuery = this.route.snapshot.queryParamMap.get('search') ?? '';
    if (initialQuery) this.effects.search(initialQuery);
  }

  onSearchChange(query: string): void {
    this.effects.search(query);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: query || null },
      queryParamsHandling: 'merge',
    });
  }

  onClearSearch(): void {
    this.effects.clearSearch();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge',
    });
  }

  navigateToCustomer(handle: string): void {
    this.router.navigate(['/customers', handle]);
  }
}

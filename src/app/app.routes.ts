import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customer-list/customer-list.component').then(
        (m) => m.CustomerListComponent,
      ),
    title: 'Customers — Frisbii',
  },
  {
    path: 'customers/:handle',
    loadComponent: () =>
      import('./features/customers/customer-detail/customer-detail.component').then(
        (m) => m.CustomerDetailComponent,
      ),
    title: 'Customer Detail — Frisbii',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: '404 — Frisbii',
  },
];

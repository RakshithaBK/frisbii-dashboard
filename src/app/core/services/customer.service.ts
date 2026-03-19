import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiList } from '../models/api.model';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  getCustomers(size = 20, nextPageToken?: string): Observable<ApiList<Customer>> {
    let params = new HttpParams().set('size', size.toString());
    if (nextPageToken) {
      params = params.set('next_page_token', nextPageToken);
    }
    return this.http.get<ApiList<Customer>>(`${environment.apiBaseUrl}/list/customer`, { params });
  }

  getCustomer(handle: string): Observable<Customer> {
    return this.http
      .get<Customer>(`${environment.apiBaseUrl}/customer/${handle}`)
      .pipe(shareReplay(1));
  }

  getCustomerCount(): Observable<number> {
    const params = new HttpParams().set('size', '1').set('interval', 'P100Y');
    return this.http
      .get<ApiList<Customer>>(`${environment.apiBaseUrl}/list/customer`, { params })
      .pipe(map((list) => list.count));
  }
}

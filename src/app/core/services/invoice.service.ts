import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiList } from '../models/api.model';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);

  getInvoices(
    customerHandle: string,
    size = 20,
    nextPageToken?: string,
  ): Observable<ApiList<Invoice>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('interval', 'P100Y')
      .set('customer', customerHandle);
    if (nextPageToken) {
      params = params.set('next_page_token', nextPageToken);
    }
    return this.http.get<ApiList<Invoice>>(`${environment.apiBaseUrl}/list/invoice`, { params });
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${environment.apiBaseUrl}/invoice/${id}`).pipe(shareReplay(1));
  }
}

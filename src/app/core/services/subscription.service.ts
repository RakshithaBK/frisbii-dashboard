import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiList } from '../models/api.model';
import { Subscription, OnHoldRequest } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);

  getSubscriptions(
    customerHandle: string,
    size = 20,
    nextPageToken?: string,
  ): Observable<ApiList<Subscription>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('interval', 'P100Y')
      .set('customer', customerHandle);
    if (nextPageToken) {
      params = params.set('next_page_token', nextPageToken);
    }
    return this.http.get<ApiList<Subscription>>(`${environment.apiBaseUrl}/list/subscription`, {
      params,
    });
  }

  getSubscription(handle: string): Observable<Subscription> {
    return this.http
      .get<Subscription>(`${environment.apiBaseUrl}/subscription/${handle}`)
      .pipe(shareReplay(1));
  }

  putOnHold(handle: string, body: OnHoldRequest = {}): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${environment.apiBaseUrl}/subscription/${handle}/on_hold`,
      body,
    );
  }

  reactivate(handle: string): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${environment.apiBaseUrl}/subscription/${handle}/reactivate`,
      {},
    );
  }
}

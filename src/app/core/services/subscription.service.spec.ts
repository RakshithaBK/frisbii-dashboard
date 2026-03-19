import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../models/subscription.model';
import { ApiList } from '../models/api.model';
import { environment } from '../../../environments/environment';

const mockSub: Subscription = {
  handle: 'sub-001',
  state: 'active',
  plan: 'basic-monthly',
  customer: 'cust-001',
  created: '2024-02-01T09:00:00Z',
};

const mockList: ApiList<Subscription> = {
  count: 1,
  content: [mockSub],
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubscriptionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSubscriptions() should call list endpoint with customer param', () => {
    service.getSubscriptions('cust-001', 20).subscribe((list) => {
      expect(list.content[0].handle).toBe('sub-001');
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/list/subscription` &&
        r.params.get('customer') === 'cust-001' &&
        r.params.get('size') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('putOnHold() should POST to on_hold endpoint', () => {
    service.putOnHold('sub-001').subscribe((updated) => {
      expect(updated.state).toBe('on_hold');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/sub-001/on_hold`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockSub, state: 'on_hold' });
  });

  it('reactivate() should POST to reactivate endpoint', () => {
    service.reactivate('sub-001').subscribe((updated) => {
      expect(updated.state).toBe('active');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/sub-001/reactivate`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockSub, state: 'active' });
  });
});

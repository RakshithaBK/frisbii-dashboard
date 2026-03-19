import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InvoiceService } from './invoice.service';
import { Invoice } from '../models/invoice.model';
import { ApiList } from '../models/api.model';
import { environment } from '../../../environments/environment';

const mockInvoice: Invoice = {
  id: 'inv-abc123',
  handle: 'inv-001',
  state: 'settled',
  customer: 'cust-001',
  amount: 1999,
  currency: 'USD',
  created: '2024-03-10T12:00:00Z',
};

const mockList: ApiList<Invoice> = {
  count: 1,
  content: [mockInvoice],
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvoiceService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getInvoices() should call list endpoint with customer param', () => {
    service.getInvoices('cust-001', 20).subscribe((list) => {
      expect(list.content[0].id).toBe('inv-abc123');
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/list/invoice` &&
        r.params.get('customer') === 'cust-001' &&
        r.params.get('size') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('getInvoice() should fetch single invoice by id', () => {
    service.getInvoice('inv-abc123').subscribe((inv) => {
      expect(inv.state).toBe('settled');
      expect(inv.amount).toBe(1999);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/invoice/inv-abc123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoice);
  });

  it('getInvoices() should pass next_page_token when provided', () => {
    service.getInvoices('cust-001', 20, 'tok_123').subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/list/invoice` &&
        r.params.get('next_page_token') === 'tok_123',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });
});

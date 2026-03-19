import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { Customer } from '../models/customer.model';
import { ApiList } from '../models/api.model';
import { environment } from '../../../environments/environment';

const mockCustomer: Customer = {
  handle: 'cust-001',
  email: 'test@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  company: 'Acme Corp',
  created: '2024-01-15T10:00:00Z',
};

const mockList: ApiList<Customer> = {
  count: 42,
  content: [mockCustomer],
};

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomerService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCustomers() should call correct endpoint with size', () => {
    service.getCustomers(10).subscribe((list) => {
      expect(list.content.length).toBe(1);
      expect(list.content[0].handle).toBe('cust-001');
      expect(list.count).toBe(42);
    });

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/list/customer` && r.params.get('size') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('getCustomers() should pass next_page_token when provided', () => {
    service.getCustomers(20, 'tok_abc').subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/list/customer` &&
        r.params.get('next_page_token') === 'tok_abc',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('getCustomers() should not include next_page_token when not provided', () => {
    service.getCustomers(20).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/list/customer`);
    expect(req.request.params.has('next_page_token')).toBeFalse();
    req.flush(mockList);
  });

  it('getCustomer() should fetch a single customer by handle', () => {
    service.getCustomer('cust-001').subscribe((c) => {
      expect(c.handle).toBe('cust-001');
      expect(c.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/customer/cust-001`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCustomer);
  });
});

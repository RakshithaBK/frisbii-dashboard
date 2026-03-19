# Frisbii Subscription Management Dashboard

A production-grade Angular 21 dashboard for managing Frisbii customers, subscriptions, and invoices.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Copy the API key to environment file and fill in your key:

Open `src/environments/environment.ts` and replace `YOUR_PRIVATE_API_KEY_HERE` with your actual Frisbii private API key (starts with `priv_`):

> ⚠️ **Never commit your API key.**

### 3. Run the app

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200`.

### 4. Run tests

```bash
npm test
```

### 5. Format code

```bash
npm run format
```

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts         # Injects Basic auth header + global error handling
│   │   ├── models/
│   │   │   ├── api.model.ts                # ApiList<T>, ApiError
│   │   │   ├── customer.model.ts           # Customer interface + displayName helper
│   │   │   ├── subscription.model.ts       # Subscription interface, SubscriptionState const+type
│   │   │   └── invoice.model.ts            # Invoice interface, InvoiceState const+type
│   │   ├── services/
│   │   │   ├── customer.service.ts         # Customer API calls
│   │   │   ├── subscription.service.ts     # Subscription API calls (on_hold, reactivate)
│   │   │   ├── invoice.service.ts          # Invoice API calls
│   │   │   └── notification.service.ts     # Signal-based toast queue
│   │   └── utils/
│   │       └── api-error.util.ts           # Extracts human-readable message from Frisbii errors
│   ├── shared/
│   │   ├── components/
│   │   │   ├── breadcrumb/                 # Breadcrumb navigation (ts + html + scss)
│   │   │   ├── empty-state/                # Empty state placeholder (ts + html + scss)
│   │   │   ├── loading/                    # Skeleton loading rows (ts + html + scss)
│   │   │   ├── sidebar/                    # Navigation sidebar (ts + html + scss)
│   │   │   ├── state-badge/                # Coloured state pill (ts + html + scss)
│   │   │   └── toast/                      # Toast notification container (ts + html + scss)
│   │   └── pipes/
│   │       ├── f-date.pipe.ts              # Date formatting (short / long / relative)
│   │       └── f-currency.pipe.ts          # Minor-unit currency (cents → dollars)
│   ├── features/
│   │   ├── customers/
│   │   │   ├── store/                      # Feature-scoped state — NOT singletons
│   │   │   │   ├── customer-list.store.ts  # Signals only — customer list state
│   │   │   │   ├── customer-list.effects.ts# RxJS only — search, load more, retry
│   │   │   │   ├── customer-detail.store.ts# Signals only — customer/subs/invoices state
│   │   │   │   └── customer-detail.effects.ts # RxJS only — loads, actions, pagination
│   │   │   ├── customer-list/              # Searchable, paginated customer table
│   │   │   └── customer-detail/            # Customer info, subscriptions, invoices
│   │   └── not-found/                      # 404 page
│   ├── app.component.ts                    # Shell — sidebar + router-outlet
│   ├── app.config.ts                       # provideRouter, provideHttpClient, interceptors
│   └── app.routes.ts                       # Lazy-loaded routes
└── environments/
    ├── environment.ts                      # real API key goes here
    └── environment.prod.ts                 # for production
```

---

## Architecture Decisions

## Used Angular Material UI

### Store / Effects separation
Each feature has two service classes provided at component scope:

- **Store** — contains only `signal()` and `computed()`. Zero RxJS, zero HTTP. Acts as the single source of truth for UI state.
- **Effects** — contains only RxJS streams with `.subscribe()` exclusively in the constructor, ensuring `takeUntilDestroyed` always runs inside the injection context. No memory leaks.

Both are listed in the component's `providers: []` array — each navigation creates a fresh instance, destroyed automatically with the component.

### Why store/effects are in `features/`, not `core/`
`core/` is reserved for `providedIn: 'root'` app-wide singletons. Store and effects are component-scoped — putting them in `core/` would make them singletons and leak state between navigations.

### HTTP Interceptor for Auth
A functional `HttpInterceptorFn` attaches `Authorization: Basic <token>` to all Frisbii API requests. It also extracts the human-readable `error` field from Frisbii's error response body and surfaces it as a toast notification.

### Signals Throughout
All mutable state lives in `signal()`. Derived values use `computed()`. `toSignal()` bridges RxJS streams in the detail component. `effect()` handles side effects (resetting pagination on search change).

### Lazy-Loaded Routes
Both feature routes use `loadComponent()` — the initial bundle contains only the shell.
- **Query parameters** — search state is reflected in the URL. Refreshing the page keeps the search input.

### `withComponentInputBinding()`
Route parameters (`:handle`) are bound directly as `input.required<string>()` on the detail component — Also`ActivatedRoute` injected in customer list to hold seach queryParameter.

### SubscriptionState / InvoiceState as const + type
Both enums use the TypeScript `const` + `type` pattern so values are accessible at runtime (`SubscriptionState.on_hold`) while still providing full type safety.

### Optimistic UI for Subscription Actions
Pause and unpause apply state changes immediately via a `_subOverrides` signal, layered over the base data in the `allSubscriptions` computed signal. On API failure the override is reverted automatically.

### Currency Handling
Frisbii amounts are in minor units (cents). `FCurrencyPipe` divides by 100 before formatting with `Intl.NumberFormat`.

### Global Shared Styles
Shared utility classes (`.btn`, `.spinner`, `.handle`, `.date`, `.table`, `.skeleton`) are defined once in `styles.scss` and available globally — no `@use` imports needed in component SCSS files.

---

## Assumptions Made

- The Reepay/Frisbii list API uses `/v1/list/{resource}` (not `/v1/{resource}/list` as stated in the spec)
- The `handle=` query parameter on the list endpoint performs an exact match — partial handle search is not supported by the API.
- Amount fields are always in minor units (cents/pence), consistent with common payment API conventions.
- `next_page_token` is the pagination cursor returned in list responses.
- The `on_hold` + `reactivate` action flow is the intended Pause/Unpause mechanism.
- A `next_page_token` returned when all records fit in one page is treated as absent by comparing loaded count against the `count` field.

---

## Customer Search — Progressive Background Loading
The Frisbii API does not expose a partial-match or full-text search endpoint. The list endpoint only supports an exact handle= parameter, which means server-side search would fail for queries like "john" when the actual handle is "john-doe-corp".

## Three approaches were considered:

1. Server-side per keystroke - Fast - Exact match only - API calls on search
2. Load all then filter - Slow (waits for all pages)- Full partial match
3. Progressive background loading - Fast - Full partial match - No API calls

The chosen approach 3 works as follows:
Page 1 fetches immediately — the table renders with the first 20 records. The user sees data without waiting.
Remaining pages fetch silently in the background using RxJS expand(), which recursively requests the next page until no next_page_token is returned.
Search filters allCustomers() in memory via a computed() signal that reacts to both searchQuery and the growing customer list. No API calls are triggered on search.
Partial results shown during indexing — if the user searches before all pages are fetched, results from whatever has been indexed so far are shown immediately. A subtle mat-progress-bar and a dynamic label ("Search (40 indexed…)") communicate this state honestly.


---

## Features Implemented

- ✅ **HTTP interceptor** for authentication and centralised error handling
- ✅ **Toast notifications** for success/error feedback on all subscription actions
- ✅ **Optimistic UI** — subscription state flips instantly, reverts on API failure
- ✅ **Unit tests** for all four services using `HttpTestingController`
- ✅ **Load more pagination** on subscriptions, and invoices
- ✅ **Breadcrumb** navigation on detail page
- ✅ **Skeleton loading** UI for all tables and the customer card
- ✅ **404 page** for unmatched routes
- ✅ **Prettier** config with `npm run format` script
- ✅ **State badge visual indicators** with animated pulse on active subscriptions

---

## AI Usage

Claude (Anthropic) AI tool.

**What worked well:** Generating TypeScript interfaces, RxJS pipe chains, unit test scaffolds, component templates, and SCSS design systems.

**What required correction:** The initial API base URL was wrong (`/v1/customer/list` vs the real `/v1/list/customer`). Several architectural refactors were driven by developer feedback — splitting state into store/effects files, moving from inline component styles to `.scss` files, fixing CSS nesting issues in Angular's native CSS parser. Search technique analysis and selection of best match. signals and subscription optimization.

**Prompts used:**  RxJS stream patterns, store/effects architecture, SCSS refactoring, error handling, TypeScript const+type pattern, subscription memory leak fixes.
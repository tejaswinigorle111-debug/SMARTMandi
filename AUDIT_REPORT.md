# SMARTMandi PROJECT AUDIT REPORT

## 1. Executive Summary

SMARTMandi is a Vite + React + TypeScript frontend with a Python FastAPI backend, PostgreSQL/Supabase integration modules, official market-data adapters, authentication code, farmer/buyer domain services, migrations, and multilingual UI.

The repository had widespread merge-conflict remnants in source files. Those markers were removed while preserving the integrated live-data/authentication UI path. The frontend now passes TypeScript validation and production build. The backend imports, compiles, starts, and exposes the frontend-targeted route set.

The principal remaining production risks are external-service and database verification, incomplete live-data configuration, lack of automated tests, permissive diagnostic endpoints, browser token storage in localStorage, and unresolved unit semantics for non-kilogram farmer listings. No claim is made that live credentials or database-backed workflows work because those external dependencies were unavailable during this audit.

## 2. Project Structure

```text
.
├── index.html
├── package.json / package-lock.json
├── README.md
├── tsconfig.json / vite.config.ts
├── .env.example / .env
├── public/logo.jpg
├── src
│   ├── App.tsx, main.tsx, index.css, types.ts
│   ├── components
│   ├── services: api.ts, auth.ts, buyer.ts, farmer.ts
│   ├── data/demoMarkets.ts
│   ├── utils/translations.ts
│   └── assets/images
└── Backend
    ├── main.py
    ├── auth.py, buyer.py, farmer.py
    ├── gov_data.py, market_data.py, market_comparison.py
    ├── location.py, location_service.py
    ├── database.py, supabase_rest.py, ai_service.py
    ├── data/markets.py
    ├── migrations/*.sql
    └── .env.example / .env
```

## 3. Frontend Status

| Area | Status | Issues | Action |
|---|---|---|---|
| React/Vite startup | PASS | No startup syntax errors | Conflict markers removed |
| TypeScript | PASS | No `tsc` errors | Verified with `npm run lint` |
| Production build | PASS | Rollup warns about chunks over 500 kB | Documented as performance risk |
| Authentication UI | WIRED | Requires database-backed backend routes | Routes registered |
| Farmer dashboard | WIRED | Requires PostgreSQL schema and session | Routes registered |
| Buyer marketplace | WIRED | Requires PostgreSQL schema and session | Routes registered |
| Location UI | WIRED | External geocoding/routing availability unverified | Missing endpoints added |
| Market results | PARTIAL | Live source requires valid data.gov.in configuration | Unavailable state is returned instead of fake prices |
| Charts | PARTIAL | Trend chart intentionally shows unavailable state | No fake historical prices displayed |
| Translations | PRESENT | English, Telugu, Hindi, Marathi exist; hardcoded labels remain in some components | Retained valid translation files |
| Accessibility/responsiveness | UNVERIFIED | No browser automation or mobile screenshot run | Requires Playwright/manual QA |

## 4. Backend Status

| Area | Status | Issues | Action |
|---|---|---|---|
| FastAPI import | PASS | None observed | Verified |
| Backend syntax | PASS | None after conflict cleanup | `python -m compileall Backend` |
| Server startup | PASS | Requires launching from `Backend/` | Smoke-tested on port 8010 |
| Health endpoint | PASS | Returns healthy | Smoke-tested |
| Authentication routes | REGISTERED | Database unavailable in this environment | Registered existing auth implementations |
| Farmer routes | REGISTERED | Database unavailable in this environment | Registered existing farmer implementations |
| Buyer routes | REGISTERED | Database unavailable in this environment | Registered existing buyer implementations |
| Location routes | REGISTERED | External providers unverified | Added resolve and distance endpoints |
| Market prices | PARTIAL | Requires valid data.gov.in key/resource/unit | Uses configured official adapter for `/markets` |
| Recommendation | PARTIAL | Active path requires live market records and external geocoding | No fake fallback is advertised |
| CORS | IMPROVED | Production origin policy still needs deployment-specific values | Reads `CORS_ORIGINS` instead of `*` |

## 5. API Status

| API | Status | Problem | Action |
|---|---|---|---|
| `GET /health` | PASS | None | Verified live |
| `GET /location/reverse` | PASS | External geocoding unverified | Existing route retained |
| `GET /location/resolve` | FIXED | Frontend called a missing route | Added route using configured geocoding providers |
| `GET /location/distance` | FIXED | Frontend called a missing route | Added Haversine/optional road-distance route |
| `GET /markets` | FIXED | Existing route bypassed configurable market adapter | Uses `MarketDataService` and explicit data state |
| `POST /recommend` | PARTIAL | Requires live data and valid credentials | Existing live-only behavior retained |
| `POST /auth/register` | FIXED | Route was absent | Registered existing implementation |
| `POST /auth/login` | FIXED | Route was absent | Registered existing implementation |
| `GET /auth/me` | FIXED | Route was absent | Registered existing implementation |
| `POST /auth/logout` | FIXED | Route was absent | Registered existing implementation |
| `/farmer/*` | FIXED | Routes were absent | Registered existing implementations |
| `/buyer/*` | FIXED | Routes were absent | Registered existing implementations |
| `/db-health` | UNVERIFIED | Needs PostgreSQL | Endpoint exists; external dependency unavailable |
| `/supabase-health` | UNVERIFIED | Needs Supabase credentials | Endpoint exists; external dependency unavailable |
| `/government-data-health` | UNVERIFIED | Needs valid data.gov.in credentials | Endpoint exists; external dependency unavailable |

## 6. Database Status

Migrations define users, roles, sessions, farmers, buyers, markets, prices, listings, offers, orders, payments, logistics, reviews, notifications, and related constraints.

Database connectivity and migrations could not be verified because no usable `DATABASE_URL` was available. No seed/demo records are inserted by the inspected migrations. The following data-integrity risks remain:

- `create_listing()` stores the entered quantity directly as `quantity_kg` for every unit.
- Updating a listing changes `quantity_value` but does not consistently recalculate `quantity_kg`.
- `get_listing()` searches only the first 100 results in memory.
- Schema compatibility between legacy listing fields and newer fields requires a real migration run.

Status: **UNVERIFIED — external database unavailable.**

## 7. Duplicate Files

### Logo assets

```text
FILE A: public/logo.jpg
FILE B: src/assets/images/smartmandi_logo_1788515902109.jpg
TYPE: Exact binary duplicate
WHY DUPLICATE: SHA-256 hashes match
USED BY: index.html/favicon uses public asset; React components import source asset
RECOMMENDATION: KEEP both unless the favicon is migrated to the Vite asset
ACTION TAKEN: Neither removed because both have distinct consumers
```

No other exact duplicate was proven from the available inventory. Similar service names are separate implementations with different responsibilities, so they were not blindly merged.

## 8. Removed Files

None. No file met the standard for safe removal during this audit.

## 9. Files Kept

- `src/data/demoMarkets.ts`: crop names, labels, categories, units, and icons are static reference metadata, not claimed live prices.
- `Backend/data/markets.py`: static records are retained as backend reference data, but the active recommendation path does not present them as live data.
- `Backend/market_data.py`: retained because it implements explicit live/cached/unavailable states and is now used by `/markets`.
- `PriceTrendChart.tsx`: retained because it honestly renders an unavailable state rather than inventing historical prices.
- `BestSellingWindow.tsx`: retained as an explicitly unavailable/coming-soon feature.
- `public/logo.jpg`: retained for the HTML favicon consumer.
- `@google/genai`, `express`, and other packages: not removed during this pass without a complete deployment/import review.

## 10. Files Merged

- Merge-conflict content was reconciled across frontend, backend, configuration, and README files.
- Existing auth, buyer, farmer, and location service implementations were connected through `Backend/main.py` rather than duplicated.
- The configurable `MarketDataService` was connected to `/markets` instead of maintaining a second market-price response path.

## 11. Errors Found

| Severity | Location | Error | Fix |
|---|---|---|---|
| CRITICAL | Many source files | Git conflict markers caused JSX/TypeScript/Python parse failures | Removed conflict markers and retained the integrated path |
| CRITICAL | `Backend/main.py` | Frontend auth, farmer, buyer, and location routes were absent | Registered existing implementations and added location handlers |
| HIGH | `Backend/main.py` / `Backend/gov_data.py` | Market path could return no records without an origin and ignored configurable adapter fields | `/markets` now uses `MarketDataService`; recommendation remains live-only |
| HIGH | `Backend/main.py` | Wildcard CORS with credentials | Reads configured `CORS_ORIGINS` |
| HIGH | `Backend/farmer.py` | Listing response indexes did not match SELECT order | Corrected row mapping and regression-tested it |
| MEDIUM | `Backend/farmer.py` | Quantity unit conversion is incomplete for quintals/tonnes/piece/crate | Documented as remaining risk |
| MEDIUM | `src/services/auth.ts` | Bearer token stored in localStorage | Documented security risk; requires a broader auth/storage design decision |
| LOW | `package.json` | `clean` uses `rm -rf`, which is not native PowerShell syntax | Documented; not changed during this pass |

## 12. Mock/Fake/Temporary Data

| Location | Purpose | Production-visible? | Classification | Action |
|---|---|---|---|---|
| `src/data/demoMarkets.ts` | Crop metadata | Yes | Legitimate static reference data | Kept |
| `Backend/data/markets.py` | Local market reference records | Not on active recommendation path | Static fallback/reference data | Kept but not presented as live |
| `src/components/PriceTrendChart.tsx` | Historical trend panel | Yes | Honest unavailable state | Kept |
| `src/components/BestSellingWindow.tsx` | Selling-window panel | Yes | Coming-soon/unavailable feature | Kept and clearly labeled |
| `src/components/MapRouteView.tsx` | Route visualization | Yes | Visual route summary, not a map provider | Requires clearer product labeling if marketed as navigation |
| `src/components/PriceComparisonChart.tsx` | Current recommendation comparison | Yes | Derived from API response, but translation labels include “sample” wording | Requires wording cleanup in a future UI pass |
| `Backend/gov_data.py` | `_fallback_markets()` | No, currently unused | Dead fallback function | Retained pending explicit fallback policy |

No fabricated market price was deliberately added by this audit.

## 13. Real Data Verification

| Source/feature | Status | Evidence |
|---|---|---|
| Government mandi prices | UNVERIFIED | Code calls `data.gov.in`; valid credentials/resource schema were unavailable |
| Market price normalization | VERIFIED in code, UNVERIFIED against live schema | `MarketDataService` supports INR/quintal and INR/kg |
| Reverse geocoding | VERIFIED in code, UNVERIFIED externally | Google fallback plus Nominatim implementation exists |
| Manual geocoding | VERIFIED in code, UNVERIFIED externally | Google fallback plus Open-Meteo implementation exists |
| Distance | VERIFIED in code | Haversine formula is implemented; Google Routes is optional |
| Buyer data | NOT VERIFIED | Requires PostgreSQL and authenticated records |
| Farmer data | NOT VERIFIED | Requires PostgreSQL and authenticated records |
| Database records | NOT VERIFIED | No usable database connection |
| Price/profit calculations | PARTIAL | Active recommendation uses price, quantity, distance, and transport rate; full fee model is not active in `/recommend` |
| AGMARKNET | NOT IMPLEMENTED | No AGMARKNET-specific client or key is used |

## 14. Security Findings

- Local credential-like values were found in `Backend/.env` during the audit. They were removed and replaced with blank placeholders. Their validity and exposure history are unknown; rotate them if they were real or shared.
- `.env` and `Backend/.env` are ignored by `.gitignore`; `.env.example` files contain placeholders only.
- Authentication uses salted `hashlib.scrypt` password hashes and hashed session tokens.
- Frontend sessions use `localStorage`, which increases token exposure if an XSS vulnerability is introduced.
- No rate limiting, lockout, password reset, email/phone verification, or audit logging was verified.
- Diagnostic endpoints are public and may disclose operational status.
- CORS was changed from wildcard origins to configured origins; deployment values still need review.
- User input is parameterized in the inspected SQL queries, but dynamic update-column construction should remain constrained to validated Pydantic fields.

## 15. Performance Findings

- Production build succeeds but emits a warning for JavaScript chunks above 500 kB.
- Several large JPEG assets are bundled; image optimization or responsive formats could reduce load time.
- No browser performance profile was run.
- No unnecessary API polling or infinite effect loop was observed in the inspected active path.
- Market and geocoding caches exist in backend services, but cache behavior was not tested against live traffic.

## 16. Dependency Findings

`npm install` completed successfully but `npm audit` reports three moderate vulnerabilities through the Express/body-parser/qs dependency chain. No automatic upgrade was applied because the audit did not establish whether the unused Express dependency is required by deployment tooling.

Potentially unused or unverified packages include Express, `@google/genai`, and some server-side tooling. They should be removed only after checking deployment scripts and historical runtime usage.

## 17. Build/Test Results

```text
npm install: PASS
npm run lint: PASS
npm run build: PASS
python -m compileall Backend: PASS
Backend startup: PASS
Backend /health smoke test: PASS
OpenAPI route registration: PASS
Database startup/connectivity: UNVERIFIED — external dependency unavailable
Government API: UNVERIFIED — credentials/resource unavailable
Supabase API: UNVERIFIED — credentials unavailable
Browser/mobile UI test: UNVERIFIED — no Playwright/browser test run
Automated test suite: NOT IMPLEMENTED — no test files found
```

The production build still reports a non-blocking large-chunk warning.

## 18. Remaining Issues

1. Configure and verify `DATA_GOV_API_KEY`, `DATA_GOV_RESOURCE_ID`, and `DATA_GOV_PRICE_UNIT` against the selected official dataset.
2. Apply database migrations to a real PostgreSQL instance and test registration, login, listings, offers, orders, and reviews.
3. Decide whether tokens should move from localStorage to a more resilient session strategy.
4. Add rate limiting and account protection to authentication endpoints.
5. Restrict public diagnostic endpoints in production.
6. Complete unit conversion for farmer listings and keep `quantity_kg` synchronized on updates.
7. Add backend and frontend automated tests, including contract tests for every API call.
8. Validate live data fields, freshness, source display, and error behavior with real data.gov.in responses.
9. Clarify or rename UI labels containing “sample” or “verified” where they do not describe a verified source.
10. Run Playwright or equivalent desktop/mobile regression tests.
11. Review and remediate the three moderate npm advisories.
12. Consider code-splitting and image optimization for the production bundle.

## 19. Final Project Health Score

| Area | Score | Explanation |
|---|---:|---|
| Frontend | 7/10 | Builds and type-checks; core screens exist, but browser regression coverage is absent |
| Backend | 6/10 | Starts and routes are now wired; database-backed workflows remain unverified |
| API | 6/10 | Frontend contracts now have registered routes, but live external responses are unverified |
| Database | 4/10 | Migrations and SQL modules exist, but no real connection/test was available |
| Security | 5/10 | Password/session foundations are reasonable; localStorage tokens, diagnostics, and rate limiting remain concerns |
| Data Reliability | 5/10 | Official-source adapter and honest unavailable states exist; credentials/schema/freshness are unverified |
| Code Quality | 6/10 | Conflict cleanup and a confirmed row-mapping bug were fixed; duplicated/legacy paths remain |
| Performance | 6/10 | Build passes; large chunks and unoptimized images remain |
| Maintainability | 6/10 | Clear domain modules and migrations exist; active and inactive service paths need consolidation |
| Overall | 5.7/10 | A functional, buildable foundation with important external-integration, security, and test gaps before production use |

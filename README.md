# SMARTMandi

Farmer-focused market decision support: compare nearby mandi prices, distance, and transport costs using official **data.gov.in** market data.

## Run locally

**Prerequisites:** Node.js and Python 3.11+

1. Install frontend dependencies: `npm install`
2. Install backend dependencies:
   `pip install -r Backend/requirements.txt`
3. Copy `Backend/.env.example` to `Backend/.env` and set:
   - `DATA_GOV_API_KEY` (from https://data.gov.in/)
   - `DATA_GOV_RESOURCE_ID` (default is the daily mandi price resource)
   - `DATA_GOV_PRICE_UNIT` (`INR/quintal` or `INR/kg`)
   - Cost params (`TRANSPORT_RATE_PER_KM_PER_KG`, etc.)
4. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the API is not on port 8000.
5. Run both: `npm run start`

Open the frontend at http://localhost:3000. API at http://127.0.0.1:8000.

## Accurate live data

- `/markets` and `/recommend` both use `MarketDataService` + the same `DATA_GOV_*` env config.
- Recommendations use `compare_markets` (transport, storage, platform fee) and grounded `ai_service` intelligence.
- If the live API is missing or fails, the API reports **unavailable** instead of inventing prices.
- Optional `GOOGLE_MAPS_API_KEY` improves geocoding and road distance.
- Never commit `Backend/.env` — rotate any key that was previously pushed to git.

## Useful health checks

- `GET /health`
- `GET /government-data-health`
- `GET /db-health` (when `DATABASE_URL` is set)

## Transaction enablement

After the initial platform migrations, apply `Backend/migrations/004_transaction_enablement.sql` to enable buyer demand, structured quality inspections, offer decisions and counteroffers, shipment assignment, warehouse bookings, payment transitions, disputes, immutable transaction events, and realized-profit records.

The authenticated API routes are available under `/buyer/demands`, `/farmer/offers`, `/listings/{id}/quality-inspections`, `/orders/{id}/shipments`, `/warehouses/bookings`, `/payments/{id}/transition`, `/orders/{id}/disputes`, `/audit`, and `/farmer/orders/{id}/profit`.

Apply `Backend/migrations/005_marketplace_growth.sql` next to enable buyer verification documents, FPO pooled lots and farmer settlements, demand-to-listing matching, and market-alert records. SMS, WhatsApp, email, and payment-provider delivery require provider credentials and webhooks; the database stores their delivery and provider-reference states without exposing secrets in the frontend.

Apply `Backend/migrations/006_warehouse_operations.sql` after that to enable warehouse-manager booking approval, live inventory capacity, receiving, location movement, spoilage reporting, and partial or complete stock release tracking.

Apply `Backend/migrations/007_buyer_registration_requests.sql` to persist public buyer-registration requests for admin review. The frontend submits these requests to `POST /buyer/registration-requests` with a `PENDING` status.

Keep `.env` and `Backend/.env` local. If either file was ever committed, remove it from Git tracking and rotate every credential inside it before deployment.

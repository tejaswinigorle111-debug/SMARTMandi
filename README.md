<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6ee88a87-de42-446a-9768-0272960f96a4

## Run Locally

**Prerequisites:** Node.js and Python 3.11+


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the backend is not on port 8000.
3. Add `DATA_GOV_API_KEY` to `Backend/.env` (plus Supabase values if those health checks are needed).
4. Run both app and API:
   `npm run start`

Open the frontend at `http://localhost:3000`. The backend API is available at `http://127.0.0.1:8000`.

The API requests live Maharashtra mandi prices from data.gov.in when `DATA_GOV_API_KEY` is configured. If that service is unavailable, it returns the bundled local market data so the recommendation flow remains usable.

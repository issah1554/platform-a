# Platform A

Simulated market-data API returning commodity prices with TZS and corresponding USD values.

## Endpoints

- `GET /api/prices`
- `GET /api/health`

## Local Development

```bash
npm install
npm run dev
```

Then call:

```bash
curl http://localhost:3001/api/prices
curl http://localhost:3001/api/health
curl "http://localhost:3001/api/wfp-prices?commodity=Maize&limit=20"
```

## Deploying to Vercel

Deploy this folder as an independent Vercel project:

```bash
vercel
```

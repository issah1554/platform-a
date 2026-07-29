# Platform A

Simulated market-data API returning commodity prices in USD.

## Endpoints

- `GET /api/prices`
- `GET /api/health`

## Local Development

```bash
npm install
npm run dev -- --port 3101
```

Then call:

```bash
curl http://localhost:3101/api/prices
curl http://localhost:3101/api/health
```

## Deploying to Vercel

Deploy this folder as an independent Vercel project:

```bash
vercel
```

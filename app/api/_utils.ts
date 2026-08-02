import { NextResponse } from "next/server";

export const TZS_PER_USD = 2600;

export const commodities = [
  { symbol: "MAIZE", basePrice: 42.5, volume: 1200, market: "Dar Es Salaam", priceDate: "2026-07-29" },
  { symbol: "RICE", basePrice: 55.2, volume: 900, market: "Arusha (urban)", priceDate: "2026-07-30" },
  { symbol: "WHEAT", basePrice: 38.7, volume: 1500, market: "Dodoma", priceDate: "2026-07-31" },
  { symbol: "COCOA", basePrice: 74.9, volume: 650, market: "Mbeya", priceDate: "2026-08-01" },
  { symbol: "COFFEE", basePrice: 68.4, volume: 820, market: "Moshi", priceDate: "2026-08-02" }
] as const;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export function withCors<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers
    }
  });
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function toTzs(usdPrice: number) {
  return Number((usdPrice * TZS_PER_USD).toFixed(2));
}

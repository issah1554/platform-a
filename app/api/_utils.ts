import { NextResponse } from "next/server";

export const commodities = [
  { symbol: "MAIZE", basePrice: 42.5, volume: 1200 },
  { symbol: "RICE", basePrice: 55.2, volume: 900 },
  { symbol: "WHEAT", basePrice: 38.7, volume: 1500 },
  { symbol: "COCOA", basePrice: 74.9, volume: 650 },
  { symbol: "COFFEE", basePrice: 68.4, volume: 820 }
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

export function randomPrice(basePrice: number) {
  const change = 1 + (Math.random() - 0.5) * 0.08;
  return Number((basePrice * change).toFixed(2));
}

import { commodities, optionsResponse, randomPrice, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export function GET() {
  const timestamp = new Date().toISOString();

  return withCors({
    platform: "Platform A",
    currency: "USD",
    items: commodities.map((commodity) => ({
      symbol: commodity.symbol,
      price: randomPrice(commodity.basePrice),
      volume: Math.round(commodity.volume * (1 + (Math.random() - 0.5) * 0.12)),
      timestamp
    }))
  });
}

export function OPTIONS() {
  return optionsResponse();
}

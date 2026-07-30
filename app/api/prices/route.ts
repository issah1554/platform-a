import { commodities, optionsResponse, randomPrice, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export function GET() {
  const timestamp = new Date().toISOString();

  return withCors({
    platform: "Platform A",
    currencies: ["TZS", "USD"],
    items: commodities.map((commodity) => {
      const priceUsd = randomPrice(commodity.basePrice);

      return {
        symbol: commodity.symbol,
        price_tzs: toTzs(priceUsd),
        price_usd: priceUsd,
        volume: Math.round(commodity.volume * (1 + (Math.random() - 0.5) * 0.12)),
        timestamp
      };
    })
  });
}

export function OPTIONS() {
  return optionsResponse();
}

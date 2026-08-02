import { commodities, optionsResponse, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export function GET() {
  const timestamp = new Date().toISOString();

  return withCors({
    platform: "Platform A",
    currencies: ["TZS", "USD"],
    items: commodities.map((commodity) => {
      const priceUsd = commodity.basePrice;

      return {
        symbol: commodity.symbol,
        price_tzs: toTzs(priceUsd),
        price_usd: priceUsd,
        volume: commodity.volume,
        market: commodity.market,
        price_date: commodity.priceDate,
        timestamp
      };
    })
  });
}

export function OPTIONS() {
  return optionsResponse();
}

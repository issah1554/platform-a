import { PRICE_DATE, commodities, optionsResponse, toTzs, withCors } from "../_utils";

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
        price_date: PRICE_DATE,
        timestamp
      };
    })
  });
}

export function OPTIONS() {
  return optionsResponse();
}

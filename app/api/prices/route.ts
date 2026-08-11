import { supabase, isSupabaseConfigured } from "../../../lib/supabase";
import { commodities, optionsResponse, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return withCors({
          platform: "Platform A",
          source: "Supabase DB (platform-a)",
          currencies: ["TZS", "USD"],
          items: data.map((item) => ({
            symbol: item.symbol,
            price_tzs: Number(item.price_tzs),
            price_usd: Number(item.price_usd),
            volume: Number(item.volume ?? 0),
            market: item.market,
            price_date: item.price_date,
            timestamp
          }))
        });
      }
    } catch (err) {
      console.error("Platform A Supabase fetch error:", err);
    }
  }

  // Fallback to local mock data if Supabase is not configured or returns no rows
  return withCors({
    platform: "Platform A",
    source: "Mock Data (fallback)",
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

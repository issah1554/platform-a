import { supabase, isSupabaseConfigured } from "../../../lib/supabase";
import { commodities, optionsResponse, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

interface LocalPriceItem {
  id: string;
  commodity_symbol: string;
  price_tzs: number;
  price_usd: number;
  trade_volume: number;
  market_name: string;
  price_date: string;
}

let localItems: LocalPriceItem[] = commodities.map((c, index) => ({
  id: `local-a-${index + 1}`,
  commodity_symbol: c.symbol,
  price_tzs: toTzs(c.basePrice),
  price_usd: c.basePrice,
  trade_volume: c.volume,
  market_name: c.market,
  price_date: c.priceDate
}));

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 2500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Supabase query timeout")), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const query = supabase
        .from("platform_a_prices")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await withTimeout(query, 2500);

      if (!error && data && data.length > 0) {
        return withCors({
          platform: "Platform A",
          source: "Supabase DB (platform_a_prices)",
          currencies: ["TZS", "USD"],
          items: data.map((item: any) => ({
            id: item.id,
            commodity_symbol: item.commodity_symbol ?? item.symbol ?? "MAIZE",
            price_tzs: Number(item.price_tzs),
            price_usd: Number(item.price_usd),
            trade_volume: Number(item.trade_volume ?? item.volume ?? 0),
            market_name: item.market_name ?? item.market ?? "Dar Es Salaam",
            price_date: item.price_date,
            timestamp
          }))
        });
      }
    } catch (err) {
      console.warn("Platform A Supabase query fallback triggered:", err);
    }
  }

  return withCors({
    platform: "Platform A",
    source: "Local Memory (Platform A)",
    currencies: ["TZS", "USD"],
    items: localItems.map((item) => ({
      ...item,
      timestamp
    }))
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { commodity_symbol, price_usd, price_tzs, trade_volume, market_name, price_date } = body;

    const usdVal = Number(price_usd ?? 0);
    const tzsVal = Number(price_tzs ?? toTzs(usdVal));
    const volumeVal = Number(trade_volume ?? 0);
    const dateVal = price_date || new Date().toISOString().split("T")[0];
    const symbolVal = String(commodity_symbol || "CROP").toUpperCase();
    const marketVal = String(market_name || "Dar Es Salaam");

    let createdRecord = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from("platform_a_prices")
          .insert({
            commodity_symbol: symbolVal,
            price_usd: usdVal,
            price_tzs: tzsVal,
            trade_volume: volumeVal,
            market_name: marketVal,
            price_date: dateVal
          })
          .select("*")
          .single();

        const { data, error } = await withTimeout(query, 2500);
        if (!error && data) {
          createdRecord = data;
        }
      } catch (err) {
        console.warn("Supabase insert timeout or error:", err);
      }
    }

    if (!createdRecord) {
      createdRecord = {
        id: `local-a-${Date.now()}`,
        commodity_symbol: symbolVal,
        price_usd: usdVal,
        price_tzs: tzsVal,
        trade_volume: volumeVal,
        market_name: marketVal,
        price_date: dateVal
      };
      localItems.unshift(createdRecord);
    }

    return withCors({ success: true, item: createdRecord }, { status: 201 });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return withCors({ success: false, error: "Missing 'id' parameter" }, { status: 400 });
    }

    let updatedRecord = null;

    if (isSupabaseConfigured && supabase && !id.startsWith("local-a-")) {
      try {
        const query = supabase
          .from("platform_a_prices")
          .update({
            commodity_symbol: body.commodity_symbol,
            price_usd: Number(body.price_usd),
            price_tzs: Number(body.price_tzs),
            trade_volume: Number(body.trade_volume),
            market_name: body.market_name,
            price_date: body.price_date,
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select("*")
          .single();

        const { data, error } = await withTimeout(query, 2500);
        if (!error && data) {
          updatedRecord = data;
        }
      } catch (err) {
        console.warn("Supabase update timeout or error:", err);
      }
    }

    const idx = localItems.findIndex((item) => item.id === id);
    if (idx !== -1) {
      localItems[idx] = {
        ...localItems[idx],
        ...body,
        price_usd: Number(body.price_usd ?? localItems[idx].price_usd),
        price_tzs: Number(body.price_tzs ?? localItems[idx].price_tzs),
        trade_volume: Number(body.trade_volume ?? localItems[idx].trade_volume)
      };
      updatedRecord = localItems[idx];
    }

    return withCors({ success: true, item: updatedRecord || body });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return withCors({ success: false, error: "Missing 'id' parameter" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase && !id.startsWith("local-a-")) {
      try {
        await withTimeout(supabase.from("platform_a_prices").delete().eq("id", id), 2500);
      } catch (err) {
        console.warn("Supabase delete timeout or error:", err);
      }
    }

    localItems = localItems.filter((item) => item.id !== id);

    return withCors({ success: true, deletedId: id });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export function OPTIONS() {
  return optionsResponse();
}

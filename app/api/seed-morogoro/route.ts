import { readFile } from "node:fs/promises";
import path from "node:path";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";
import { optionsResponse, withCors } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const TZS_PER_USD = 2600;
const BATCH_SIZE = 500;

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function toNum(val: string): number {
  const n = Number(val);
  return isFinite(n) ? n : 0;
}

export async function POST() {
  if (!isSupabaseConfigured || !supabase) {
    return withCors(
      { success: false, error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY." },
      { status: 503 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "data", "morogoro_rice_beans_updated.csv");
    const csv = await readFile(filePath, "utf8");
    const lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
    const [headerLine, ...dataLines] = lines;
    const headers = parseCSVLine(headerLine);

    const colIdx = (name: string) => headers.indexOf(name);
    const iDate = colIdx("date");
    const iMarket = colIdx("market");
    const iCommod = colIdx("commodity");
    const iPrice = colIdx("price");

    let inserted = 0;
    let errors = 0;

    for (let start = 0; start < dataLines.length; start += BATCH_SIZE) {
      const chunk = dataLines.slice(start, start + BATCH_SIZE);
      const rows = chunk
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          const cols = parseCSVLine(line);
          const priceTzs = toNum(cols[iPrice]);

          return {
            commodity_symbol: String(cols[iCommod] || "CROP").trim().toUpperCase(),
            price_usd: priceTzs > 0 ? Number((priceTzs / TZS_PER_USD).toFixed(4)) : 0,
            price_tzs: priceTzs,
            trade_volume: 0,
            market_name: cols[iMarket],
            price_date: cols[iDate]
          };
        });

      if (rows.length === 0) continue;

      const { error } = await supabase
        .from("platform_a_prices")
        .insert(rows);

      if (error) {
        console.error(`Batch ${start}-${start + BATCH_SIZE} error:`, error.message);
        errors += rows.length;
      } else {
        inserted += rows.length;
      }
    }

    return withCors({
      success: true,
      total_rows: dataLines.filter((line) => line.trim()).length,
      inserted,
      errors,
      table: "platform_a_prices",
      message: `Seeding complete. ${inserted} rows inserted into platform_a_prices.`
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return withCors({ success: false, error: err.message }, { status: 500 });
  }
}

export function OPTIONS() {
  return optionsResponse();
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { optionsResponse, withCors } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type WfpPriceRow = {
  date: string;
  admin1: string;
  admin2: string;
  market: string;
  market_id: number;
  latitude: number;
  longitude: number;
  category: string;
  commodity: string;
  commodity_id: number;
  unit: string;
  priceflag: string;
  pricetype: string;
  currency: string;
  price: number;
  usdprice: number;
};

let cachedRows: WfpPriceRow[] | null = null;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
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

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function loadRows() {
  if (cachedRows) {
    return cachedRows;
  }

  const filePath = path.join(process.cwd(), "data", "wfp_food_prices_tza.csv");
  const csv = await readFile(filePath, "utf8");
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  cachedRows = lines.map((line) => {
    const values = parseCsvLine(line);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

    return {
      date: record.date,
      admin1: record.admin1,
      admin2: record.admin2,
      market: record.market,
      market_id: toNumber(record.market_id),
      latitude: toNumber(record.latitude),
      longitude: toNumber(record.longitude),
      category: record.category,
      commodity: record.commodity,
      commodity_id: toNumber(record.commodity_id),
      unit: record.unit,
      priceflag: record.priceflag,
      pricetype: record.pricetype,
      currency: record.currency,
      price: toNumber(record.price),
      usdprice: toNumber(record.usdprice)
    };
  });

  return cachedRows;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get("commodity")?.toLowerCase();
  const market = searchParams.get("market")?.toLowerCase();
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 1000);

  const rows = await loadRows();
  const filteredRows = rows
    .filter((row) => !commodity || row.commodity.toLowerCase() === commodity)
    .filter((row) => !market || row.market.toLowerCase() === market)
    .slice(0, limit);

  return withCors({
    source: "WFP Food Prices Tanzania",
    count: filteredRows.length,
    data: filteredRows
  });
}

export function OPTIONS() {
  return optionsResponse();
}

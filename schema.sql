-- Platform A Supabase Database Schema for Commodity Market Data

-- 1. Create table platform_a_prices
CREATE TABLE IF NOT EXISTS public.platform_a_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commodity_symbol TEXT NOT NULL,
    price_usd NUMERIC NOT NULL,
    price_tzs NUMERIC NOT NULL,
    trade_volume NUMERIC DEFAULT 0,
    market_name TEXT NOT NULL,
    price_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.platform_a_prices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for public access (read, insert, update, delete)
CREATE POLICY "Allow public read access" 
ON public.platform_a_prices FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.platform_a_prices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.platform_a_prices FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.platform_a_prices FOR DELETE 
USING (true);

-- 4. Seed initial market prices for Platform A
INSERT INTO public.platform_a_prices (commodity_symbol, price_usd, price_tzs, trade_volume, market_name, price_date)
VALUES 
    ('MAIZE', 42.50, 110500.00, 1200, 'Dar Es Salaam', '2026-07-29'),
    ('RICE',  55.20, 143520.00,  900, 'Arusha (urban)', '2026-07-30'),
    ('WHEAT', 38.70, 100620.00, 1500, 'Dodoma',        '2026-07-31'),
    ('COCOA', 74.90, 194740.00,  650, 'Mbeya',         '2026-08-01'),
    ('COFFEE',68.40, 177840.00,  820, 'Moshi',         '2026-08-02')
ON CONFLICT DO NOTHING;

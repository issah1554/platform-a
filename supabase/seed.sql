-- Platform A Initial Seed Data
-- Populate initial commodity market prices into platform_a_prices

INSERT INTO public.platform_a_prices (commodity_symbol, price_usd, price_tzs, trade_volume, market_name, price_date)
VALUES 
    ('MAIZE', 42.50, 110500.00, 1200, 'Dar Es Salaam', '2026-07-29'),
    ('RICE',  55.20, 143520.00,  900, 'Arusha (urban)', '2026-07-30'),
    ('WHEAT', 38.70, 100620.00, 1500, 'Dodoma',        '2026-07-31'),
    ('COCOA', 74.90, 194740.00,  650, 'Mbeya',         '2026-08-01'),
    ('COFFEE',68.40, 177840.00,  820, 'Moshi',         '2026-08-02')
ON CONFLICT DO NOTHING;

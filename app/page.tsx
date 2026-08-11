"use client";

import { useEffect, useState } from "react";

interface PriceItem {
  id: string;
  commodity_symbol: string;
  price_tzs: number;
  price_usd: number;
  trade_volume: number;
  market_name: string;
  price_date: string;
  timestamp?: string;
}

export default function PlatformADashboard() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceInfo, setSourceInfo] = useState({ platform: "Platform A", source: "Loading..." });
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("ALL");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [formData, setFormData] = useState({
    commodity_symbol: "MAIZE",
    price_usd: "45.0",
    price_tzs: "117000",
    trade_volume: "1000",
    market_name: "Dar Es Salaam",
    price_date: new Date().toISOString().split("T")[0]
  });

  // API Playground State
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
      setSourceInfo({
        platform: data.platform || "Platform A",
        source: data.source || "Local Memory"
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      commodity_symbol: "MAIZE",
      price_usd: "45.0",
      price_tzs: (45.0 * 2600).toString(),
      trade_volume: "1000",
      market_name: "Dar Es Salaam",
      price_date: new Date().toISOString().split("T")[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: PriceItem) => {
    setEditingItem(item);
    setFormData({
      commodity_symbol: item.commodity_symbol,
      price_usd: item.price_usd.toString(),
      price_tzs: item.price_tzs.toString(),
      trade_volume: item.trade_volume.toString(),
      market_name: item.market_name,
      price_date: item.price_date
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      commodity_symbol: formData.commodity_symbol.toUpperCase(),
      price_usd: parseFloat(formData.price_usd),
      price_tzs: parseFloat(formData.price_tzs),
      trade_volume: parseFloat(formData.trade_volume),
      market_name: formData.market_name,
      price_date: formData.price_date
    };

    try {
      if (editingItem) {
        await fetch(`/api/prices?id=${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchPrices();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commodity price entry?")) return;
    try {
      await fetch(`/api/prices?id=${id}`, { method: "DELETE" });
      fetchPrices();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const testApi = async () => {
    setApiLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      const end = performance.now();
      setApiLatency(Math.round(end - start));
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.commodity_symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.market_name.toLowerCase().includes(search.toLowerCase());
    const matchesMarket = selectedMarket === "ALL" || item.market_name === selectedMarket;
    return matchesSearch && matchesMarket;
  });

  const uniqueMarkets = Array.from(new Set(items.map((i) => i.market_name)));
  const avgTzs = items.length
    ? Math.round(items.reduce((acc, i) => acc + i.price_tzs, 0) / items.length)
    : 0;
  const totalVolume = items.reduce((acc, i) => acc + i.trade_volume, 0);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>
              <span style={{ color: "var(--accent-emerald)" }}>AgriTrade</span> Alpha Terminal
            </h1>
            <span className="badge badge-emerald badge-pulse">LIVE MARKET FEED</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Platform A Simulated Market Data • Endpoint: <code className="mono" style={{ color: "var(--accent-mint)" }}>GET /api/prices</code>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="badge badge-blue" style={{ marginBottom: 4 }}>
            Supabase: Publishable Key Active
          </span>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Source: <strong style={{ color: "#fff" }}>{sourceInfo.source}</strong>
          </div>
        </div>
      </header>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Monitored Commodities</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "var(--accent-mint)" }}>{items.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Active Markets</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "#93c5fd" }}>{uniqueMarkets.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Trade Volume</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "#fcd34d" }}>{totalVolume.toLocaleString()} MT</div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Avg Commodity Price (TZS)</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "#f472b6" }}>TZS {avgTzs.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search commodity or market..."
              className="form-control"
              style={{ width: 260 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: 180 }}
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              <option value="ALL">All Markets</option>
              {uniqueMarkets.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={fetchPrices}>
              Refresh Feed
            </button>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              + Add Commodity Price
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading market feed...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Commodity Symbol</th>
                  <th>Price (TZS)</th>
                  <th>Price (USD)</th>
                  <th>Trade Volume</th>
                  <th>Market Location</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      No commodity prices match your query.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: "var(--accent-mint)", fontSize: 15 }}>{item.commodity_symbol}</strong>
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        TZS {item.price_tzs.toLocaleString()}
                      </td>
                      <td className="mono" style={{ color: "var(--text-muted)" }}>
                        ${item.price_usd.toFixed(2)}
                      </td>
                      <td className="mono">{item.trade_volume.toLocaleString()} MT</td>
                      <td>
                        <span className="badge badge-blue">{item.market_name}</span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.price_date}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12, marginRight: 6 }}
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Inspector Playground */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Interactive API Playground</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Test Platform A's <code className="mono">GET /api/prices</code> response payload directly.
            </p>
          </div>
          <button className="btn btn-primary" onClick={testApi} disabled={apiLoading}>
            {apiLoading ? "Fetching..." : "Run GET /api/prices"}
          </button>
        </div>

        {apiResponse && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 13 }}>
              <span className="badge badge-emerald">Status: 200 OK</span>
              {apiLatency !== null && <span className="badge badge-blue">Latency: {apiLatency} ms</span>}
            </div>
            <pre
              className="mono"
              style={{
                background: "#080c14",
                padding: 16,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                maxHeight: 280,
                overflowY: "auto",
                fontSize: 13,
                color: "#34d399"
              }}
            >
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 style={{ fontSize: 20, marginBottom: 20, color: "var(--accent-mint)" }}>
              {editingItem ? "Edit Commodity Entry" : "New Commodity Entry"}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Commodity Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.commodity_symbol}
                  onChange={(e) => setFormData({ ...formData, commodity_symbol: e.target.value })}
                  placeholder="e.g. MAIZE, RICE, COFFEE"
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price_usd}
                    onChange={(e) => {
                      const usd = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        price_usd: e.target.value,
                        price_tzs: (usd * 2600).toFixed(2)
                      });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (TZS)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price_tzs}
                    onChange={(e) => setFormData({ ...formData, price_tzs: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Trade Volume (MT)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.trade_volume}
                    onChange={(e) => setFormData({ ...formData, trade_volume: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Market Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.market_name}
                    onChange={(e) => setFormData({ ...formData, market_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Price Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.price_date}
                  onChange={(e) => setFormData({ ...formData, price_date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Update Price Entry" : "Create Price Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

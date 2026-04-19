// server.js — Local development proxy server
// Run this alongside `npm run dev` to test API routes locally
// Usage: node server.js
// Then in another terminal: npm run dev

import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());

// ─── /api/trades ────────────────────────────────────────────
app.get("/api/trades", async (req, res) => {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  try {
    let allTrades = [];
    let offset = 0;
    const limit = 100;

    for (let page = 0; page < 10; page++) {
      const url = `https://data-api.polymarket.com/activity?user=${wallet}&type=TRADE&limit=${limit}&offset=${offset}&sortBy=TIMESTAMP&sortDirection=DESC`;

      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) throw new Error(`Polymarket Data API error: ${response.status}`);

      const data = await response.json();
      const trades = Array.isArray(data) ? data : (data.data || data.trades || []);
      allTrades = allTrades.concat(trades);

      if (trades.length < limit) break;
      offset += limit;
    }

    return res.json({ trades: allTrades });
  } catch (err) {
    console.error("Trades error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── /api/positions ─────────────────────────────────────────
app.get("/api/positions", async (req, res) => {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  try {
    const url = `https://data-api.polymarket.com/positions?user=${wallet}&limit=100&sizeThreshold=0`;

    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) throw new Error(`Polymarket Data API error: ${response.status}`);

    const data = await response.json();
    const positions = Array.isArray(data) ? data : (data.positions || data.data || []);
    return res.json({ positions });
  } catch (err) {
    console.error("Positions error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Dev proxy server running on http://localhost:${PORT}`);
  console.log(`   Using data-api.polymarket.com (public, no auth needed)`);
});

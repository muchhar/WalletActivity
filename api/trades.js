// api/trades.js — Vercel Serverless Function
// Uses data-api.polymarket.com which is fully PUBLIC — no auth needed
// Proxied through Vercel US servers to bypass India geo-block

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  try {
    let allTrades = [];
    let offset = 0;
    const limit = 100;
    const maxPages = 10; // up to 1000 trades

    for (let page = 0; page < maxPages; page++) {
      // data-api.polymarket.com /activity endpoint — public, no auth
      const url = `https://data-api.polymarket.com/activity?user=${wallet}&type=TRADE&limit=${limit}&offset=${offset}&sortBy=TIMESTAMP&sortDirection=DESC`;

      const response = await fetch(url, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) throw new Error(`Polymarket Data API error: ${response.status}`);

      const data = await response.json();
      const trades = Array.isArray(data) ? data : (data.data || data.trades || []);

      allTrades = allTrades.concat(trades);

      if (trades.length < limit) break; // no more pages
      offset += limit;
    }

    return res.status(200).json({ trades: allTrades });
  } catch (err) {
    console.error("Trades fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
}

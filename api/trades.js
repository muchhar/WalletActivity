// api/trades.js — Vercel Serverless Function
// This proxies requests to Polymarket from Vercel's US servers
// so Indian users can access geo-restricted data

export default async function handler(req, res) {
  // Allow CORS for frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { wallet } = req.query;

  if (!wallet) {
    return res.status(400).json({ error: "wallet address required" });
  }

  try {
    // Fetch all trades for this wallet — paginate up to 500
    let allTrades = [];
    let nextCursor = "";
    let page = 0;

    while (page < 10) { // max 10 pages = 500 trades
      const url = `https://clob.polymarket.com/trades?maker=${wallet}&limit=50${nextCursor ? `&next_cursor=${nextCursor}` : ""}`;
      
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Polymarket API error: ${response.status}`);
      }

      const data = await response.json();
      const trades = data.data || data.trades || data || [];
      allTrades = allTrades.concat(trades);

      nextCursor = data.next_cursor || "";
      if (!nextCursor || trades.length === 0) break;
      page++;
    }

    return res.status(200).json({ trades: allTrades });
  } catch (err) {
    console.error("Trades fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
}

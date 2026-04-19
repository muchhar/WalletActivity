// api/positions.js — Vercel Serverless Function
// Uses data-api.polymarket.com which is fully PUBLIC — no auth needed

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  try {
    // data-api.polymarket.com /positions — public, no auth needed
    const url = `https://data-api.polymarket.com/positions?user=${wallet}&limit=100&sizeThreshold=0`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) throw new Error(`Polymarket Data API error: ${response.status}`);

    const data = await response.json();
    const positions = Array.isArray(data) ? data : (data.positions || data.data || []);

    return res.status(200).json({ positions });
  } catch (err) {
    console.error("Positions fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
}

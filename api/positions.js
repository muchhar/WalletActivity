// api/positions.js — Vercel Serverless Function

export default async function handler(req, res) {
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
    const url = `https://gamma-api.polymarket.com/positions?user=${wallet}&limit=100`;

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
    return res.status(200).json({ positions: data || [] });
  } catch (err) {
    console.error("Positions fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
}

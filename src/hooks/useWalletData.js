import { useState, useEffect, useCallback } from "react";
import { calculatePnL } from "../utils/pnlCalculator";

const BASE_URL = import.meta.env.DEV ? "" : "";

export function useWalletData(wallets) {
  const [walletsData, setWalletsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    if (!wallets || wallets.length === 0) return;
    setLoading(true);
    setErrors({});

    const results = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          // Fetch trades via Vercel serverless proxy
          const tradesRes = await fetch(`${BASE_URL}/api/trades?wallet=${wallet.address}`);
          const tradesJson = await tradesRes.json();

          if (!tradesRes.ok) throw new Error(tradesJson.error || "Failed to fetch trades");

          // Fetch positions
          const posRes = await fetch(`${BASE_URL}/api/positions?wallet=${wallet.address}`);
          const posJson = await posRes.json();

          const trades = tradesJson.trades || [];
          const positions = posJson.positions || [];

          // Calculate P&L from trades
          const pnl = calculatePnL(trades);

          // Calculate unrealized value from open positions
          // Data API returns currentValue (dollar value) directly
          const unrealizedValue = positions.reduce((sum, p) => {
            return sum + parseFloat(p.currentValue || 0);
          }, 0);

          return {
            ...wallet,
            trades,
            positions,
            pnl,
            unrealizedValue: parseFloat(unrealizedValue.toFixed(2)),
            error: null,
          };
        } catch (err) {
          return {
            ...wallet,
            trades: [],
            positions: [],
            pnl: { totalPnL: 0, dailyPnL: 0, weeklyPnL: 0, chartData: [], tradeCount: 0 },
            unrealizedValue: 0,
            error: err.message,
          };
        }
      })
    );

    setWalletsData(results);
    setLastUpdated(new Date());
    setLoading(false);
  }, [wallets]);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { walletsData, loading, lastUpdated, refresh: fetchAll, errors };
}

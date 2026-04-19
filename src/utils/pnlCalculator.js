import { startOfDay, startOfWeek, isAfter, parseISO } from "date-fns";

/**
 * Calculate P&L from a list of trades for a wallet.
 * Polymarket trades have: price, size, side (BUY/SELL), outcome, asset_id, timestamp
 */
export function calculatePnL(trades) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

  let totalPnL = 0;
  let dailyPnL = 0;
  let weeklyPnL = 0;

  const dailyData = {}; // { "YYYY-MM-DD": pnl }

  for (const trade of trades) {
    const tradeTime = parseISO(trade.timestamp || trade.created_at || new Date().toISOString());
    const side = (trade.side || "").toUpperCase();
    const price = parseFloat(trade.price || 0);
    const size = parseFloat(trade.size || trade.original_size || 0);

    // Cost basis: BUY costs money, SELL returns money
    let pnlImpact = 0;
    if (side === "BUY") {
      pnlImpact = -(price * size); // spent money
    } else if (side === "SELL") {
      pnlImpact = price * size; // received money
    }

    totalPnL += pnlImpact;

    if (isAfter(tradeTime, todayStart)) {
      dailyPnL += pnlImpact;
    }
    if (isAfter(tradeTime, weekStart)) {
      weeklyPnL += pnlImpact;
    }

    // Group by day for chart
    const dayKey = tradeTime.toISOString().split("T")[0];
    if (!dailyData[dayKey]) dailyData[dayKey] = 0;
    dailyData[dayKey] += pnlImpact;
  }

  // Build chart data sorted by date
  const chartData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({
      date,
      pnl: parseFloat(pnl.toFixed(2)),
    }));

  // Add cumulative
  let cumulative = 0;
  const chartDataWithCumulative = chartData.map((d) => {
    cumulative += d.pnl;
    return { ...d, cumulative: parseFloat(cumulative.toFixed(2)) };
  });

  return {
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    dailyPnL: parseFloat(dailyPnL.toFixed(2)),
    weeklyPnL: parseFloat(weeklyPnL.toFixed(2)),
    chartData: chartDataWithCumulative,
    tradeCount: trades.length,
  };
}

export function formatUSD(value) {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (value < 0 ? "-$" : "+$") + formatted;
}

export function formatUSDPlain(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

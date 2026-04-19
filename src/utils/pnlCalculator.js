import { startOfDay, startOfWeek, isAfter, fromUnixTime } from "date-fns";

/**
 * Calculate P&L from activity trades returned by data-api.polymarket.com
 * Fields: usdcSize (dollar value), side (BUY/SELL), timestamp (unix seconds),
 *         price, size (token count), title (market name)
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
    // Data API uses unix timestamp in seconds
    const tradeTime = fromUnixTime(trade.timestamp || 0);
    const side = (trade.side || "").toUpperCase();

    // usdcSize = actual dollar amount spent/received
    const usdcValue = parseFloat(trade.usdcSize || 0);

    // BUY = money out (negative PnL impact), SELL = money in (positive)
    const pnlImpact = side === "BUY" ? -usdcValue : side === "SELL" ? usdcValue : 0;

    totalPnL += pnlImpact;

    if (isAfter(tradeTime, todayStart)) dailyPnL += pnlImpact;
    if (isAfter(tradeTime, weekStart)) weeklyPnL += pnlImpact;

    // Group by day for chart
    const dayKey = tradeTime.toISOString().split("T")[0];
    if (!dailyData[dayKey]) dailyData[dayKey] = 0;
    dailyData[dayKey] += pnlImpact;
  }

  // Build chart data sorted by date
  const chartData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl: parseFloat(pnl.toFixed(2)) }));

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

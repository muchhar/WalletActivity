import { formatUSDPlain } from "../utils/pnlCalculator";

export default function SummaryBar({ walletsData }) {
  const totals = walletsData.reduce(
    (acc, w) => ({
      daily: acc.daily + (w.pnl?.dailyPnL || 0),
      weekly: acc.weekly + (w.pnl?.weeklyPnL || 0),
      allTime: acc.allTime + (w.pnl?.totalPnL || 0),
      open: acc.open + (w.unrealizedValue || 0),
      trades: acc.trades + (w.pnl?.tradeCount || 0),
    }),
    { daily: 0, weekly: 0, allTime: 0, open: 0, trades: 0 }
  );

  const stats = [
    { label: "Today (All Wallets)", value: totals.daily },
    { label: "This Week", value: totals.weekly },
    { label: "All Time", value: totals.allTime },
    { label: "Open Positions", value: totals.open },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => {
        const isPos = s.value >= 0;
        return (
          <div
            key={s.label}
            className="relative overflow-hidden bg-[#0d0d0d] border border-[#1e1e1e] rounded-2xl p-4"
          >
            <div
              className={`absolute inset-0 opacity-5 ${isPos ? "bg-[#00ff87]" : "bg-[#ff4444]"}`}
            />
            <p className="text-[#555] text-xs font-mono uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <p
              className={`text-2xl font-display font-bold ${
                isPos ? "text-[#00ff87]" : "text-[#ff4444]"
              }`}
            >
              {isPos ? "+" : ""}
              {formatUSDPlain(s.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

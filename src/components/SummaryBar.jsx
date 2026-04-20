import { formatUSDPlain } from "../utils/pnlCalculator";
import { CATEGORIES } from "../wallets.config";

export default function SummaryBar({ walletsData }) {
  const totals = walletsData.reduce(
    (acc, w) => ({
      daily:   acc.daily   + (w.pnl?.dailyPnL   || 0),
      weekly:  acc.weekly  + (w.pnl?.weeklyPnL  || 0),
      allTime: acc.allTime + (w.pnl?.totalPnL   || 0),
      open:    acc.open    + (w.unrealizedValue || 0),
      trades:  acc.trades  + (w.pnl?.tradeCount || 0),
      wins:    acc.wins    + ((w.pnl?.totalPnL || 0) > 0 ? 1 : 0),
    }),
    { daily: 0, weekly: 0, allTime: 0, open: 0, trades: 0, wins: 0 }
  );

  const profitable = totals.wins;
  const total      = walletsData.length;
  const winPct     = total ? Math.round((profitable / total) * 100) : 0;

  // Per-category breakdown (all-time pnl)
  const byCat = {};
  for (const key of Object.keys(CATEGORIES)) byCat[key] = 0;
  walletsData.forEach((w) => {
    const c = w.category || "mixed";
    byCat[c] = (byCat[c] || 0) + (w.pnl?.totalPnL || 0);
  });

  const bigStats = [
    { label: "Today",     value: totals.daily,   sub: "24h realized P&L" },
    { label: "This Week", value: totals.weekly,  sub: "7d realized P&L" },
    { label: "All Time",  value: totals.allTime, sub: "Cumulative P&L" },
    { label: "Open Size", value: totals.open,    sub: "Unrealized exposure", neutral: true },
  ];

  return (
    <div className="space-y-4">
      {/* Main KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bigStats.map((s) => {
          const isPos = s.value >= 0;
          const tone  = s.neutral
            ? "text-[#e5e7eb]"
            : isPos
              ? "text-[#00ff87]"
              : "text-[#ff5c5c]";
          const glow  = s.neutral
            ? "transparent"
            : isPos
              ? "#00ff8710"
              : "#ff5c5c10";
          return (
            <div
              key={s.label}
              className="relative overflow-hidden bg-[#0a0d11] border border-[#1a1d22] rounded-2xl p-5 hover:border-[#242a31] transition-colors"
            >
              <div className="absolute inset-0" style={{ background: glow }} />
              <div className="relative">
                <p className="text-[#6b7280] text-[10px] font-mono uppercase tracking-[0.2em] mb-2">
                  {s.label}
                </p>
                <p className={`text-3xl font-display font-bold ${tone}`}>
                  {!s.neutral && (isPos ? "+" : "")}
                  {formatUSDPlain(s.value)}
                </p>
                <p className="text-[#4b5563] font-mono text-[11px] mt-1">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary row — breakdown strip */}
      <div className="bg-[#0a0d11] border border-[#1a1d22] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 md:border-r md:border-[#1a1d22] md:pr-6">
          <Metric label="Wallets"    value={total} />
          <Metric label="Profitable" value={`${profitable}/${total}`} accent={winPct >= 50 ? "#00ff87" : "#ff5c5c"} />
          <Metric label="Win Rate"   value={`${winPct}%`} accent={winPct >= 50 ? "#00ff87" : "#ff5c5c"} />
          <Metric label="Trades"     value={totals.trades.toLocaleString()} />
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(CATEGORIES).map(([key, meta]) => {
            const v = byCat[key] || 0;
            const pos = v >= 0;
            return (
              <div
                key={key}
                className="flex items-center justify-between bg-[#05070a] border border-[#14171b] rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                  />
                  <span className="text-[#9ca3af] font-mono text-xs">{meta.label}</span>
                </div>
                <span
                  className={`font-mono text-xs font-semibold ${
                    pos ? "text-[#00ff87]" : "text-[#ff5c5c]"
                  }`}
                >
                  {pos ? "+" : ""}
                  {formatUSDPlain(v)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div>
      <p className="text-[#6b7280] text-[10px] font-mono uppercase tracking-widest">{label}</p>
      <p
        className="font-mono font-bold text-lg"
        style={{ color: accent || "#e5e7eb" }}
      >
        {value}
      </p>
    </div>
  );
}

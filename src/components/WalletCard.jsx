import { useState } from "react";
import PnLChart from "./PnLChart";
import TradeTable from "./TradeTable";
import { formatUSD } from "../utils/pnlCalculator";

function StatBox({ label, value, highlight }) {
  const isPos = value >= 0;
  return (
    <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-3">
      <p className="text-[#555] text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-mono font-bold text-lg ${highlight ? (isPos ? "text-[#00ff87]" : "text-[#ff4444]") : "text-white"}`}>
        {typeof value === "number" ? formatUSD(value) : value}
      </p>
    </div>
  );
}

export default function WalletCard({ wallet }) {
  const [showTrades, setShowTrades] = useState(false);
  const [chartMode, setChartMode] = useState("cumulative");

  const { label, address, pnl, unrealizedValue, trades, error } = wallet;
  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—";

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
        <div>
          <h3 className="text-white font-display font-bold text-lg">{label}</h3>
          <p className="text-[#444] font-mono text-xs mt-0.5">{short}</p>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-[#ff4444] text-xs font-mono bg-[#ff444410] px-2 py-1 rounded">
              Error
            </span>
          ) : (
            <span className="text-[#00ff87] text-xs font-mono bg-[#00ff8710] px-2 py-1 rounded">
              ● Live
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="px-5 py-6 text-[#ff4444] font-mono text-sm">{error}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
            <StatBox label="Today" value={pnl.dailyPnL} highlight />
            <StatBox label="This Week" value={pnl.weeklyPnL} highlight />
            <StatBox label="All Time" value={pnl.totalPnL} highlight />
            <StatBox label="Open Positions" value={unrealizedValue} highlight={false} />
          </div>

          {/* Chart */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#444] text-xs font-mono uppercase tracking-widest">P&L Chart</p>
              <div className="flex gap-1">
                {["cumulative", "daily"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={`text-xs font-mono px-2 py-1 rounded transition-all ${
                      chartMode === m
                        ? "bg-[#00ff87] text-black"
                        : "text-[#555] hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <PnLChart chartData={pnl.chartData} mode={chartMode} />
          </div>

          {/* Trade Count + Toggle */}
          <div className="px-5 pb-5">
            <button
              onClick={() => setShowTrades(!showTrades)}
              className="w-full text-center text-xs font-mono text-[#444] hover:text-[#00ff87] transition-colors mt-2 py-2 border border-[#1e1e1e] rounded-lg hover:border-[#00ff8730]"
            >
              {showTrades ? "Hide" : "Show"} Trades ({pnl.tradeCount})
            </button>
            {showTrades && (
              <div className="mt-3">
                <TradeTable trades={trades} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

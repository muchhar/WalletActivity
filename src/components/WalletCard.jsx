import { useState } from "react";
import PnLChart from "./PnLChart";
import TradeModal from "./TradeModal";
import { formatUSD } from "../utils/pnlCalculator";
import { CATEGORIES } from "../wallets.config";

function StatBox({ label, value, highlight, neutral }) {
  const isPos = typeof value === "number" ? value >= 0 : true;
  const display =
    typeof value === "number" ? formatUSD(value) : value ?? "—";

  const tone = neutral
    ? "text-white"
    : highlight
      ? isPos
        ? "text-[#00ff87]"
        : "text-[#ff5c5c]"
      : "text-white";

  return (
    <div className="min-w-0 bg-[#05070a] border border-[#14171b] rounded-lg p-2.5 overflow-hidden">
      <p className="text-[#4b5563] text-[10px] font-mono uppercase tracking-[0.15em] mb-1 truncate">
        {label}
      </p>
      <p
        className={`font-mono font-bold text-sm md:text-[15px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${tone}`}
        title={typeof value === "number" ? String(value) : display}
      >
        {display}
      </p>
    </div>
  );
}

export default function WalletCard({ wallet }) {
  const [showModal, setShowModal] = useState(false);
  const [chartMode, setChartMode] = useState("cumulative");

  const { label, address, pnl, unrealizedValue, trades, error, category } = wallet;
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

  const catMeta = CATEGORIES[category] || CATEGORIES.mixed;

  const copyAddress = () => {
    if (!address) return;
    try { navigator.clipboard.writeText(address); } catch {}
  };

  return (
    <>
      <div
        className="group flex flex-col bg-gradient-to-b from-[#0c1014] to-[#0a0d11] border border-[#1a1d22] rounded-2xl overflow-hidden hover:border-[#2a2f36] transition-all duration-300 shadow-lg shadow-black/30"
        style={{
          borderTop: `1px solid ${catMeta.color}30`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-[#14171b] min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{
                  background: `${catMeta.color}18`,
                  color: catMeta.color,
                  border: `1px solid ${catMeta.color}30`,
                }}
              >
                {catMeta.icon} {catMeta.label}
              </span>
              {error ? (
                <span className="text-[#ff5c5c] text-[10px] font-mono bg-[#ff5c5c10] px-1.5 py-0.5 rounded border border-[#ff5c5c30]">
                  Error
                </span>
              ) : (
                <span className="text-[#00ff87] text-[10px] font-mono">●</span>
              )}
            </div>
            <h3 className="text-white font-display font-bold text-base truncate" title={label}>
              {label}
            </h3>
            <button
              onClick={copyAddress}
              className="text-[#4b5563] font-mono text-[11px] mt-0.5 hover:text-[#00ff87] transition-colors truncate block w-full text-left"
              title={address + " (click to copy)"}
            >
              {short}
            </button>
          </div>

          {!error && pnl && (
            <div className="text-right shrink-0">
              <p className="text-[#4b5563] text-[10px] font-mono uppercase tracking-widest">
                All-Time
              </p>
              <p
                className={`font-mono font-bold text-sm leading-tight ${
                  pnl.totalPnL >= 0 ? "text-[#00ff87]" : "text-[#ff5c5c]"
                }`}
              >
                {formatUSD(pnl.totalPnL)}
              </p>
            </div>
          )}
        </div>

        {error ? (
          <div className="px-4 py-6 text-[#ff5c5c] font-mono text-xs break-all">{error}</div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
              <StatBox label="Today"    value={pnl.dailyPnL}   highlight />
              <StatBox label="Week"     value={pnl.weeklyPnL}  highlight />
              <StatBox label="Trades"   value={pnl.tradeCount} neutral />
              <StatBox label="Open"     value={unrealizedValue} neutral />
            </div>

            {/* Chart */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#4b5563] text-[10px] font-mono uppercase tracking-widest">
                  P&amp;L Trend
                </p>
                <div className="flex gap-1 bg-[#05070a] border border-[#14171b] rounded-lg p-0.5">
                  {["cumulative", "daily"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMode(m)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all ${
                        chartMode === m
                          ? "bg-[#00ff87] text-black"
                          : "text-[#6b7280] hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden">
                <PnLChart chartData={pnl.chartData} mode={chartMode} />
              </div>
            </div>

            {/* Trade button */}
            <div className="px-4 pb-4 mt-auto">
              <button
                onClick={() => setShowModal(true)}
                disabled={!trades || trades.length === 0}
                className="w-full text-center text-xs font-mono text-[#9ca3af] hover:text-[#00ff87] transition-colors py-2.5 border border-[#1a1d22] rounded-lg hover:border-[#00ff8730] hover:bg-[#00ff8708] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#1a1d22] disabled:hover:bg-transparent disabled:hover:text-[#9ca3af]"
              >
                View All Trades
                {pnl?.tradeCount ? ` (${pnl.tradeCount})` : ""}
                <span className="ml-1 opacity-60">→</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TradeModal
          wallet={wallet}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

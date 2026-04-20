import { useEffect, useMemo, useState } from "react";
import { format, fromUnixTime } from "date-fns";
import { CATEGORIES } from "../wallets.config";

const PAGE_SIZE = 20;

export default function TradeModal({ wallet, onClose }) {
  const { label, address, trades = [], category } = wallet;
  const catMeta = CATEGORIES[category] || CATEGORIES.mixed;

  const [page, setPage]     = useState(0);
  const [sideFilter, setSideFilter] = useState("ALL"); // ALL | BUY | SELL
  const [query, setQuery]   = useState("");

  // Close on ESC and prevent background scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Sort + filter
  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [trades]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (sideFilter !== "ALL") {
      list = list.filter(
        (t) => (t.side || "").toUpperCase() === sideFilter
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) =>
        (t.title || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [sorted, sideFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const pageTrades = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset to page 0 if filter changes
  useEffect(() => { setPage(0); }, [sideFilter, query]);

  // Totals for modal header
  const stats = useMemo(() => {
    let buy = 0, sell = 0, buys = 0, sells = 0;
    for (const t of filtered) {
      const s = (t.side || "").toUpperCase();
      const usd = parseFloat(t.usdcSize || 0);
      if (s === "BUY")  { buy  += usd; buys++;  }
      if (s === "SELL") { sell += usd; sells++; }
    }
    return { buy, sell, buys, sells, net: sell - buy };
  }, [filtered]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-[#0c1014] to-[#0a0d11] border border-[#1f2329] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/60 overflow-hidden"
        style={{ borderTop: `1px solid ${catMeta.color}60` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#14171b]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
              <span className="text-[#6b7280] font-mono text-[11px]">Trade History</span>
            </div>
            <h2 className="text-white font-display font-bold text-xl truncate">{label}</h2>
            <p className="text-[#4b5563] font-mono text-[11px] break-all">{address}</p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-9 h-9 flex items-center justify-center bg-[#05070a] border border-[#14171b] hover:border-[#ff5c5c] hover:text-[#ff5c5c] text-[#9ca3af] rounded-lg font-mono transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-4 border-b border-[#14171b] bg-[#05070a]">
          <ModalStat label="Trades"  value={filtered.length.toLocaleString()} />
          <ModalStat label="Bought"  value={`-$${stats.buy.toFixed(2)}`}  tone="#ff5c5c" />
          <ModalStat label="Sold"    value={`+$${stats.sell.toFixed(2)}`} tone="#00ff87" />
          <ModalStat
            label="Net Flow"
            value={`${stats.net >= 0 ? "+" : "-"}$${Math.abs(stats.net).toFixed(2)}`}
            tone={stats.net >= 0 ? "#00ff87" : "#ff5c5c"}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3 border-b border-[#14171b]">
          <div className="flex items-center gap-1 bg-[#05070a] border border-[#14171b] rounded-lg p-0.5">
            {["ALL", "BUY", "SELL"].map((s) => (
              <button
                key={s}
                onClick={() => setSideFilter(s)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-md transition-all ${
                  sideFilter === s
                    ? s === "BUY"
                      ? "bg-[#ff5c5c] text-black"
                      : s === "SELL"
                        ? "bg-[#00ff87] text-black"
                        : "bg-white text-black"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by market…"
            className="flex-1 bg-[#05070a] border border-[#14171b] focus:border-[#00ff87] outline-none text-xs font-mono text-white placeholder:text-[#4b5563] rounded-lg px-3 py-2 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-[#4b5563] font-mono text-sm py-16">
              No trades match your filters
            </div>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-[#0a0d11] z-10">
                <tr className="border-b border-[#14171b]">
                  <th className="text-left text-[#4b5563] px-4 py-2.5 uppercase tracking-widest text-[10px]">Date</th>
                  <th className="text-left text-[#4b5563] px-3 py-2.5 uppercase tracking-widest text-[10px]">Market</th>
                  <th className="text-left text-[#4b5563] px-3 py-2.5 uppercase tracking-widest text-[10px]">Side</th>
                  <th className="text-right text-[#4b5563] px-3 py-2.5 uppercase tracking-widest text-[10px]">Price</th>
                  <th className="text-right text-[#4b5563] px-3 py-2.5 uppercase tracking-widest text-[10px]">Size</th>
                  <th className="text-right text-[#4b5563] px-4 py-2.5 uppercase tracking-widest text-[10px]">USDC</th>
                </tr>
              </thead>
              <tbody>
                {pageTrades.map((trade, i) => {
                  const side = (trade.side || "").toUpperCase();
                  const price = parseFloat(trade.price || 0);
                  const usdcSize = parseFloat(trade.usdcSize || 0);
                  const size = parseFloat(trade.size || 0);
                  let dateStr = "—";
                  try {
                    dateStr = format(fromUnixTime(trade.timestamp), "MMM d, HH:mm");
                  } catch {}

                  return (
                    <tr
                      key={`${trade.transactionHash || i}-${i}`}
                      className="border-b border-[#14171b] hover:bg-[#0d1013] transition-colors"
                    >
                      <td className="px-4 py-2.5 text-[#9ca3af] whitespace-nowrap">{dateStr}</td>
                      <td className="px-3 py-2.5 text-white max-w-xs">
                        <span className="block truncate" title={trade.title}>
                          {trade.title || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            side === "BUY"
                              ? "bg-[#ff5c5c15] text-[#ff5c5c] border border-[#ff5c5c30]"
                              : "bg-[#00ff8715] text-[#00ff87] border border-[#00ff8730]"
                          }`}
                        >
                          {side || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-white whitespace-nowrap">
                        ${price.toFixed(3)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#9ca3af] whitespace-nowrap">
                        {size.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${
                          side === "SELL" ? "text-[#00ff87]" : "text-[#ff5c5c]"
                        }`}
                      >
                        {side === "SELL" ? "+" : "-"}${usdcSize.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#14171b] bg-[#05070a]">
            <div className="text-[11px] font-mono text-[#6b7280]">
              Showing{" "}
              <span className="text-white">
                {safePage * PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="text-white">{filtered.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <PageBtn
                onClick={() => setPage(0)}
                disabled={safePage === 0}
                label="«"
              />
              <PageBtn
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                label="‹ Prev"
              />
              <div className="px-3 text-[11px] font-mono text-[#9ca3af]">
                Page <span className="text-white">{safePage + 1}</span> /{" "}
                <span className="text-white">{totalPages}</span>
              </div>
              <PageBtn
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={safePage >= totalPages - 1}
                label="Next ›"
              />
              <PageBtn
                onClick={() => setPage(totalPages - 1)}
                disabled={safePage >= totalPages - 1}
                label="»"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalStat({ label, value, tone }) {
  return (
    <div className="min-w-0">
      <p className="text-[#4b5563] text-[10px] font-mono uppercase tracking-widest mb-0.5 truncate">
        {label}
      </p>
      <p
        className="font-mono font-bold text-base truncate"
        style={{ color: tone || "#ffffff" }}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function PageBtn({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] font-mono px-2.5 py-1.5 rounded-md bg-[#0a0d11] border border-[#14171b] text-[#9ca3af] hover:text-white hover:border-[#2a2f36] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

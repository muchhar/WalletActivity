import { useMemo, useState } from "react";
import wallets, { CATEGORIES } from "./wallets.config";
import { useWalletData } from "./hooks/useWalletData";
import WalletCard from "./components/WalletCard";
import SummaryBar from "./components/SummaryBar";
import { format } from "date-fns";

const SORTS = [
  { id: "daily",   label: "Today" },
  { id: "weekly",  label: "Week"  },
  { id: "total",   label: "All-Time" },
  { id: "trades",  label: "Trades" },
  { id: "label",   label: "Name"  },
];

export default function App() {
  const { walletsData, loading, lastUpdated, refresh } = useWalletData(wallets);

  const [activeCat, setActiveCat] = useState("all");
  const [sortBy, setSortBy]       = useState("daily");
  const [query, setQuery]         = useState("");

  // Merge category info into wallet data
  const enriched = useMemo(() => {
    return walletsData.map((w) => {
      const cfg = wallets.find(
        (c) => c.address.toLowerCase() === (w.address || "").toLowerCase()
      );
      return { ...w, category: cfg?.category || "mixed" };
    });
  }, [walletsData]);

  // Filter + sort
  const visible = useMemo(() => {
    let list = enriched;
    if (activeCat !== "all") list = list.filter((w) => w.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (w) =>
          (w.label || "").toLowerCase().includes(q) ||
          (w.address || "").toLowerCase().includes(q)
      );
    }
    const getVal = (w) => {
      switch (sortBy) {
        case "daily":  return w.pnl?.dailyPnL   ?? -Infinity;
        case "weekly": return w.pnl?.weeklyPnL  ?? -Infinity;
        case "total":  return w.pnl?.totalPnL   ?? -Infinity;
        case "trades": return w.pnl?.tradeCount ?? 0;
        case "label":  return (w.label || "").toLowerCase();
        default:       return 0;
      }
    };
    return [...list].sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      if (typeof va === "string") return va.localeCompare(vb);
      return vb - va;
    });
  }, [enriched, activeCat, sortBy, query]);

  // Count per category
  const counts = useMemo(() => {
    const c = { all: enriched.length };
    for (const k of Object.keys(CATEGORIES)) c[k] = 0;
    enriched.forEach((w) => { c[w.category] = (c[w.category] || 0) + 1; });
    return c;
  }, [enriched]);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Subtle background grid + glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff14 1px, transparent 1px), linear-gradient(90deg, #ffffff14 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, #00ff8733 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 py-8">
        {/* ===================== HEADER ===================== */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse shadow-[0_0_12px_#00ff87]" />
              <span className="text-[#00ff87] font-mono text-[11px] uppercase tracking-[0.25em]">
                Live · Polymarket CLOB
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-none">
              Wallet <span className="text-[#00ff87]">P&amp;L</span> Terminal
            </h1>
            <p className="text-[#6b7280] font-mono text-sm mt-2">
              Tracking <span className="text-white">{wallets.length}</span> wallets
              across <span className="text-white">{Object.keys(CATEGORIES).length}</span> strategies
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-right">
                <p className="text-[#4b5563] font-mono text-[10px] uppercase tracking-widest">
                  Last Sync
                </p>
                <p className="text-[#e5e7eb] font-mono text-sm">
                  {format(lastUpdated, "HH:mm:ss")}
                </p>
              </div>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="group bg-gradient-to-b from-[#111418] to-[#0b0d10] border border-[#1f2329] hover:border-[#00ff87] text-white hover:text-[#00ff87] font-mono text-sm px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 shadow-lg shadow-black/40"
            >
              <span className={loading ? "inline-block animate-spin" : "inline-block group-hover:rotate-180 transition-transform"}>
                ↻
              </span>{" "}
              {loading ? "Syncing" : "Refresh"}
            </button>
          </div>
        </header>

        {/* ===================== SUMMARY ===================== */}
        {enriched.length > 0 && <SummaryBar walletsData={enriched} />}

        {/* ===================== CONTROLS ===================== */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 mt-8">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              color="#00ff87"
              label={`All · ${counts.all || 0}`}
            />
            {Object.entries(CATEGORIES).map(([key, meta]) => (
              <FilterPill
                key={key}
                active={activeCat === key}
                onClick={() => setActiveCat(key)}
                color={meta.color}
                label={`${meta.icon} ${meta.label} · ${counts[key] || 0}`}
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or address…"
              className="bg-[#0a0d11] border border-[#1f2329] focus:border-[#00ff87] outline-none text-sm font-mono text-white placeholder:text-[#4b5563] rounded-xl px-4 py-2.5 w-full lg:w-72 transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#0a0d11] border border-[#1f2329] rounded-xl p-1">
            <span className="text-[#6b7280] font-mono text-[10px] uppercase tracking-widest px-2">
              Sort
            </span>
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all ${
                  sortBy === s.id
                    ? "bg-[#00ff87] text-black"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===================== LOADING SKELETON ===================== */}
        {loading && enriched.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {wallets.map((_, i) => (
              <div
                key={i}
                className="bg-[#0a0d11] border border-[#1a1d22] rounded-2xl p-5 h-72 animate-pulse"
              >
                <div className="h-4 bg-[#1a1d22] rounded w-1/3 mb-3" />
                <div className="h-3 bg-[#14171b] rounded w-1/4 mb-6" />
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-14 bg-[#14171b] rounded-lg" />
                  ))}
                </div>
                <div className="h-32 bg-[#0d1013] rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* ===================== WALLET GRID ===================== */}
        {visible.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((wallet, i) => (
              <WalletCard key={wallet.address || i} wallet={wallet} />
            ))}
          </div>
        )}

        {visible.length === 0 && !loading && (
          <div className="text-center py-20 text-[#4b5563] font-mono text-sm">
            No wallets match your filters.
          </div>
        )}

        {/* ===================== FOOTER ===================== */}
        <footer className="mt-16 pt-6 border-t border-[#14171b] flex flex-col md:flex-row items-center justify-between gap-2 text-[#374151] font-mono text-[11px]">
          <div>Auto-refresh · 5 min · data-api.polymarket.com</div>
          <div>Built for strategy intelligence · v2.0</div>
        </footer>
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, color, label }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-mono px-3.5 py-2 rounded-xl border transition-all duration-150 ${
        active
          ? "text-black font-semibold"
          : "text-[#9ca3af] hover:text-white border-[#1f2329] hover:border-[#2a2f36]"
      }`}
      style={
        active
          ? {
              background: color,
              borderColor: color,
              boxShadow: `0 0 18px ${color}40`,
            }
          : { background: "#0a0d11" }
      }
    >
      {label}
    </button>
  );
}

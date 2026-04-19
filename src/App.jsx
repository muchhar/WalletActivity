import { useState } from "react";
import wallets from "./wallets.config";
import { useWalletData } from "./hooks/useWalletData";
import WalletCard from "./components/WalletCard";
import SummaryBar from "./components/SummaryBar";
import { format } from "date-fns";

export default function App() {
  const { walletsData, loading, lastUpdated, refresh } = useWalletData(wallets);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
              <span className="text-[#00ff87] font-mono text-xs uppercase tracking-[0.2em]">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-display font-extrabold tracking-tight">
              Polymarket P&L
            </h1>
            <p className="text-[#444] font-mono text-sm mt-1">
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} tracked
            </p>
          </div>

          <div className="text-right">
            <button
              onClick={refresh}
              disabled={loading}
              className="bg-[#111] border border-[#2a2a2a] hover:border-[#00ff87] text-white hover:text-[#00ff87] font-mono text-sm px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
            {lastUpdated && (
              <p className="text-[#333] font-mono text-xs mt-2">
                Last updated: {format(lastUpdated, "HH:mm:ss")}
              </p>
            )}
          </div>
        </div>

        {/* Summary across all wallets */}
        {walletsData.length > 0 && <SummaryBar walletsData={walletsData} />}

        {/* Loading skeleton */}
        {loading && walletsData.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((_, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 h-64 animate-pulse"
              >
                <div className="h-4 bg-[#1e1e1e] rounded w-1/3 mb-3" />
                <div className="h-3 bg-[#1a1a1a] rounded w-1/4 mb-6" />
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-14 bg-[#1a1a1a] rounded-lg" />
                  ))}
                </div>
                <div className="h-32 bg-[#0d0d0d] rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Wallet Cards */}
        {walletsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {walletsData.map((wallet, i) => (
              <WalletCard key={wallet.address || i} wallet={wallet} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-[#222] font-mono text-xs">
          Auto-refreshes every 5 minutes · Polymarket CLOB API
        </div>
      </div>
    </div>
  );
}

import { format, fromUnixTime } from "date-fns";

export default function TradeTable({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="text-center text-[#444] font-mono text-sm py-4">
        No trades found
      </div>
    );
  }

  const recent = [...trades]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 20);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {["Date", "Market", "Side", "Price", "USDC"].map((h) => (
              <th key={h} className="text-left text-[#444] pb-2 pr-3 uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((trade, i) => {
            const side = (trade.side || "").toUpperCase();
            const price = parseFloat(trade.price || 0);
            const usdcSize = parseFloat(trade.usdcSize || 0);
            const title = trade.title ? trade.title.slice(0, 28) + (trade.title.length > 28 ? "…" : "") : "—";
            let dateStr = "—";
            try {
              dateStr = format(fromUnixTime(trade.timestamp), "MMM d HH:mm");
            } catch {}

            return (
              <tr key={i} className="border-b border-[#111] hover:bg-[#0d0d0d]">
                <td className="py-2 pr-3 text-[#555]">{dateStr}</td>
                <td className="py-2 pr-3 text-[#888]" title={trade.title}>{title}</td>
                <td className="py-2 pr-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    side === "BUY"
                      ? "bg-[#00ff8715] text-[#00ff87]"
                      : "bg-[#ff444415] text-[#ff4444]"
                  }`}>
                    {side}
                  </span>
                </td>
                <td className="py-2 pr-3 text-white">${price.toFixed(3)}</td>
                <td className={`py-2 font-bold ${side === "SELL" ? "text-[#00ff87]" : "text-[#ff4444]"}`}>
                  {side === "SELL" ? "+" : "-"}${usdcSize.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {trades.length > 20 && (
        <p className="text-center text-[#444] text-xs mt-2 font-mono">
          Showing 20 of {trades.length} trades
        </p>
      )}
    </div>
  );
}

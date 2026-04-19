import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#0d0d0d] border border-[#2a2a2a] px-3 py-2 rounded">
        <p className="text-[#888] text-xs font-mono mb-1">{label}</p>
        <p className={`text-sm font-mono font-bold ${val >= 0 ? "text-[#00ff87]" : "text-[#ff4444]"}`}>
          {val >= 0 ? "+" : ""}${val.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PnLChart({ chartData, mode = "cumulative" }) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-[#444] font-mono text-sm">
        No trade data yet
      </div>
    );
  }

  const dataKey = mode === "cumulative" ? "cumulative" : "pnl";
  const isPositive =
    chartData.length > 0 && chartData[chartData.length - 1][dataKey] >= 0;
  const color = isPositive ? "#00ff87" : "#ff4444";

  const formatted = chartData.map((d) => ({
    ...d,
    date: (() => {
      try {
        return format(parseISO(d.date), "MMM d");
      } catch {
        return d.date;
      }
    })(),
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#555", fontSize: 10, fontFamily: "Space Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#555", fontSize: 10, fontFamily: "Space Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color.replace("#", "")})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

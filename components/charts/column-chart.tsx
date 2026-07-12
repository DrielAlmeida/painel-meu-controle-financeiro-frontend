
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface ColumnSeries {
  key: string;
  label: string;
}

const SERIES_COLORS = ["#60a5fa", "#38bdf8", "#818cf8", "#22d3ee"];

export function ColumnChart({
  data,
  xKey,
  series,
  height = 300,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: ColumnSeries[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.28)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#3f73a0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#3f73a0" }} tickLine={false} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              background: "#0d2b4d",
              border: "1px solid #334155",
              borderRadius: 12,
              color: "#f8fafc",
              boxShadow: "0 14px 40px rgba(2,6,23,.35)",
            }}
            labelStyle={{ color: "#cbd5e1", fontWeight: 700 }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ color: "#cbd5e1" }} />}
          {series.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={SERIES_COLORS[index % SERIES_COLORS.length]}
              radius={[8, 8, 0, 0]}
              maxBarSize={72}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

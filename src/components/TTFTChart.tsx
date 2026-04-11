import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BenchmarkRun } from "../types/benchmark";
import { MODEL_COLORS, shortModelName } from "./chartConfig";

interface TTFTChartProps {
  run: BenchmarkRun | null;
}

export default function TTFTChart({ run }: TTFTChartProps) {
  if (!run) return null;

  const data = Object.values(run.overall)
    .map((m) => ({
      name: shortModelName(m.model),
      model: m.model,
      ttft: Math.round(m.avg_ttft_ms),
    }))
    .sort((a, b) => b.ttft - a.ttft);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Time to First Token (ms)
      </h3>
      <ResponsiveContainer width="100%" height={data.length * 52 + 40}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 30, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: "#d1d5db", fontSize: 11, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e5e7eb" }}
            itemStyle={{ color: "#e5e7eb" }}
            formatter={(value) => [`${Number(value).toLocaleString()}ms`, "TTFT"]}
          />
          <ReferenceLine
            x={1000}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "1s real-time threshold",
              position: "top",
              fill: "#f59e0b",
              fontSize: 10,
            }}
          />
          <Bar dataKey="ttft" radius={[0, 3, 3, 0]} barSize={24}>
            {data.map((entry) => (
              <Cell
                key={entry.model}
                fill={MODEL_COLORS[entry.model] || "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

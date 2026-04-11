import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MODEL_COLORS, shortModelName } from "./chartConfig";
import { formatTimestamp } from "../utils/formatters";

const METRICS = [
  { key: "avg_ttft_ms", label: "TTFT (ms)", format: (v) => `${Math.round(v).toLocaleString()}ms` },
  { key: "avg_latency_ms", label: "Latency (ms)", format: (v) => `${Math.round(v).toLocaleString()}ms` },
  { key: "avg_faithfulness", label: "Faithfulness", format: (v) => v.toFixed(3), domain: [0, 1] },
  { key: "avg_relevance", label: "Relevance", format: (v) => v.toFixed(3), domain: [0, 1] },
  { key: "avg_cost_per_query", label: "Cost / Query", format: (v) => `$${v.toFixed(4)}` },
];

export default function TrendChart({ runs }) {
  const [metricIdx, setMetricIdx] = useState(0);
  const metric = METRICS[metricIdx];

  const allModels = useMemo(() => {
    const set = new Set();
    for (const run of runs) {
      for (const m of run.models) set.add(m);
    }
    return [...set];
  }, [runs]);

  const data = useMemo(() => {
    return runs.map((run) => {
      const point = { ts: formatTimestamp(run.timestamp) };
      for (const model of allModels) {
        const stats = run.overall[model];
        point[model] = stats ? stats[metric.key] : null;
      }
      return point;
    });
  }, [runs, allModels, metric]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">
          Metric Trends Across Runs
        </h3>
        <div className="flex gap-1">
          {METRICS.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setMetricIdx(i)}
              className={`px-3 py-1 text-[11px] rounded cursor-pointer transition-colors ${
                i === metricIdx
                  ? "bg-gray-700 text-gray-200"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="ts"
            tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
          />
          <YAxis
            domain={metric.domain || ["auto", "auto"]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={metric.format}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              fontSize: 11,
            }}
            labelStyle={{ color: "#e5e7eb", fontFamily: "monospace", fontSize: 11 }}
            formatter={(value, name) => [
              value != null ? metric.format(value) : "n/a",
              shortModelName(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
            formatter={(value) => shortModelName(value)}
          />
          {allModels.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              stroke={MODEL_COLORS[model] || "#6b7280"}
              strokeWidth={2}
              dot={{ r: 3, fill: MODEL_COLORS[model] || "#6b7280" }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

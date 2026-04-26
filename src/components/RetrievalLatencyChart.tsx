import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RAGBenchmarkRun } from "../types/benchmark";
import { shortModelName } from "./chartConfig";

interface Props {
  run: RAGBenchmarkRun;
}

export default function RetrievalLatencyChart({ run }: Props) {
  const chartData = Object.values(run.overall).map((m) => ({
    name: shortModelName(m.model),
    p50: Number(m.p50_retrieval_latency_ms.toFixed(2)),
    p95: Number(m.p95_retrieval_latency_ms.toFixed(2)),
  }));

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Retrieval Latency (ms)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#d1d5db", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
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
            formatter={(value) =>
              typeof value === "number" ? `${value.toFixed(2)} ms` : String(value)
            }
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="p50" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={20} />
          <Bar dataKey="p95" fill="#a78bfa" radius={[3, 3, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

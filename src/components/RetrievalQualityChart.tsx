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

export default function RetrievalQualityChart({ run }: Props) {
  const chartData = Object.values(run.overall).map((m) => ({
    name: shortModelName(m.model),
    "recall@k": Number(m.avg_recall_at_k.toFixed(3)),
    "precision@k": Number(m.avg_precision_at_k.toFixed(3)),
    mrr: Number(m.avg_mrr.toFixed(3)),
    "ndcg@k": Number(m.avg_ndcg_at_k.toFixed(3)),
  }));

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        IR Quality Metrics (k = {run.k})
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
            domain={[0, 1]}
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
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Bar dataKey="recall@k" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar dataKey="precision@k" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar dataKey="mrr" fill="#34d399" radius={[3, 3, 0, 0]} barSize={12} />
          <Bar dataKey="ndcg@k" fill="#f97316" radius={[3, 3, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

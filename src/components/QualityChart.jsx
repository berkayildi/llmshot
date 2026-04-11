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
import { shortModelName } from "./chartConfig";

export default function QualityChart({ run, data }) {
  const source = data || (run ? run.overall : null);
  if (!source) return null;

  const chartData = Object.values(source).map((m) => ({
    name: shortModelName(m.model),
    faithfulness: Number((m.avg_faithfulness ?? 0).toFixed(3)),
    relevance: Number((m.avg_relevance ?? 0).toFixed(3)),
  }));

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Quality Scores (0–1)
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
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
          />
          <Bar
            dataKey="faithfulness"
            fill="#3b82f6"
            radius={[3, 3, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="relevance"
            fill="#8b5cf6"
            radius={[3, 3, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

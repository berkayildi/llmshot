import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MODEL_COLORS, shortModelName } from "./chartConfig";

function formatTick(value) {
  if (value >= 0.01) return `$${value.toFixed(2)}`;
  if (value >= 0.001) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(4)}`;
}

export default function CostChart({ run }) {
  if (!run) return null;

  const data = Object.values(run.overall)
    .map((m) => ({
      name: shortModelName(m.model),
      model: m.model,
      cost: m.avg_cost_per_query,
    }))
    .sort((a, b) => b.cost - a.cost);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Cost per Query (log scale)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
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
            scale="log"
            domain={["auto", "auto"]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatTick}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e5e7eb" }}
            formatter={(value) => [`$${value.toFixed(4)}`, "Cost/Query"]}
          />
          <Bar dataKey="cost" radius={[3, 3, 0, 0]} barSize={32}>
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

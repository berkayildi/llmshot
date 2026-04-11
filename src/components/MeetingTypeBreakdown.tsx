import { useState, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { BenchmarkRun } from "../types/benchmark";
import ComparisonTable from "./ComparisonTable";
import QualityChart from "./QualityChart";
import { MODEL_COLORS, shortModelName } from "./chartConfig";

const MEETING_TYPES = [
  { key: "adr", label: "ADR" },
  { key: "sprint", label: "Sprint" },
  { key: "discovery", label: "Discovery" },
];

interface RadarOverviewProps {
  run: BenchmarkRun;
}

function RadarOverview({ run }: RadarOverviewProps) {
  const models = run.models;
  const types = Object.keys(run.byMeetingType);

  const radarData = useMemo(() => {
    const axes: Array<{ axis: string; type: string; metric: "avg_faithfulness" | "avg_relevance" }> = [];
    for (const type of types) {
      axes.push({ axis: `${type.toUpperCase()} Faith.`, type, metric: "avg_faithfulness" });
      axes.push({ axis: `${type.toUpperCase()} Rel.`, type, metric: "avg_relevance" });
    }

    return axes.map((a) => {
      const row: Record<string, string | number> = { axis: a.axis };
      for (const model of models) {
        const stats = run.byMeetingType[a.type]?.[model];
        row[model] = stats?.[a.metric] ?? 0;
      }
      return row;
    });
  }, [run, models, types]);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Quality Across Meeting Types &mdash; Generalist vs Specialist
      </h3>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tick={{ fill: "#6b7280", fontSize: 9 }}
            tickCount={5}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              fontSize: 11,
            }}
            labelStyle={{ color: "#e5e7eb" }}
          />
          {models.map((model) => (
            <Radar
              key={model}
              name={shortModelName(model)}
              dataKey={model}
              stroke={MODEL_COLORS[model] || "#6b7280"}
              fill={MODEL_COLORS[model] || "#6b7280"}
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 8 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MeetingTypeBreakdownProps {
  run: BenchmarkRun | null;
  onModelClick: (model: string) => void;
}

export default function MeetingTypeBreakdown({ run, onModelClick }: MeetingTypeBreakdownProps) {
  const [activeTab, setActiveTab] = useState("adr");

  if (!run || !run.byMeetingType) return null;

  const tabData = run.byMeetingType[activeTab] ?? null;

  return (
    <div className="space-y-6">
      {/* Radar chart */}
      <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
        <RadarOverview run={run} />
      </section>

      {/* Tabbed breakdown */}
      <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg">
        {/* Tab bar */}
        <div className="flex border-b border-gray-800/50">
          {MEETING_TYPES.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-3 text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "text-gray-100 border-b-2 border-blue-500 -mb-px"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-4 space-y-6">
          {tabData ? (
            <>
              <ComparisonTable data={tabData} onModelClick={onModelClick} />
              <QualityChart data={tabData} />
            </>
          ) : (
            <p className="text-gray-500 text-sm py-4">
              No data for this meeting type.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

import { useMemo } from "react";
import type { BenchmarkRun, ModelStats } from "../types/benchmark";
import {
  formatLatency,
  formatCost,
  formatScore,
  formatTimestamp,
} from "../utils/formatters";

interface ComparisonMetric {
  key: keyof ModelStats;
  label: string;
  format: (value: number) => string;
  better: "lower" | "higher" | null;
}

const METRICS: ComparisonMetric[] = [
  { key: "avg_ttft_ms", label: "TTFT", format: formatLatency, better: "lower" },
  { key: "avg_latency_ms", label: "Latency", format: formatLatency, better: "lower" },
  { key: "avg_input_tokens", label: "In Tokens", format: (v) => Math.round(v).toLocaleString(), better: null },
  { key: "avg_output_tokens", label: "Out Tokens", format: (v) => Math.round(v).toLocaleString(), better: null },
  { key: "avg_cost_per_query", label: "Cost/Query", format: formatCost, better: "lower" },
  { key: "avg_faithfulness", label: "Faithfulness", format: formatScore, better: "higher" },
  { key: "avg_relevance", label: "Relevance", format: formatScore, better: "higher" },
];

interface DeltaCellProps {
  oldVal: number | undefined;
  newVal: number | undefined;
  metric: ComparisonMetric;
}

function DeltaCell({ oldVal, newVal, metric }: DeltaCellProps) {
  if (oldVal == null || newVal == null) return <span className="text-gray-600">--</span>;
  const diff = newVal - oldVal;
  if (Math.abs(diff) < 0.0001) return <span className="text-gray-600">--</span>;

  const improved =
    metric.better === "lower" ? diff < 0 :
    metric.better === "higher" ? diff > 0 :
    null;

  const arrow = diff > 0 ? "\u2191" : "\u2193";
  const color = improved === true ? "text-emerald-400" : improved === false ? "text-red-400" : "text-gray-500";

  let formatted: string;
  if (metric.key.includes("cost")) {
    formatted = `${diff > 0 ? "+" : ""}$${diff.toFixed(4)}`;
  } else if (metric.key.includes("faithfulness") || metric.key.includes("relevance")) {
    formatted = `${diff > 0 ? "+" : ""}${diff.toFixed(3)}`;
  } else if (metric.key.includes("tokens")) {
    formatted = `${diff > 0 ? "+" : ""}${Math.round(diff).toLocaleString()}`;
  } else {
    formatted = `${diff > 0 ? "+" : ""}${Math.round(diff).toLocaleString()}ms`;
  }

  return (
    <span className={`${color} font-mono`}>
      {arrow} {formatted}
    </span>
  );
}

interface ModelRowProps {
  model: string;
  runA: BenchmarkRun | null;
  runB: BenchmarkRun | null;
}

function ModelRow({ model, runA, runB }: ModelRowProps) {
  const statsA = runA?.overall?.[model];
  const statsB = runB?.overall?.[model];

  return (
    <>
      <tr className="border-b border-gray-800/50">
        <td
          rowSpan={2}
          className="px-3 py-2 text-xs font-mono font-medium text-gray-200 align-middle whitespace-nowrap border-r border-gray-800/30"
        >
          {model}
        </td>
        {METRICS.map((m) => (
          <td key={`a-${m.key}`} className="px-2 py-1.5 text-right text-xs tabular-nums text-gray-400 font-mono whitespace-nowrap">
            {statsA ? m.format(statsA[m.key] as number) : <span className="text-gray-700">--</span>}
          </td>
        ))}
      </tr>
      <tr className="border-b border-gray-700/30">
        {METRICS.map((m) => (
          <td key={`b-${m.key}`} className="px-2 py-1.5 text-right text-xs tabular-nums whitespace-nowrap">
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-300 font-mono">
                {statsB ? m.format(statsB[m.key] as number) : <span className="text-gray-700">--</span>}
              </span>
              <span className="text-[10px] min-w-[70px] text-right">
                <DeltaCell
                  oldVal={statsA?.[m.key] as number | undefined}
                  newVal={statsB?.[m.key] as number | undefined}
                  metric={m}
                />
              </span>
            </div>
          </td>
        ))}
      </tr>
    </>
  );
}

interface RunComparisonProps {
  runs: BenchmarkRun[];
  idxA: number;
  idxB: number;
  onChangeA: (idx: number) => void;
  onChangeB: (idx: number) => void;
}

export default function RunComparison({ runs, idxA, idxB, onChangeA, onChangeB }: RunComparisonProps) {
  const runA: BenchmarkRun | null = runs[idxA] ?? null;
  const runB: BenchmarkRun | null = runs[idxB] ?? null;

  const allModels = useMemo(() => {
    const set = new Set<string>();
    if (runA) for (const m of runA.models) set.add(m);
    if (runB) for (const m of runB.models) set.add(m);
    return [...set];
  }, [runA, runB]);

  return (
    <div className="space-y-4">
      {/* Run selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-600">Base (A)</span>
          <select
            value={idxA}
            onChange={(e) => onChangeA(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-400 font-mono cursor-pointer hover:border-gray-500 focus:outline-none focus:border-gray-500"
          >
            {runs.map((r, i) => (
              <option key={r.timestamp} value={i}>{formatTimestamp(r.timestamp)}</option>
            ))}
          </select>
        </div>
        <span className="text-gray-700">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-600">Compare (B)</span>
          <select
            value={idxB}
            onChange={(e) => onChangeB(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 font-mono cursor-pointer hover:border-gray-500 focus:outline-none focus:border-gray-500"
          >
            {runs.map((r, i) => (
              <option key={r.timestamp} value={i}>{formatTimestamp(r.timestamp)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                Model
              </th>
              {METRICS.map((m) => (
                <th
                  key={m.key}
                  className="px-2 py-2 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium whitespace-nowrap"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allModels.map((model) => (
              <ModelRow key={model} model={model} runA={runA} runB={runB} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-gray-600 pt-1">
        <span>Top row = Run A (base)</span>
        <span>Bottom row = Run B (compare) with delta</span>
        <span className="text-emerald-400">Green = improved</span>
        <span className="text-red-400">Red = degraded</span>
      </div>
    </div>
  );
}

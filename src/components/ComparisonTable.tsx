import { useState, useMemo } from "react";
import type { ModelStats, BenchmarkRun, CategoryData } from "../types/benchmark";
import {
  formatLatency,
  formatCost,
  formatScore,
} from "../utils/formatters";

interface Column {
  key: keyof ModelStats;
  label: string;
  align: "left" | "right";
  format?: (value: number) => string;
  best?: "min" | "max" | null;
}

const COLUMNS: Column[] = [
  { key: "model", label: "Model", align: "left" },
  { key: "provider", label: "Provider", align: "left" },
  { key: "avg_ttft_ms", label: "TTFT", align: "right", format: formatLatency, best: "min" },
  { key: "avg_latency_ms", label: "Latency", align: "right", format: formatLatency, best: "min" },
  { key: "avg_input_tokens", label: "In Tokens", align: "right", format: (v) => Math.round(v).toLocaleString(), best: null },
  { key: "avg_output_tokens", label: "Out Tokens", align: "right", format: (v) => Math.round(v).toLocaleString(), best: null },
  { key: "avg_cost_per_query", label: "Cost/Query", align: "right", format: formatCost, best: "min" },
  { key: "avg_faithfulness", label: "Faithful.", align: "right", format: formatScore, best: "max" },
  { key: "avg_relevance", label: "Relevance", align: "right", format: formatScore, best: "max" },
];

interface ComparisonTableProps {
  run?: BenchmarkRun;
  data?: CategoryData;
  onModelClick?: (model: string) => void;
}

export default function ComparisonTable({ run, data, onModelClick }: ComparisonTableProps) {
  const [sortKey, setSortKey] = useState<keyof ModelStats>("avg_latency_ms");
  const [sortAsc, setSortAsc] = useState(true);

  const source = data ?? (run ? run.overall : null);

  const rows = useMemo(() => {
    if (!source) return [];
    return Object.values(source)
      .slice()
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string" && typeof bv === "string")
          return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
      });
  }, [source, sortKey, sortAsc]);

  const extremes = useMemo(() => {
    const result: Record<string, { best: number; worst: number }> = {};
    for (const col of COLUMNS) {
      if (!col.best) continue;
      const vals = rows.map((r) => r[col.key]).filter((v): v is number => typeof v === "number");
      if (vals.length === 0) continue;
      result[col.key] = {
        best: col.best === "min" ? Math.min(...vals) : Math.max(...vals),
        worst: col.best === "min" ? Math.max(...vals) : Math.min(...vals),
      };
    }
    return result;
  }, [rows]);

  function handleSort(key: keyof ModelStats) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function cellColor(col: Column, value: string | number) {
    const ex = extremes[col.key];
    if (!ex || value == null) return "";
    if (ex.best === ex.worst) return "";
    if (value === ex.best) return "text-emerald-400";
    if (value === ex.worst) return "text-red-400";
    return "";
  }

  if (!source) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/50">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-300 select-none whitespace-nowrap ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-gray-400">
                    {sortAsc ? "\u2191" : "\u2193"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.model}
              className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
            >
              {COLUMNS.map((col) => {
                const raw = row[col.key];
                const formatted = col.format ? col.format(raw as number) : raw;
                const isModelCol = col.key === "model";
                return (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 tabular-nums whitespace-nowrap ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${
                      isModelCol
                        ? `font-medium font-mono text-xs ${onModelClick ? "text-blue-400 hover:text-blue-300 cursor-pointer" : "text-gray-200"}`
                        : col.key === "provider"
                        ? "text-gray-500"
                        : `text-gray-300 ${cellColor(col, raw)}`
                    }`}
                    onClick={isModelCol && onModelClick ? () => onModelClick(row.model) : undefined}
                  >
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

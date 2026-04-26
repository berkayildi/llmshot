import { useState, useMemo } from "react";
import type { RAGBenchmarkRun, RAGModelStats } from "../types/benchmark";
import { formatCost, formatScore } from "../utils/formatters";

type SortKey =
  | "model"
  | "provider"
  | "avg_recall_at_k"
  | "avg_precision_at_k"
  | "avg_mrr"
  | "avg_ndcg_at_k"
  | "avg_context_relevance"
  | "avg_citation_faithfulness"
  | "avg_cost_per_query";

interface Column {
  key: SortKey;
  label: string;
  align: "left" | "right";
  format?: (v: number | null) => string;
  best?: "min" | "max" | null;
}

const COLUMNS: Column[] = [
  { key: "model", label: "Model", align: "left" },
  { key: "provider", label: "Provider", align: "left" },
  { key: "avg_recall_at_k", label: "Recall@k", align: "right", format: formatScore, best: "max" },
  { key: "avg_precision_at_k", label: "Prec@k", align: "right", format: formatScore, best: "max" },
  { key: "avg_mrr", label: "MRR", align: "right", format: formatScore, best: "max" },
  { key: "avg_ndcg_at_k", label: "nDCG@k", align: "right", format: formatScore, best: "max" },
  { key: "avg_context_relevance", label: "Ctx Rel.", align: "right", format: formatScore, best: "max" },
  { key: "avg_citation_faithfulness", label: "Cite Faith.", align: "right", format: formatScore, best: "max" },
  { key: "avg_cost_per_query", label: "Cost/Query", align: "right", format: (v) => formatCost(v), best: "min" },
];

interface Props {
  run: RAGBenchmarkRun;
}

export default function RetrievalMetricsTable({ run }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("avg_ndcg_at_k");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    return Object.values(run.overall)
      .slice()
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string" && typeof bv === "string")
          return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        const an = av == null ? -Infinity : Number(av);
        const bn = bv == null ? -Infinity : Number(bv);
        return sortAsc ? an - bn : bn - an;
      });
  }, [run, sortKey, sortAsc]);

  const extremes = useMemo(() => {
    const result: Partial<Record<SortKey, { best: number; worst: number }>> = {};
    for (const col of COLUMNS) {
      if (!col.best) continue;
      const vals = rows
        .map((r) => r[col.key as keyof RAGModelStats])
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) continue;
      result[col.key] = {
        best: col.best === "min" ? Math.min(...vals) : Math.max(...vals),
        worst: col.best === "min" ? Math.max(...vals) : Math.min(...vals),
      };
    }
    return result;
  }, [rows]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function cellColor(col: Column, value: number | string | null) {
    const ex = extremes[col.key];
    if (!ex || value == null || typeof value !== "number") return "";
    if (ex.best === ex.worst) return "";
    if (value === ex.best) return "text-emerald-400";
    if (value === ex.worst) return "text-red-400";
    return "";
  }

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
                    {sortAsc ? "↑" : "↓"}
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
                const raw = row[col.key as keyof RAGModelStats] as
                  | number
                  | string
                  | null;
                const formatted =
                  typeof raw === "number" && col.format
                    ? col.format(raw)
                    : raw == null
                    ? "n/a"
                    : raw;
                const isModelCol = col.key === "model";
                return (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 tabular-nums whitespace-nowrap ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${
                      isModelCol
                        ? "font-medium font-mono text-xs text-gray-200"
                        : col.key === "provider"
                        ? "text-gray-500"
                        : `text-gray-300 ${cellColor(col, raw)}`
                    }`}
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

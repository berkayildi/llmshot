import { useMemo } from "react";
import type {
  BenchmarkDetail,
  BenchmarkResult,
  BenchmarkRun,
  CategoryBreakdown,
} from "../types/benchmark";
import {
  formatLatency,
  formatCost,
  formatScore,
} from "../utils/formatters";
import { MODEL_COLORS, shortModelName } from "./chartConfig";

interface StatRowProps {
  label: string;
  value: string | number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-800/50">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-300 text-xs font-mono tabular-nums">{value}</span>
    </div>
  );
}

interface CategoryStatsProps {
  model: string;
  categoryBreakdown: CategoryBreakdown;
}

function CategoryStats({ model, categoryBreakdown }: CategoryStatsProps) {
  const types = Object.keys(categoryBreakdown);
  if (types.length === 0) return null;

  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
        By Category
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {types.map((type) => {
          const stats = categoryBreakdown[type]?.[model];
          if (!stats) return null;
          return (
            <div key={type} className="bg-gray-800/30 rounded px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                {type}
              </p>
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">TTFT</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatLatency(stats.avg_ttft_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Latency</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatLatency(stats.avg_latency_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatCost(stats.avg_cost_per_query)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Runs</span>
                  <span className="text-gray-300 font-mono tabular-nums">{stats.runs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Faith.</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatScore(stats.avg_faithfulness)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Relev.</span>
                  <span className="text-gray-300 font-mono tabular-nums">{formatScore(stats.avg_relevance)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-gray-600";
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.5) return "text-yellow-400";
  return "text-red-400";
}

function formatResponsePreview(text: string): string {
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
  return cleaned.length > 200 ? `${cleaned.slice(0, 200)}...` : cleaned;
}

interface QuestionResultsProps {
  results: BenchmarkResult[];
}

function QuestionResults({ results }: QuestionResultsProps) {
  if (!results || results.length === 0) {
    return <p className="text-gray-600 text-xs">No detailed results available.</p>;
  }

  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
        Individual Questions ({results.length})
      </h4>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {results.map((r, i) => (
          <div key={i} className="bg-gray-800/30 rounded px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                {r.eval_id} &middot; {r.category}
              </span>
              <div className="flex gap-3">
                <span className="text-[10px] text-gray-500">
                  Faith.{" "}
                  <span className={`font-mono ${scoreColor(r.faithfulness_score)}`}>
                    {formatScore(r.faithfulness_score)}
                  </span>
                </span>
                <span className="text-[10px] text-gray-500">
                  Rel.{" "}
                  <span className={`font-mono ${scoreColor(r.relevance_score)}`}>
                    {formatScore(r.relevance_score)}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] text-gray-600 mb-1.5">
              <span>{formatLatency(r.total_latency_ms)}</span>
              <span>{formatCost(r.cost_per_query)}</span>
              <span>{r.input_tokens}in / {r.output_tokens}out</span>
            </div>
            {r.response && (
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {formatResponsePreview(r.response)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ModelDetailProps {
  model: string;
  run: BenchmarkRun | null;
  detail: BenchmarkDetail | null;
  onClose: () => void;
}

export default function ModelDetail({ model, run, detail, onClose }: ModelDetailProps) {
  const overallStats = run?.overall?.[model];
  const color = MODEL_COLORS[model] || "#6b7280";

  const modelResults = useMemo(() => {
    if (!detail?.results) return [];
    return detail.results.filter((r) => r.model === model && !!r.response);
  }, [detail, model]);

  if (!model || !run || !overallStats) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <h2 className="text-sm font-semibold text-gray-100 font-mono">
                {shortModelName(model)}
              </h2>
              <p className="text-[10px] text-gray-600">{overallStats.provider}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 cursor-pointer text-lg leading-none px-1"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Overall
            </h4>
            <StatRow label="Runs" value={overallStats.runs} />
            <StatRow label="Avg TTFT" value={formatLatency(overallStats.avg_ttft_ms)} />
            <StatRow label="Avg Latency" value={formatLatency(overallStats.avg_latency_ms)} />
            <StatRow label="Avg Input Tokens" value={Math.round(overallStats.avg_input_tokens).toLocaleString()} />
            <StatRow label="Avg Output Tokens" value={Math.round(overallStats.avg_output_tokens).toLocaleString()} />
            <StatRow label="Cost / Query" value={formatCost(overallStats.avg_cost_per_query)} />
            <StatRow label="Faithfulness" value={formatScore(overallStats.avg_faithfulness)} />
            <StatRow label="Relevance" value={formatScore(overallStats.avg_relevance)} />
          </div>

          {run.categoryBreakdown && (
            <CategoryStats model={model} categoryBreakdown={run.categoryBreakdown} />
          )}

          <QuestionResults results={modelResults} />
        </div>
      </div>
    </>
  );
}

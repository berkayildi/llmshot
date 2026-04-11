import { useMemo } from "react";
import type { BenchmarkRun, BenchmarkResult, SummaryData } from "../types/benchmark";
import { loadBenchmarkDetail } from "../utils/dataLoader";
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

interface MeetingTypeStatsProps {
  model: string;
  byMeetingType: SummaryData;
}

function MeetingTypeStats({ model, byMeetingType }: MeetingTypeStatsProps) {
  const types = Object.keys(byMeetingType);

  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
        By Meeting Type
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {types.map((type) => {
          const stats = byMeetingType[type]?.[model];
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
                {r.eval_id} &middot; {r.meeting_type}
              </span>
              <div className="flex gap-3">
                <span className="text-[10px] text-gray-500">
                  Faith.{" "}
                  <span className={`font-mono ${r.faithfulness_score >= 0.8 ? "text-emerald-400" : r.faithfulness_score >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                    {formatScore(r.faithfulness_score)}
                  </span>
                </span>
                <span className="text-[10px] text-gray-500">
                  Rel.{" "}
                  <span className={`font-mono ${r.relevance_score >= 0.8 ? "text-emerald-400" : r.relevance_score >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
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
                {r.response.slice(0, 200)}
                {r.response.length > 200 && "..."}
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
  onClose: () => void;
}

export default function ModelDetail({ model, run, onClose }: ModelDetailProps) {
  const overallStats = run?.overall?.[model];
  const color = MODEL_COLORS[model] || "#6b7280";

  const detail = useMemo(() => {
    if (!run) return null;
    return loadBenchmarkDetail(run.timestamp);
  }, [run]);

  const modelResults = useMemo(() => {
    if (!detail?.results) return [];
    return detail.results.filter((r) => r.model === model);
  }, [detail, model]);

  if (!model || !run || !overallStats) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 z-50 overflow-y-auto">
        {/* Header */}
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

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Overall stats */}
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

          {/* Meeting type breakdown */}
          {run.byMeetingType && (
            <MeetingTypeStats model={model} byMeetingType={run.byMeetingType} />
          )}

          {/* Per-question results */}
          <QuestionResults results={modelResults} />
        </div>
      </div>
    </>
  );
}

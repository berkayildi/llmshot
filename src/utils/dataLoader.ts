import type { RawSummary, RawBenchmark, BenchmarkRun, BenchmarkDetail } from "../types/benchmark";

const summaryModules = import.meta.glob("../data/*_summary.json", {
  eager: true,
}) as Record<string, { default: RawSummary }>;

const benchmarkModules = import.meta.glob("../data/*_benchmark.json", {
  eager: true,
}) as Record<string, { default: RawBenchmark }>;

function parseRun(raw: RawSummary): BenchmarkRun {
  return {
    timestamp: raw.timestamp,
    models: Object.keys(raw.overall),
    overall: raw.overall,
    byMeetingType: raw.by_meeting_type,
    totalQuestions: raw.total_questions,
    totalRuns: raw.total_model_runs,
    totalEvalRuns: raw.total_eval_runs,
    totalErrors: raw.total_errors,
    totalElapsedSec: raw.total_elapsed_sec,
    totalEstimatedCost: raw.total_estimated_cost,
    judgeModel: raw.judge_model,
  };
}

export function loadAllRuns(): BenchmarkRun[] {
  return Object.values(summaryModules)
    .map((mod) => parseRun(mod.default))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function loadBenchmarkDetail(timestamp: string): BenchmarkDetail | null {
  const key = Object.keys(benchmarkModules).find((k) => k.includes(timestamp));
  if (!key) return null;
  const raw = benchmarkModules[key].default;
  return {
    timestamp: raw.timestamp,
    models: raw.models,
    judgeModel: raw.judge_model,
    totalEntries: raw.total_entries,
    totalRuns: raw.total_runs,
    totalElapsedSec: raw.total_elapsed_sec,
    results: raw.results,
  };
}

export function getLatestRun(): BenchmarkRun | null {
  const runs = loadAllRuns();
  return runs.length > 0 ? runs[runs.length - 1]! : null;
}

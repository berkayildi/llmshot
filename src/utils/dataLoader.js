/**
 * Load all benchmark summary JSON files from src/data/.
 *
 * Uses Vite's import.meta.glob to eagerly import every *_summary.json file,
 * then returns an array of benchmark run objects sorted by timestamp (oldest first).
 *
 * Each run object has the shape:
 *   { timestamp, models, overall, byMeetingType, totalQuestions, totalRuns, totalErrors, totalElapsedSec, totalEstimatedCost, judgeModel }
 */

const summaryModules = import.meta.glob("../data/*_summary.json", {
  eager: true,
});

const benchmarkModules = import.meta.glob("../data/*_benchmark.json", {
  eager: true,
});

/**
 * Parse a summary JSON module into a normalised run object.
 */
function parseRun(raw) {
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

/**
 * Load all summary runs, sorted by timestamp ascending.
 * @returns {Array} benchmark run objects
 */
export function loadAllRuns() {
  const runs = Object.values(summaryModules)
    .map((mod) => parseRun(mod.default ?? mod))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return runs;
}

/**
 * Load the detailed benchmark results for a given timestamp.
 * @param {string} timestamp e.g. "20260406_213604"
 * @returns {object|null} the full benchmark object, or null if not found
 */
export function loadBenchmarkDetail(timestamp) {
  const key = Object.keys(benchmarkModules).find((k) =>
    k.includes(timestamp)
  );
  if (!key) return null;
  const raw = benchmarkModules[key].default ?? benchmarkModules[key];
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

/**
 * Get the latest run, or null if no data is loaded.
 * @returns {object|null}
 */
export function getLatestRun() {
  const runs = loadAllRuns();
  return runs.length > 0 ? runs[runs.length - 1] : null;
}

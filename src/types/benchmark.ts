/** Per-model aggregate statistics from benchmark summary */
export interface ModelStats {
  runs: number;
  avg_ttft_ms: number;
  avg_latency_ms: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  avg_cost_per_query: number;
  avg_faithfulness: number;
  avg_relevance: number;
  provider: string;
  model: string;
}

/** Stats grouped by meeting type — each key is a model name */
export type MeetingTypeData = Record<string, ModelStats>;

/** All meeting type breakdowns — each key is a meeting type (e.g. "adr", "sprint") */
export type SummaryData = Record<string, MeetingTypeData>;

/** Raw summary JSON schema as stored on disk */
export interface RawSummary {
  timestamp: string;
  total_questions: number;
  total_model_runs: number;
  total_eval_runs: number;
  total_errors: number;
  total_elapsed_sec: number;
  total_estimated_cost: number;
  judge_model: string;
  overall: Record<string, ModelStats>;
  by_meeting_type: SummaryData;
}

/** Normalized benchmark run after parsing */
export interface BenchmarkRun {
  timestamp: string;
  models: string[];
  overall: Record<string, ModelStats>;
  byMeetingType: SummaryData;
  totalQuestions: number;
  totalRuns: number;
  totalEvalRuns: number;
  totalErrors: number;
  totalElapsedSec: number;
  totalEstimatedCost: number;
  judgeModel: string;
}

/** Individual benchmark result per question per model */
export interface BenchmarkResult {
  eval_id: string;
  meeting_type: string;
  model: string;
  provider: string;
  response: string;
  input_tokens: number;
  output_tokens: number;
  stop_reason: string;
  time_to_first_token_ms: number;
  total_latency_ms: number;
  cost_per_query: number;
  faithfulness_score: number;
  faithfulness_reason: string;
  relevance_score: number;
  relevance_reason: string;
  judge_model: string;
}

/** Raw benchmark detail JSON schema */
export interface RawBenchmark {
  timestamp: string;
  total_entries: number;
  models: string[];
  judge_model: string;
  total_runs: number;
  total_elapsed_sec: number;
  results: BenchmarkResult[];
}

/** Parsed benchmark detail */
export interface BenchmarkDetail {
  timestamp: string;
  models: string[];
  judgeModel: string;
  totalEntries: number;
  totalRuns: number;
  totalElapsedSec: number;
  results: BenchmarkResult[];
}

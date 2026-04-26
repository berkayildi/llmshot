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

/** Per-category stats. Key is model name. */
export type CategoryData = Record<string, ModelStats>;

/** All category breakdowns. Key is a category name (e.g. "adr", "factual"). */
export type CategoryBreakdown = Record<string, CategoryData>;

/** Raw summary JSON — realtime variant uses `by_meeting_type`, text-gen uses `by_category`. */
export interface RawSummary {
  timestamp: string;
  total_questions: number;
  total_model_runs: number;
  total_eval_runs?: number;
  total_errors: number;
  total_elapsed_sec: number;
  total_estimated_cost: number;
  judge_model: string;
  overall: Record<string, ModelStats>;
  by_meeting_type?: CategoryBreakdown;
  by_category?: CategoryBreakdown;
}

/** Normalized benchmark run. */
export interface BenchmarkRun {
  timestamp: string;
  models: string[];
  overall: Record<string, ModelStats>;
  categoryBreakdown: CategoryBreakdown;
  totalQuestions: number;
  totalRuns: number;
  totalEvalRuns: number;
  totalErrors: number;
  totalElapsedSec: number;
  totalEstimatedCost: number;
  judgeModel: string;
}

/** Individual benchmark result — category normalized. */
export interface BenchmarkResult {
  eval_id: string;
  category: string;
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

/** Raw per-result record — realtime uses `meeting_type`, text-gen uses `category`. */
export interface RawBenchmarkResult {
  eval_id: string;
  meeting_type?: string;
  category?: string;
  model: string;
  provider: string;
  response?: string;
  input_tokens?: number;
  output_tokens?: number;
  stop_reason?: string;
  time_to_first_token_ms?: number;
  total_latency_ms?: number;
  cost_per_query?: number;
  faithfulness_score?: number;
  faithfulness_reason?: string;
  relevance_score?: number;
  relevance_reason?: string;
  judge_model?: string;
  error?: string;
}

export interface RawBenchmark {
  timestamp: string;
  total_entries: number;
  models: string[];
  judge_model: string;
  total_runs: number;
  total_elapsed_sec: number;
  results: RawBenchmarkResult[];
}

export interface BenchmarkDetail {
  timestamp: string;
  models: string[];
  judgeModel: string;
  totalEntries: number;
  totalRuns: number;
  totalElapsedSec: number;
  results: BenchmarkResult[];
}

export interface SourceLink {
  label: string;
  url: string;
}

/** Sub-benchmark inside a domain (e.g. "Eval Gates" under Text Generation). */
export interface SubBenchmarkConfig {
  id: string;
  name: string;
  description: string;
  summaryPath: string;
  benchmarkPath: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  headline: string;
  route: string;
  sourceLinks: SourceLink[];
  subBenchmarks: SubBenchmarkConfig[];
}

/** Fetched run + detail for a single sub-benchmark. */
export interface SubBenchmarkData {
  run: BenchmarkRun;
  detail: BenchmarkDetail;
}

/** Top-level data for a domain. Each sub-benchmark keyed by its id. */
export interface DomainData {
  domain: DomainConfig;
  subBenchmarks: Record<string, SubBenchmarkData>;
}

export type LoadResult<T> = { data: T } | { error: string };

/** Per-model retrieval/RAG metrics in the overall block. */
export interface RAGModelStats {
  provider: string;
  model: string;
  runs: number;
  k: number;
  avg_recall_at_k: number;
  avg_precision_at_k: number;
  avg_mrr: number;
  avg_ndcg_at_k: number;
  avg_context_relevance: number | null;
  avg_citation_faithfulness: number | null;
  avg_retrieval_latency_ms: number;
  p50_retrieval_latency_ms: number;
  p95_retrieval_latency_ms: number;
  avg_ttft_ms: number;
  avg_latency_ms: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  avg_cost_per_query: number;
}

/** Raw retrieval/RAG summary JSON. */
export interface RawRAGSummary {
  timestamp: string;
  k: number;
  /** Single adapter (legacy) or comma-joined names for multi-retriever runs. */
  adapter?: string;
  /** Multi-retriever runs (evaluate-rag-multi) carry the full list here. */
  adapters?: string[];
  total_queries: number;
  total_questions: number;
  total_model_runs: number;
  total_errors: number;
  total_elapsed_sec: number;
  total_estimated_cost: number;
  judge_model: string | null;
  skipped: string[];
  overall: Record<string, RAGModelStats>;
  by_category: Record<string, never>;
  results?: unknown[];
}

/** Normalised retrieval/RAG run. */
export interface RAGBenchmarkRun {
  timestamp: string;
  models: string[];
  overall: Record<string, RAGModelStats>;
  k: number;
  adapter: string;
  adapters?: string[];
  totalQueries: number;
  totalRuns: number;
  totalErrors: number;
  totalElapsedSec: number;
  totalEstimatedCost: number;
  judgeModel: string | null;
}

export interface RAGSubBenchmarkData {
  run: RAGBenchmarkRun;
}

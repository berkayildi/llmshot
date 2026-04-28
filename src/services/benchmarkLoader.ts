import type {
  BenchmarkDetail,
  BenchmarkRun,
  CategoryBreakdown,
  DomainConfig,
  DomainData,
  LoadResult,
  RAGBenchmarkRun,
  RAGSubBenchmarkData,
  RawBenchmark,
  RawRAGSummary,
  RawSummary,
  SubBenchmarkConfig,
  SubBenchmarkData,
} from "../types/benchmark";

const GITHUB_BASE = "https://berkayildi.github.io/llm-benchmarks";

export const DOMAINS: Record<string, DomainConfig> = {
  realtime: {
    id: "realtime",
    name: "Real-Time Inference",
    description:
      "Which model works for latency-critical streaming? Tested across 3 task types.",
    subtitle:
      "Tested across ADR, sprint planning, and client discovery meeting transcripts.",
    headline: "No single model wins",
    route: "/realtime",
    sourceLinks: [],
    subBenchmarks: [
      {
        id: "realtime",
        name: "Real-Time Inference",
        description: "",
        summaryPath: "realtime/summary.json",
        benchmarkPath: "realtime/benchmark.json",
      },
    ],
  },
  retrieval: {
    id: "retrieval",
    name: "Retrieval & RAG",
    description:
      "BM25 vs embedding retrieval over AWS documentation. Quality, latency, and citation faithfulness.",
    subtitle:
      "BM25 baseline plus OpenAI and Google embedding adapters. Anthropic doesn't ship a public embeddings API, so it's not in the embeddings comparison.",
    headline: "Google embeddings lead recall and nDCG; BM25 wins on cost.",
    route: "/retrieval",
    sourceLinks: [
      {
        label: "mcp-llm-eval",
        url: "https://github.com/berkayildi/mcp-llm-eval",
      },
    ],
    subBenchmarks: [
      {
        id: "bm25-baseline",
        name: "BM25 Baseline",
        description:
          "Lexical keyword-matching baseline. IR metrics are identical across the 5 generation models because BM25 is model-agnostic.",
        summaryPath: "retrieval/eval-gates-rag-summary.json",
        benchmarkPath: "retrieval/eval-gates-rag-benchmark.json",
      },
      {
        id: "embeddings",
        name: "Embeddings Comparison",
        description:
          "Vector retrieval across 3 embedding models (OpenAI text-embedding-3-small, text-embedding-3-large, Google gemini-embedding-001). IR metrics differ per retriever because each model retrieves different chunks.",
        summaryPath: "retrieval/embeddings-summary.json",
        benchmarkPath: "retrieval/embeddings-benchmark.json",
      },
    ],
  },
  "text-generation": {
    id: "text-generation",
    name: "Text Generation",
    description:
      "Structured text output quality. Claude vs Gemini vs GPT on analysis and reasoning tasks.",
    headline: "Gemini Flash-Lite: 45x cheaper, 0.95 quality",
    route: "/text-generation",
    sourceLinks: [
      {
        label: "mcp-llm-eval",
        url: "https://github.com/berkayildi/mcp-llm-eval",
      },
      {
        label: "mcp-content-pipeline",
        url: "https://github.com/berkayildi/mcp-content-pipeline",
      },
    ],
    subBenchmarks: [
      {
        id: "eval-gates",
        name: "Eval Gates",
        description:
          "CI/CD quality gates for LLM pipelines (mcp-llm-eval).",
        summaryPath: "text-generation/eval-gates-summary.json",
        benchmarkPath: "text-generation/eval-gates-benchmark.json",
      },
      {
        id: "content-pipeline",
        name: "Content Pipeline",
        description:
          "Automated video and feed analysis (mcp-content-pipeline).",
        summaryPath: "text-generation/content-pipeline-summary.json",
        benchmarkPath: "text-generation/content-pipeline-benchmark.json",
      },
    ],
  },
};

function normalizeCategoryBreakdown(raw: RawSummary): CategoryBreakdown {
  return raw.by_category ?? raw.by_meeting_type ?? {};
}

function parseRun(raw: RawSummary): BenchmarkRun {
  return {
    timestamp: raw.timestamp,
    models: Object.keys(raw.overall),
    overall: raw.overall,
    categoryBreakdown: normalizeCategoryBreakdown(raw),
    totalQuestions: raw.total_questions,
    totalRuns: raw.total_model_runs,
    totalEvalRuns: raw.total_eval_runs ?? raw.total_model_runs,
    totalErrors: raw.total_errors,
    totalElapsedSec: raw.total_elapsed_sec,
    totalEstimatedCost: raw.total_estimated_cost,
    judgeModel: raw.judge_model,
  };
}

function parseDetail(raw: RawBenchmark): BenchmarkDetail {
  return {
    timestamp: raw.timestamp,
    models: raw.models,
    judgeModel: raw.judge_model,
    totalEntries: raw.total_entries,
    totalRuns: raw.total_runs,
    totalElapsedSec: raw.total_elapsed_sec,
    results: raw.results
      .filter((r) => !r.error)
      .map((r) => ({
        eval_id: r.eval_id,
        category: r.category ?? r.meeting_type ?? "",
        model: r.model,
        provider: r.provider,
        response: r.response ?? "",
        input_tokens: r.input_tokens ?? 0,
        output_tokens: r.output_tokens ?? 0,
        stop_reason: r.stop_reason ?? "",
        time_to_first_token_ms: r.time_to_first_token_ms ?? 0,
        total_latency_ms: r.total_latency_ms ?? 0,
        cost_per_query: r.cost_per_query ?? 0,
        faithfulness_score: r.faithfulness_score ?? 0,
        faithfulness_reason: r.faithfulness_reason ?? "",
        relevance_score: r.relevance_score ?? 0,
        relevance_reason: r.relevance_reason ?? "",
        judge_model: r.judge_model ?? "",
      })),
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_BASE}/${path}`);
  if (!res.ok) {
    throw new Error(`Fetch failed (${res.status}): ${path}`);
  }
  return (await res.json()) as T;
}

export async function fetchSubBenchmark(
  sub: SubBenchmarkConfig,
): Promise<LoadResult<SubBenchmarkData>> {
  try {
    const [summary, benchmark] = await Promise.all([
      fetchJson<RawSummary>(sub.summaryPath),
      fetchJson<RawBenchmark>(sub.benchmarkPath),
    ]);
    return {
      data: {
        run: parseRun(summary),
        detail: parseDetail(benchmark),
      },
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

export interface DomainStats {
  models: number;
  questions: number;
  runs: number;
  totalCost: number;
}

export async function fetchDomainStats(
  domainId: string,
): Promise<LoadResult<DomainStats>> {
  const domain = DOMAINS[domainId];
  if (!domain) return { error: `Unknown domain: ${domainId}` };

  try {
    const summaries = await Promise.all(
      domain.subBenchmarks.map((sub) => fetchJson<RawSummary>(sub.summaryPath)),
    );
    const modelSet = new Set<string>();
    let questions = 0;
    let runs = 0;
    let totalCost = 0;
    for (const s of summaries) {
      Object.keys(s.overall).forEach((m) => modelSet.add(m));
      questions += s.total_questions;
      runs += s.total_model_runs;
      totalCost += s.total_estimated_cost;
    }
    return {
      data: {
        models: modelSet.size,
        questions,
        runs,
        totalCost,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown fetch error" };
  }
}

export async function fetchDomain(
  domainId: string,
): Promise<LoadResult<DomainData>> {
  const domain = DOMAINS[domainId];
  if (!domain) {
    return { error: `Unknown domain: ${domainId}` };
  }

  const results = await Promise.all(
    domain.subBenchmarks.map(async (sub) => {
      const r = await fetchSubBenchmark(sub);
      return { sub, result: r };
    }),
  );

  const subBenchmarks: Record<string, SubBenchmarkData> = {};
  for (const { sub, result } of results) {
    if ("error" in result) return { error: result.error };
    subBenchmarks[sub.id] = result.data;
  }

  return { data: { domain, subBenchmarks } };
}

function parseRAGRun(raw: RawRAGSummary): RAGBenchmarkRun {
  const adapter =
    raw.adapter ??
    (raw.adapters && raw.adapters.length > 0 ? raw.adapters.join(",") : "");
  return {
    timestamp: raw.timestamp,
    models: Object.keys(raw.overall),
    overall: raw.overall,
    k: raw.k,
    adapter,
    adapters: raw.adapters,
    totalQueries: raw.total_queries,
    totalRuns: raw.total_model_runs,
    totalErrors: raw.total_errors,
    totalElapsedSec: raw.total_elapsed_sec,
    totalEstimatedCost: raw.total_estimated_cost,
    judgeModel: raw.judge_model,
  };
}

export async function fetchRAGSubBenchmark(
  sub: SubBenchmarkConfig,
): Promise<LoadResult<RAGSubBenchmarkData>> {
  try {
    const summary = await fetchJson<RawRAGSummary>(sub.summaryPath);
    return { data: { run: parseRAGRun(summary) } };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

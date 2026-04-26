import { useEffect, useState } from "react";
import type { LoadResult, RAGSubBenchmarkData } from "../types/benchmark";
import { DOMAINS, fetchRAGSubBenchmark } from "../services/benchmarkLoader";
import RetrievalOverviewCards from "./RetrievalOverviewCards";
import RetrievalMetricsTable from "./RetrievalMetricsTable";
import RetrievalQualityChart from "./RetrievalQualityChart";
import RetrievalLatencyChart from "./RetrievalLatencyChart";

export default function RetrievalDashboard() {
  const [state, setState] = useState<LoadResult<RAGSubBenchmarkData> | null>(
    null,
  );
  const domain = DOMAINS.retrieval;
  const sub = domain.subBenchmarks[0];

  useEffect(() => {
    let cancelled = false;
    setState(null);
    fetchRAGSubBenchmark(sub).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [sub]);

  if (state === null) {
    return (
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">Loading retrieval benchmark...</p>
        </div>
      </main>
    );
  }

  if ("error" in state) {
    return (
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="bg-red-950/30 border border-red-900/70 rounded-lg p-6">
          <p className="text-sm text-red-300/80 font-mono">{state.error}</p>
        </div>
      </main>
    );
  }

  const { run } = state.data;

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-100 tracking-tight">
          {domain.name}
        </h1>
        <p className="text-xs text-gray-500 mt-1">{domain.description}</p>
        {domain.subtitle && (
          <p className="text-xs text-gray-600 mt-1">{domain.subtitle}</p>
        )}
      </div>

      <RetrievalOverviewCards run={run} />

      <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          IR Metrics by Model
        </h2>
        <RetrievalMetricsTable run={run} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
          <RetrievalQualityChart run={run} />
        </section>
        <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
          <RetrievalLatencyChart run={run} />
        </section>
      </div>
    </main>
  );
}

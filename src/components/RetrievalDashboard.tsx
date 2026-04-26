import { useEffect, useState } from "react";
import type { LoadResult, RAGSubBenchmarkData } from "../types/benchmark";
import { DOMAINS, fetchRAGSubBenchmark } from "../services/benchmarkLoader";
import RetrievalOverviewCards from "./RetrievalOverviewCards";
import RetrievalMetricsTable from "./RetrievalMetricsTable";
import RetrievalQualityChart from "./RetrievalQualityChart";
import RetrievalLatencyChart from "./RetrievalLatencyChart";

export default function RetrievalDashboard() {
  const domain = DOMAINS.retrieval;
  const subs = domain.subBenchmarks;
  const [activeSubId, setActiveSubId] = useState<string>(subs[0]!.id);
  const [state, setState] = useState<LoadResult<RAGSubBenchmarkData> | null>(
    null,
  );

  const activeSub = subs.find((s) => s.id === activeSubId) ?? subs[0]!;
  const hasMultipleSubs = subs.length > 1;

  useEffect(() => {
    let cancelled = false;
    setState(null);
    fetchRAGSubBenchmark(activeSub).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSub]);

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

      {hasMultipleSubs && (
        <div>
          <div className="flex gap-0 border-b border-gray-800 overflow-x-auto">
            {subs.map((sub) => {
              const isActive = activeSub.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubId(sub.id)}
                  className={`px-4 pb-3 text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors -mb-px whitespace-nowrap ${
                    isActive
                      ? "text-gray-100 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-400 border-b-2 border-transparent"
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
          {activeSub.description && (
            <p className="text-xs text-gray-500 mt-3">{activeSub.description}</p>
          )}
        </div>
      )}

      {state === null ? (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">Loading retrieval benchmark...</p>
        </div>
      ) : "error" in state ? (
        <div className="bg-red-950/30 border border-red-900/70 rounded-lg p-6">
          <p className="text-sm text-red-300/80 font-mono">{state.error}</p>
        </div>
      ) : (
        <>
          <RetrievalOverviewCards run={state.data.run} />

          <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              {activeSub.id === "embeddings"
                ? "IR Metrics by Embedding Model"
                : "IR Metrics by Model"}
            </h2>
            <RetrievalMetricsTable run={state.data.run} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
              <RetrievalQualityChart run={state.data.run} />
            </section>
            <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
              <RetrievalLatencyChart run={state.data.run} />
            </section>
          </div>
        </>
      )}
    </main>
  );
}

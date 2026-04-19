import { useEffect, useState } from "react";
import type { DomainData, LoadResult, SourceLink } from "../types/benchmark";
import { fetchDomain } from "../services/benchmarkLoader";
import OverviewCards from "./OverviewCards";
import ComparisonTable from "./ComparisonTable";
import TTFTChart from "./TTFTChart";
import CostChart from "./CostChart";
import QualityChart from "./QualityChart";
import CategoryBreakdown from "./CategoryBreakdown";
import ModelDetail from "./ModelDetail";

interface DomainDashboardProps {
  domainId: string;
}

function SourceRow({ links }: { links: SourceLink[] }) {
  if (links.length === 0) return null;
  return (
    <p className="text-xs text-gray-600 mt-2">
      <span className="uppercase tracking-wider mr-2">Source</span>
      {links.map((l, i) => (
        <span key={l.url}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 no-underline hover:underline hover:text-gray-400 transition-colors"
          >
            {l.label}
          </a>
          {i < links.length - 1 && <span className="text-gray-700"> &middot; </span>}
        </span>
      ))}
    </p>
  );
}

export default function DomainDashboard({ domainId }: DomainDashboardProps) {
  const [state, setState] = useState<LoadResult<DomainData> | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState(null);
    setSelectedModel(null);
    fetchDomain(domainId).then((result) => {
      if (cancelled) return;
      setState(result);
      if ("data" in result) {
        const firstSubId = result.data.domain.subBenchmarks[0]?.id ?? null;
        setActiveSubId(firstSubId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [domainId, reloadToken]);

  if (state === null) {
    return (
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">Loading benchmark...</p>
        </div>
      </main>
    );
  }

  if ("error" in state) {
    return (
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="bg-red-950/30 border border-red-900/70 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-red-400 mb-2">
            Failed to load benchmark
          </h2>
          <p className="text-sm text-red-300/80 font-mono mb-4">{state.error}</p>
          <button
            onClick={() => setReloadToken((n) => n + 1)}
            className="px-3 py-1.5 text-xs font-medium text-gray-100 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const { domain, subBenchmarks } = state.data;
  const hasMultipleSubs = domain.subBenchmarks.length > 1;
  const activeSubConfig =
    domain.subBenchmarks.find((s) => s.id === activeSubId) ?? domain.subBenchmarks[0]!;
  const activeSub = subBenchmarks[activeSubConfig.id]!;
  const { run, detail } = activeSub;

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
        <SourceRow links={domain.sourceLinks} />
      </div>

      {hasMultipleSubs && (
        <div className="mb-6">
          <div className="flex gap-0 border-b border-gray-800">
            {domain.subBenchmarks.map((sub) => {
              const isActive = activeSubConfig.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubId(sub.id)}
                  className={`px-4 pb-3 text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors -mb-px ${
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
          {activeSubConfig.description && (
            <p className="text-xs text-gray-500 mt-3">{activeSubConfig.description}</p>
          )}
        </div>
      )}

      <OverviewCards run={run} />

      <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Model Comparison
        </h2>
        <ComparisonTable run={run} onModelClick={setSelectedModel} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
          <TTFTChart run={run} />
        </section>
        <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
          <CostChart run={run} />
        </section>
      </div>

      <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
        <QualityChart run={run} />
      </section>

      <div className="pt-2">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
          Category Breakdown
        </h2>
        <CategoryBreakdown run={run} onModelClick={setSelectedModel} />
      </div>

      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          run={run}
          detail={detail}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </main>
  );
}

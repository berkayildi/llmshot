import { useState, useMemo } from "react";
import { loadAllRuns } from "../utils/dataLoader";
import { formatTimestamp } from "../utils/formatters";
import OverviewCards from "./OverviewCards";
import ComparisonTable from "./ComparisonTable";
import TTFTChart from "./TTFTChart";
import QualityChart from "./QualityChart";
import CostChart from "./CostChart";
import MeetingTypeBreakdown from "./MeetingTypeBreakdown";
import ModelDetail from "./ModelDetail";
import TrendChart from "./TrendChart";
import RunComparison from "./RunComparison";

const TABS = [
  { key: "latest", label: "Latest Run" },
  { key: "trends", label: "Trends" },
];

export default function BenchmarkDashboard() {
  const runs = useMemo(() => loadAllRuns(), []);
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedIdx, setSelectedIdx] = useState(runs.length - 1);
  const [selectedModel, setSelectedModel] = useState(null);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(runs.length - 1);
  const run = runs[selectedIdx] ?? null;

  if (runs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          No benchmark data found. Place{" "}
          <code className="text-gray-400">*_summary.json</code> files in{" "}
          <code className="text-gray-400">src/data/</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-base font-semibold text-gray-100 tracking-tight">
                LLMShot
              </h1>
              <p className="text-[11px] text-gray-600 mt-0.5">
                LLM performance &middot; quality &middot; cost analysis
              </p>
            </div>
            {activeTab === "latest" && (
              <div className="flex items-center gap-3">
                <label className="text-[11px] uppercase tracking-wider text-gray-600">
                  Run
                </label>
                <select
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 cursor-pointer hover:border-gray-500 focus:outline-none focus:border-gray-500 font-mono"
                >
                  {runs.map((r, i) => (
                    <option key={r.timestamp} value={i}>
                      {formatTimestamp(r.timestamp)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Tab bar */}
          <div className="flex gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 pb-3 text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                  activeTab === tab.key
                    ? "text-gray-100 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {activeTab === "latest" && (
          <>
            {/* Overview cards */}
            <OverviewCards run={run} />

            {/* Comparison table */}
            <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Model Comparison
              </h2>
              <ComparisonTable run={run} onModelClick={setSelectedModel} />
            </section>

            {/* Charts row */}
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

            {/* Meeting type breakdown */}
            <div className="pt-2">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                Meeting Type Breakdown
              </h2>
              <MeetingTypeBreakdown run={run} onModelClick={setSelectedModel} />
            </div>
          </>
        )}

        {activeTab === "trends" && (
          <>
            {runs.length < 2 ? (
              <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-12 text-center">
                <p className="text-gray-500 text-sm">
                  Run more benchmarks to see trends.
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Trend analysis requires 2+ benchmark runs. Currently{" "}
                  <span className="text-gray-400 font-mono">{runs.length}</span>{" "}
                  run loaded.
                </p>
              </div>
            ) : (
              <>
                {/* Trend line chart */}
                <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                  <TrendChart runs={runs} />
                </section>

                {/* Run comparison */}
                <section className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                  <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                    Run Comparison
                  </h2>
                  <RunComparison
                    runs={runs}
                    idxA={compareA}
                    idxB={compareB}
                    onChangeA={setCompareA}
                    onChangeB={setCompareB}
                  />
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <p className="text-[11px] text-gray-700">
            llmshot &middot; benchmark data auto-loaded from src/data/
          </p>
        </div>
      </footer>

      {/* Model detail panel */}
      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          run={run}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}

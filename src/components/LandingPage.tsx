import { useEffect, useState } from "react";
import { DOMAINS, fetchDomainStats } from "../services/benchmarkLoader";
import type { DomainConfig } from "../types/benchmark";
import { formatCost } from "../utils/formatters";

interface DomainCardProps {
  domain: DomainConfig;
}

interface Stats {
  models: number;
  questions: number;
  runs: number;
  totalCost: number;
}

function DomainCard({ domain }: DomainCardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDomainStats(domain.id).then((result) => {
      if (cancelled) return;
      if ("error" in result) setError(result.error);
      else setStats(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [domain.id]);

  return (
    <a
      href={domain.route}
      className="group block bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-gray-900/80 transition-colors"
    >
      <h2 className="text-lg font-semibold text-gray-100 tracking-tight">
        {domain.name}
      </h2>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
        {domain.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-wider text-gray-500">
        {stats ? (
          <>
            <span>
              <span className="text-gray-200 font-mono tabular-nums">
                {stats.models}
              </span>{" "}
              models
            </span>
            <span>
              <span className="text-gray-200 font-mono tabular-nums">
                {stats.runs}
              </span>{" "}
              runs
            </span>
            <span>
              <span className="text-gray-200 font-mono tabular-nums">
                {formatCost(stats.totalCost)}
              </span>{" "}
              total cost
            </span>
          </>
        ) : error ? (
          <span className="text-red-400 normal-case tracking-normal">{error}</span>
        ) : (
          <span className="text-gray-600 normal-case tracking-normal">Loading stats...</span>
        )}
      </div>

      <p className="mt-5 text-sm text-blue-400 font-medium">
        {domain.headline}
      </p>

      <p className="mt-4 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
        View dashboard &rarr;
      </p>
    </a>
  );
}

export default function LandingPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl font-semibold text-gray-100 tracking-tight">
          LLM benchmarks across workloads
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Head-to-head comparisons of frontier models on real tasks &mdash; latency,
          quality, and cost measured under production conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.values(DOMAINS).map((d) => (
          <DomainCard key={d.id} domain={d} />
        ))}
      </div>
    </main>
  );
}

import type { BenchmarkRun } from "../types/benchmark";
import { formatCost } from "../utils/formatters";

interface CardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function Card({ label, value, sub }: CardProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-5 py-4">
      <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-100 tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

interface OverviewCardsProps {
  run: BenchmarkRun | null;
}

export default function OverviewCards({ run }: OverviewCardsProps) {
  if (!run) return null;

  const elapsed =
    run.totalElapsedSec < 60
      ? `${run.totalElapsedSec.toFixed(1)}s`
      : `${(run.totalElapsedSec / 60).toFixed(1)}m`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Models"
        value={run.models.length}
        sub="benchmarked"
      />
      <Card
        label="Questions"
        value={run.totalQuestions}
        sub={`${run.totalRuns} total runs`}
      />
      <Card
        label="Total Cost"
        value={formatCost(run.totalEstimatedCost)}
        sub={`judge: ${run.judgeModel}`}
      />
      <Card
        label="Elapsed"
        value={elapsed}
        sub={`${run.totalErrors} errors`}
      />
    </div>
  );
}

export function formatLatency(ms: number | null): string {
  if (ms == null) return "n/a";
  return `${Math.round(ms).toLocaleString("en-US")}ms`;
}

export function formatCost(dollars: number | null): string {
  if (dollars == null) return "n/a";
  if (dollars === 0) return "$0.00";
  if (dollars < 0.1) return `$${dollars.toFixed(4)}`;
  return `$${dollars.toFixed(2)}`;
}

export function formatScore(score: number | null): string {
  if (score == null) return "n/a";
  return score.toFixed(2);
}


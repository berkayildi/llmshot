export function formatLatency(ms: number | null): string {
  if (ms == null) return "n/a";
  return `${Math.round(ms).toLocaleString("en-US")}ms`;
}

export function formatCost(dollars: number | null): string {
  if (dollars == null) return "n/a";
  if (dollars === 0) return "$0.00";
  if (dollars < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function formatScore(score: number | null): string {
  if (score == null) return "n/a";
  return score.toFixed(2);
}

export function formatTimestamp(ts: string): string {
  if (!ts) return "n/a";
  const year = ts.slice(0, 4);
  const month = ts.slice(4, 6);
  const day = ts.slice(6, 8);
  const hour = ts.slice(9, 11);
  const min = ts.slice(11, 13);

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(min)
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

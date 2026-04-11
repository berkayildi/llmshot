/**
 * Format latency in milliseconds with thousands separator.
 * @param {number|null} ms
 * @returns {string} e.g. "1,234ms"
 */
export function formatLatency(ms) {
  if (ms == null) return "n/a";
  return `${Math.round(ms).toLocaleString("en-US")}ms`;
}

/**
 * Format a dollar cost with enough decimal places to be meaningful.
 * @param {number|null} dollars
 * @returns {string} e.g. "$0.0026"
 */
export function formatCost(dollars) {
  if (dollars == null) return "n/a";
  if (dollars === 0) return "$0.00";
  if (dollars < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format a 0–1 score to two decimal places.
 * @param {number|null} score
 * @returns {string} e.g. "0.88"
 */
export function formatScore(score) {
  if (score == null) return "n/a";
  return score.toFixed(2);
}

/**
 * Format a benchmark timestamp string into a readable date.
 * Input format: "YYYYMMDD_HHMMSS"
 * @param {string} ts
 * @returns {string} e.g. "Apr 6, 2026 19:21"
 */
export function formatTimestamp(ts) {
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

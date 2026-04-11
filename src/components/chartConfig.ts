export const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet-4-6": "#f97316",
  "claude-haiku-4-5-20251001": "#a78bfa",
  "gpt-4o-mini": "#34d399",
  "gemini-2.5-flash": "#38bdf8",
  "gemini-2.5-flash-lite": "#67e8f9",
};

const SHORT_NAMES: Record<string, string> = {
  "claude-sonnet-4-6": "sonnet-4.6",
  "claude-haiku-4-5-20251001": "haiku-4.5",
  "gpt-4o-mini": "gpt-4o-mini",
  "gemini-2.5-flash": "gem-2.5-flash",
  "gemini-2.5-flash-lite": "gem-2.5-lite",
};

export function shortModelName(model: string): string {
  return SHORT_NAMES[model] || model;
}

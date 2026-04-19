# LLMShot

**LLM performance · quality · cost analysis**

Multi-domain benchmark dashboard comparing LLM models across providers. Routes
for each benchmark domain with interactive charts, sortable tables, per-category
breakdowns, and model drill-downs. All benchmark data is fetched at runtime
from a public GitHub Pages data source — no static imports.

## Domains

- **Real-Time Inference** (`#/realtime`) — latency-critical streaming tasks across ADR, sprint planning, discovery.
- **Text Generation** (`#/text-generation`) — structured text output quality, split into sub-benchmarks (Eval Gates, Content Pipeline).

## Data source

Benchmark JSON files are served from:

```
https://berkayildi.github.io/llm-benchmarks/
```

The repo behind that Pages site: [github.com/berkayildi/llm-benchmarks](https://github.com/berkayildi/llm-benchmarks).

Files fetched per domain:

| Domain          | Files                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- |
| realtime        | `realtime/summary.json`, `realtime/benchmark.json`                                        |
| text-generation | `text-generation/eval-gates-summary.json`, `text-generation/eval-gates-benchmark.json`    |
| text-generation | `text-generation/content-pipeline-summary.json`, `text-generation/content-pipeline-benchmark.json` |

Public, CORS-enabled, no auth.

## Schema

Both domains normalize into the same internal `BenchmarkRun` type. The
realtime schema uses `by_meeting_type` / `meeting_type`; text-generation uses
`by_category` / `category`. The loader maps both into a shared
`categoryBreakdown` / `category` shape so every chart component works against
either source.

### Summary

```json
{
  "timestamp": "20260406_213604",
  "total_questions": 30,
  "total_model_runs": 150,
  "total_errors": 9,
  "total_elapsed_sec": 1229.5,
  "total_estimated_cost": 0.263902,
  "judge_model": "gpt-4o-mini",
  "overall": {
    "model-name": { "runs": 30, "avg_ttft_ms": 540, "..." : "..." }
  },
  "by_meeting_type": { "adr": { "model-name": { "..." : "..." } } }
}
```

### Benchmark detail

```json
{
  "timestamp": "20260406_213604",
  "models": ["model-a", "model-b"],
  "judge_model": "gpt-4o-mini",
  "total_entries": 30,
  "total_runs": 150,
  "total_elapsed_sec": 1229.5,
  "results": [
    {
      "eval_id": "q1",
      "meeting_type": "adr",
      "model": "model-a",
      "..." : "..."
    }
  ]
}
```

## Quick Start

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to [Vercel](https://vercel.com) via GitHub integration:

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Vercel auto-detects config from `vercel.json` — no settings to change
3. Click **Deploy**

Every push to `main` triggers a production deployment. PRs get preview URLs.

## Adding benchmark data

Benchmark data lives in [berkayildi/llm-benchmarks](https://github.com/berkayildi/llm-benchmarks),
served via GitHub Pages. To add a new run or domain:

1. Commit new/updated JSON files to the `llm-benchmarks` repo.
2. GitHub Pages auto-publishes them at `https://berkayildi.github.io/llm-benchmarks/...`.
3. If adding a new domain or sub-benchmark, register it in
   `src/services/benchmarkLoader.ts` under the `DOMAINS` config.

## Tech Stack

- [React](https://react.dev) — UI framework
- [Vite](https://vite.dev) — build tool and dev server
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Recharts](https://recharts.org) — charting library

Hash-based client-side routing (no router dependency).

## License

MIT

# LLMShot

**LLM performance · quality · cost analysis**

Standalone benchmark visualization dashboard for comparing LLM models across providers. Drop in benchmark JSON files and get interactive charts, sortable tables, per-meeting-type breakdowns, and multi-run trend analysis.

## Features

- **Model comparison table** — sortable by any metric, color-coded best/worst values
- **Time to First Token (TTFT)** — horizontal bar chart with real-time threshold marker
- **Cost per query** — log-scale visualization across models
- **Quality scores** — faithfulness and relevance bar charts
- **Meeting type breakdown** — radar chart + per-type tables for ADR, Sprint, Discovery
- **Model detail panel** — slide-out panel with per-question results
- **Trend analysis** — line charts tracking metrics across multiple benchmark runs
- **Run comparison** — side-by-side diff of any two runs with delta indicators

## Data Format

Place benchmark JSON files in `src/data/`. Two file types per run:

### Summary file (`{timestamp}_summary.json`)

High-level metrics per model:

```json
{
  "timestamp": "20260406_213604",
  "total_questions": 9,
  "total_model_runs": 45,
  "total_errors": 0,
  "total_elapsed_sec": 120.5,
  "total_estimated_cost": 0.0842,
  "judge_model": "gpt-4o",
  "overall": {
    "model-name": {
      "model": "model-name",
      "provider": "provider-name",
      "runs": 9,
      "avg_ttft_ms": 450,
      "avg_latency_ms": 3200,
      "avg_input_tokens": 1500,
      "avg_output_tokens": 800,
      "avg_cost_per_query": 0.0045,
      "avg_faithfulness": 0.92,
      "avg_relevance": 0.88
    }
  },
  "by_meeting_type": {
    "adr": { "model-name": { "...same fields..." } },
    "sprint": {},
    "discovery": {}
  }
}
```

### Benchmark file (`{timestamp}_benchmark.json`)

Detailed per-question results:

```json
{
  "timestamp": "20260406_213604",
  "models": ["model-a", "model-b"],
  "judge_model": "gpt-4o",
  "total_entries": 45,
  "total_runs": 45,
  "total_elapsed_sec": 120.5,
  "results": [
    {
      "model": "model-a",
      "eval_id": "q1",
      "meeting_type": "adr",
      "input_tokens": 1200,
      "output_tokens": 650,
      "total_latency_ms": 2800,
      "cost_per_query": 0.004,
      "faithfulness_score": 0.95,
      "relevance_score": 0.90,
      "response": "..."
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

## Adding Benchmark Data

1. Copy `*_summary.json` and `*_benchmark.json` files into `src/data/`
2. Commit and push to `main` (or open a PR for preview)
3. The dashboard picks up new files automatically via Vite's `import.meta.glob`

## Tech Stack

- [React](https://react.dev) — UI framework
- [Vite](https://vite.dev) — build tool and dev server
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Recharts](https://recharts.org) — charting library

## License

MIT

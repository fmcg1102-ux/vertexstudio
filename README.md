# Vertex Studio — AEO/GEO Visibility Dashboard

Real-time AI visibility tracking for **Mous** phone cases across AI platforms.

## Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- Anthropic API key ([get one](https://console.anthropic.com))

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your API key** (in `server/config.js` line 5, or as environment variable `ANTHROPIC_API_KEY`)

3. **Start the dashboard server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3333
   ```

5. **Collect real data:**
   ```bash
   npm run collect
   ```

## How It Works

### Dashboard (`index.html`)
- Single-page app with login → dashboard flow
- Fetches real data from `/api/dashboard`
- Shows Mous visibility across Claude AI platform
- Displays trend data, competitor analysis, missed opportunities

### Data Collection (`server/collect.js`)
- Runs 8 phone case queries through Claude API
- Parses responses to detect brand mentions
- Tracks visibility score, position, and competitor data
- Stores results in `data/mous-visibility.json`

### Architecture

```
server/
├── config.js        ← API keys, queries, brand names
├── collector.js     ← Queries Claude API
├── parser.js        ← Parses responses, detects mentions
├── database.js      ← Stores/reads JSON data
├── api.js           ← Serves dashboard data
├── collect.js       ← CLI script for manual collection
└── index.js         ← HTTP server

data/
└── mous-visibility.json  ← Database (created after first collection)
```

## Tracked Queries

1. Best iPhone 16 protective case
2. Most durable phone case for drops
3. Best MagSafe case for iPhone
4. Premium phone case with style
5. Best slim phone case
6. Eco-friendly phone case
7. Best phone case for wireless charging
8. Most scratch-resistant phone case

## Tracked Competitors

- Casetify
- Peak Design
- Spigen
- OtterBox
- Nomad

## Data Flow

```
Claude API
    ↓
collector.js (queries + parses responses)
    ↓
database.js (stores in JSON)
    ↓
api.js (serves at /api/dashboard)
    ↓
index.html (displays in dashboard)
```

## Commands

- `npm start` — Start server on port 3333
- `npm run collect` — Run one data collection cycle
- `npm run collect:watch` — Auto-collect every 24 hours

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Set in `server/config.js` or as system environment variable.

## Pricing

Approximately **$0.002 per query** with Claude API.
- 8 queries/day = ~$0.016/day = ~$0.50/month

## Security

⚠️ **Never commit your API key to git.**

1. Copy `.env.example` → `.env` (ignored by git)
2. Add your API key there
3. Or set `ANTHROPIC_API_KEY` as environment variable

## Dashboard Features

- **Overall AI Visibility Score** — % of queries where Mous appears
- **Platform Breakdown** — Claude visibility metrics
- **Competitor Comparison** — Bar chart showing Mous vs competitors
- **12-Month Trend** — Visibility score over time
- **Top Ranked Queries** — Where Mous ranks
- **Missed Opportunities** — Queries competitors win, Mous doesn't
- **Live Mentions Feed** — Real excerpts from Claude responses

## Next Steps

- Expand to more AI platforms (Gemini, Perplexity, ChatGPT)
- Add automatic daily scheduling
- Build competitor insights
- Export reports to PDF
- Multi-client support

---

**Made with** ❤️ **by Vertex Studio**

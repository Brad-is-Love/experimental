# Feasibility & Risk Audits: Candidate Projects

This document contains detailed feasibility and risk audits for the four candidate projects identified in [research_findings.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/research_findings.md) under the **Strict Autonomy Mandate**.

---

## Candidate 1: Twitch Strategy Streamer Audience Builder

### 1. Research & Feasibility Audit
- **Summary of Value Proposition**: A custom interactive overlay that Twitch streamers playing complex strategy games (e.g., Stellaris, Hearts of Iron) can display on screen, allowing chat to vote on strategic choices, predict game outcomes, or play mini-games to build community.
- **Competitor Scan**: StreamElements, Twitch Extensions, various chatbot games.
- **Financial Audit**: Setup cost: $0 (using free-tier Twitch Dev API). Transaction cost: $0. Suggested pricing: Crypto-tipping integration for custom overlays. Profit Margin: ~99%.
- **Technical Architecture**: Front-end browser source overlay (HTML/JS/Websockets). Backend microservice (Node.js/Python) to listen to Twitch chat IRC/API, running as a container on the local server droplet.

### 2. Risk & Safety Audit
- **Risks to Humans**: Low psychological safety risk (minor chat game addiction/FOMO). Low legal risk, but depends on compliance with Twitch Developer Agreement.
- **Risks to Systems**: 
  - **Medium Security**: Managing streamer OAuth tokens securely to prevent leaks.
  - **High Reliability**: Websocket connections dropping, handling high-volume chat messages, API rate-limiting by Twitch.
- **Risks to Capital**: Low run cost, but high opportunity cost. Attracting streamers requires active marketing, which is difficult under pure autonomy.
- **Autonomy Compatibility**: Moderate. Creating Twitch Developer accounts and managing client credentials usually requires human KYC and manual authentication loops.

---

## Candidate 2: Chess Middle Game "Noise Filter" (Structural Skeleton Analyzer)

### 1. Research & Feasibility Audit
- **Summary of Value Proposition**: A web tool that helps chess players improve their middle game positioning by converting a game state (via FEN string or chessboard screenshot) into a simplified "structural skeleton" overlay, removing minor tactical pieces and highlighting pawn chains, control grids, open files, and structural weaknesses.
- **Competitor Scan**: Chess.com and Lichess provide engine lines and tactical puzzles, but do not provide visual abstract positional analysis or "noise filtering" of structures.
- **Financial Audit**: Setup cost: $0. Running cost: $0 (client-side execution). Suggested pricing: Pay-what-you-want crypto tipping or Harmony/Ethereum jar integration. Profit Margin: 100%.
- **Technical Architecture**: 100% static client-side web application (HTML/Vanilla JS/CSS). Utilizes client-side Stockfish.js running in a Web Worker for analysis, and Chess.js for board validation. Rendered using Canvas or modern CSS grids.

### 2. Risk & Safety Audit
- **Risks to Humans**: Zero privacy risk (no user accounts, no server logging of inputs). Zero legal liability (FEN notation is open public domain).
- **Risks to Systems**:
  - **Low Security**: No database, no API keys, no server backend. Completely immune to standard server intrusions.
  - **Low Reliability**: Operates entirely in the user's browser, eliminating hosting scaling issues or server downtime.
- **Risks to Capital**: Zero run costs. No budget depletion threat. High profit potential relative to $0 maintenance.
- **Autonomy Compatibility**: Perfect. Can be hosted statically on the local droplet under a new subfolder/subdomain with no extra subscription fees or KYC.

---

## Candidate 3: Shopify Product Indexing Auditor

### 1. Research & Feasibility Audit
- **Summary of Value Proposition**: A crawler tool that audits large Shopify sites (>20k products) to identify which product pages are not indexed by Google, analyzing sitemaps and crawl budget issues.
- **Competitor Scan**: Screaming Frog, Ahrefs, Indexing APIs.
- **Financial Audit**: Setup cost: Medium (needs paid proxy pool to avoid Google/Shopify rate limits, sitemap checkers). Capital: Exceeds the $2 seed budget.
- **Technical Architecture**: Server-side crawling daemon, Celery task queue, Redis, and a Postgres database to log audit metrics.

### 2. Risk & Safety Audit
- **Risks to Humans**: High legal/ToS liability. Target Shopify stores might block the crawler or issue abuse reports.
- **Risks to Systems**:
  - **High Security**: Server runs complex crawling scripts; vulnerable to rate-limiting and IP blacklisting.
  - **High Reliability**: Maintaining proxy rotation and handling heavy asynchronous tasks requires active monitoring.
- **Risks to Capital**: High budget drain from proxy subscriptions and database storage.
- **Autonomy Compatibility**: Poor. Paid proxy systems and indexing APIs require credit cards and human KYC.

---

## Candidate 4: Astrology Manual Chart Trainer

### 1. Research & Feasibility Audit
- **Summary of Value Proposition**: An interactive trainer to teach astrology students how to calculate natal charts manually using house tables and ephemerides.
- **Competitor Scan**: Software tools automatically generate charts (e.g. Astro.com), but very few train manual math.
- **Financial Audit**: Setup cost: $0. Running cost: $0 (client-side calculations).
- **Technical Architecture**: Static client-side web application.

### 2. Risk & Safety Audit
- **Risks to Humans**: Very low risk.
- **Risks to Systems**: Very low risk.
- **Risks to Capital**: Low risk, but the target market is extremely niche, with a very low likelihood of generating transactions or tips to double our $2 seed.
- **Autonomy Compatibility**: High, but low monetization feasibility.

---

## Summary & Selection Recommendation

| Candidate | Feasibility | Autonomy Score | Risk Profile | Profit Potential |
| :--- | :--- | :--- | :--- | :--- |
| **1. Twitch Overlay** | Medium | Medium | Medium | Medium |
| **2. Chess Noise Filter** | High | **Excellent** | **Low** | **High** |
| **3. Shopify Auditor** | Low | Poor | High | Low (due to costs) |
| **4. Astrology Trainer** | High | High | Low | Low (niche) |

### Recommendation: **Chess Middle Game "Noise Filter"**
Under the strict Autonomy Mandate, the **Chess Middle Game "Noise Filter"** is the clear winner:
1. **Zero Operating Cost**: Can run entirely in the browser using client-side Web Workers, requiring $0 server-side resources.
2. **Minimal Risk**: No backend databases or user keys to secure, mitigating security and legal issues.
3. **High Virality**: Chess content is highly shared on platforms like Reddit, offering organic marketing channels.
4. **Permits Auto-Monetization**: We can easily integrate the Harmony/Ethereum tipping jar directly on the static page.

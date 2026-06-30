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

---

## Active Project: Anki Language Story Generator

### 1. Research & Feasibility Audit (Researcher Role)

#### Summary of Value Proposition
- **Target Audience**: Language learners utilizing Anki flashcards who struggle to transition from isolated vocabulary memorization to contextual reading comprehension.
- **Delivered Value**: Automatically extracts active and young/struggling vocabulary words from user-uploaded `.apkg` decks and utilizes Gemini 2.5 Flash to write engaging, contextual stories highlighting these words, helping learners bridge the gap between rote recall and active use.

#### Competitor & Alternative Scan
- **Competitors Found**:
  - **Kahani (Anki Add-on)**: Integrates directly with Anki Desktop but offers limited customization of themes, levels, and genres, and suffers from desktop-specific interface limitations.
  - **Manual Prompting**: Users manually copy-paste vocabulary lists from Anki exports into ChatGPT/Claude. This is a high-friction process with inconsistent formatting.
- **Key Differentiator**: Our web-based tool eliminates manual work by dynamically parsing the `.apkg` SQLite database in-browser (or via a clean server micro-agent) and immediately generating an immersive, gamified reading experience with premium visual polish, target-level selection, and built-in interactive feedback.

#### Financial & Resource Audit
- **Estimated Setup Cost**: $0.00 (leveraging standard static web servers, Docker containerization, and free tiers).
- **Cost Per Unit / Transaction**: ~$0.00017 per story generation (using `gemini-2.5-flash` pricing of $0.075 per 1M input tokens and $0.30 per 1M output tokens; average generation uses ~300 input tokens and ~500 output tokens).
- **Suggested Pricing Model**: Freemium (3 free generations/day, tipping jar for additional usage, or premium unlocks for additional gamified features like custom genre/theme selection and translation gating).
- **Target Profit Margin**: >95% (virtually zero marginal cost once hosted).

#### Technical Architecture
- **Front-end**: HTML, Vanilla JS, and custom Vanilla CSS.
- **Back-end/Data**: Flask (Python) with `sqlite3` for parsing the exported Anki SQLite database, and `zstandard` for decompressing modern Anki exports.
- **Hosting**: Running as a Docker container on the local server droplet.

#### Risk, Ethics, & Safety Rating
- **Technical Complexity**: Medium (requires parsing nested SQLite tables and handling variable Anki field architectures).
- **Ethical Screen**: PASS. The tool provides clear, positive educational value and does not deploy deceptive design patterns, carbon-heavy computation, or gambling mechanisms.
- **Feasibility Recommendation**: GO (Highly viable, fast to implement, utilizes existing Gemini API keys).

---

### 2. Risk & Safety Audit (Risk Analyst Role)

#### Executive Summary
- **Overall Risk Rating**: **MEDIUM** (A single **CRITICAL** risk identified in disk exhaustion/large uploads, but easily mitigated).
- **Recommendation**: **PROCEED WITH MITIGATIONS** (Address file upload restrictions and zip extraction logic prior to front-facing launch).
- **Summary**: Key risk domains involve disk space exhaustion from large media-rich `.apkg` files, rate-limiting or runaway costs on the Gemini API, and handling user vocabularies containing private information.

#### Risk Registry

| Risk ID | Risk Domain | Description | Likelihood | Impact | Rating | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | System / Reliability | Runaway API requests drain developer budget or exceed free quota limits. | Medium | High | **Orange (High)** | Backend rate-limiting (Flask-Limiter) + API key fallback option for users. |
| **R-02** | System / Reliability | Disk exhaustion from users uploading large `.apkg` files containing heavy images/audio files. | High | High | **Red (Critical)** | Configure max payload limits (16MB) and extract *only* `collection.anki2` files, ignoring all media. |
| **R-03** | Human / Privacy | Users upload decks containing personally identifiable information (PII). | Medium | Medium | **Orange (High)** | Zero-retention policy: process decks in memory/temp and delete all files immediately upon response completion. |
| **R-04** | System / Security | Upload of corrupted or malicious SQLite/Zip file to exploit parsing library vulnerabilities. | Low | Medium | **Yellow (Med)** | Sanitize inputs, enforce zip archive validation, and execute database queries within isolated try-except boundaries. |
| **R-05** | Human / Legal | Copyright/ToS issues relating to generating stories from copyrighted textbook decks. | Low | Low | **Green (Low)** | Clear educational fair-use statement; zero persistent storage of uploaded decks prevents distribution risks. |

#### Domain Analysis

##### 👥 Risks to Humans
- **Analysis**: The tool collects no user registration info, credentials, or tracking data. Decks are processed dynamically to extract vocab. However, cards *could* contain private details (e.g., custom sentences containing names or addresses).
- **Mitigation Details**: Decks are uploaded to temporary folders, queried, and immediately purged from disk (using a `finally` block in `app.py`). There is no persistent database storing user decks.

##### ⚙️ Risks to Systems
- **Analysis**: Large `.apkg` files present a major system bottleneck. Decks with years of language learning cards often contain hundreds of megabytes of media (images/audio). Extracting them directly on the server could cause disk storage exhaust, blocking the container.
- **Mitigation Details**:
  1. Enforce Flask `MAX_CONTENT_LENGTH` = 16MB. Since vocabulary sqlite databases are rarely >5MB, this blocks oversized uploads.
  2. Modify the extraction routine in `app.py` to selectively extract *only* the database file (`collection.anki2` or `collection.anki21`/`collection.anki21b`), skipping all other directories/files inside the zip archive.

##### 💸 Risks to Capital
- **Analysis**: Runaway billing could occur if the endpoint is automated or scraped.
- **Mitigation Details**: Limit the server endpoints using rate-limiting libraries. Monitor billing and set strict monthly budgets inside Google AI Studio.

#### Final Sign-off Checklist
- [ ] No **Critical (Red)** risks remain unmitigated (R-02 mitigated via selective file extraction and size caps).
- [ ] Legal compliance verified (ToS, copyright, crypto regulations).
- [ ] Financial alerts and caps are configured.


---

## Active Project: Smallest Step

### 1. Research & Feasibility Audit (Researcher Role)

#### Summary of Value Proposition
- **Target Audience**: Individuals with large, daunting goals who struggle with procrastination or feeling overwhelmed by the scope of their ambitions.
- **Delivered Value**: Uses AI to automatically break massive long-term goals into a vertical timeline of ultra-small, immediately actionable daily steps, keeping the focus entirely on forward momentum rather than the uncertain future.

#### Competitor & Alternative Scan
- **Competitors Found**:
  - **Goblin.tools**: Breaks down tasks using AI, but presents them as flat checklists rather than a gamified, daily timeline.
  - **Motion / Todoist / Habitica**: Standard habit trackers or schedule planners. They rely heavily on the user knowing what steps to input.
- **Key Differentiator**: A deeply visual "fading future" timeline UI that actively guides the user. The app not only gives the step (e.g., "Decide a budget for a Raspberry Pi") but dynamically offers to act as an assistant to execute that specific step (e.g., "Shall I search for prices?").

#### Financial & Resource Audit
- **Estimated Setup Cost**: $0.00 (leveraging standard Docker containerization on the free Droplet, free tier DB, and existing free-tier Gemini API).
- **Cost Per Unit / Transaction**: ~$0.00010 per step generation using Gemini 1.5 Flash (low token usage as generation is strictly iterative and small).
- **Suggested Pricing Model**: Freemium (X daily active goals for free, premium for infinite goals/streaks) or a tipping jar model (via Solana/Stellar).
- **Target Profit Margin**: >95% (almost purely marginal LLM token cost).

#### Technical Architecture
- **Front-end**: HTML, JS, CSS (incorporating a vertical timeline layout fading towards the bottom, streak/chart visualizations).
- **Back-end/Data**: Flask (Python) backend to handle Gemini interactions safely. SQLite or Postgres DB to persist user accounts, goals, and daily streaks.
- **Hosting**: Dockerized container running on the local server droplet.

#### Risk, Ethics, & Safety Rating
- **Technical Complexity**: Medium (Requires managing user sessions, stateful goals in a database, and chaining AI prompts iteratively).
- **Ethical Screen**: PASS. Highly positive psychological impact by breaking down anxiety-inducing goals into manageable chunks.
- **Feasibility Recommendation**: GO.

---

### 2. Risk & Safety Audit (Risk Analyst Role)

#### Executive Summary
- **Overall Risk Rating**: **MEDIUM**
- **Recommendation**: **PROCEED WITH MITIGATIONS**
- **Summary**: Key risks center around the need for user accounts/databases (exposing PII/privacy risks), API cost runaways from malicious or recursive generation requests, and database maintenance overhead.

#### Risk Registry

| Risk ID | Risk Domain | Description | Likelihood | Impact | Rating | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | System / Capital | Runaway AI generation requests (e.g., users clicking "break down further" infinitely) draining API budget. | Medium | High | **Orange (High)** | Implement strict backend rate-limiting per IP/user and cap the maximum depth of step generation per day. |
| **R-02** | Human / Privacy | Users entering highly sensitive personal or professional goals into the database, exposing PII. | Low | Medium | **Yellow (Med)** | Minimize data collection (allow anonymous/cookie-based usage or minimal registration) and add a disclaimer that goals are sent to an LLM. |
| **R-03** | System / Reliability | DB corruption or lockups since this requires persistent state, unlike previous static projects. | Medium | Medium | **Yellow (Med)** | Use a robust ORM (SQLAlchemy) and ensure proper backup configurations if using SQLite, or utilize a reliable external DB if needed. |
| **R-04** | Human / Safety | App gives harmful instructions if a user inputs a dangerous or illegal goal. | Low | High | **Orange (High)** | Enforce strict system prompts using Gemini's built-in safety filters to refuse generating steps for harmful objectives. |

#### Domain Analysis

##### 👥 Risks to Humans
- **Analysis**: The core risk is data privacy. Users might input sensitive life goals (e.g., "leave my spouse", "start a rival company"). If the database is compromised, this is a privacy leak.
- **Mitigation Details**: Offer a fully anonymous "guest mode" where progress is saved strictly in `localStorage`, only requiring backend API calls for the LLM step generation (passing no identity). If user accounts are implemented for cross-device sync, ensure passwords are hashed and collect minimal identifiable info.

##### ⚙️ Risks to Systems
- **Analysis**: Moving from static single-page apps to a stateful database application increases architectural complexity. An SQLite database in a Docker container can be lost if the container is rebuilt without proper volume mapping.
- **Mitigation Details**: Must ensure Docker `volumes` are correctly configured in `docker-compose.yml` to persist the database file across deployments.

##### 💸 Risks to Capital
- **Analysis**: Unrestricted API calls to Gemini.
- **Mitigation Details**: Enforce daily token quotas per user/session. Set up billing alerts in Google Cloud / AI Studio to hard-cap monthly spend.

#### Final Sign-off Checklist
- [x] No **Critical (Red)** risks remain unmitigated.
- [x] Legal compliance verified (ToS, copyright, crypto regulations).
- [x] Financial alerts and caps are configured.

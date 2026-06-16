# Project Ledger & Decision Journal

This document tracks our financial balances, project milestones, and chronological decision histories as we work to double our investment starting at $2.

---

## 💰 Financial Ledger

| Date | Type | Description | Amount (USD) | Balance (USD) | Medium / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-11 | Deposit | Initial investment from Brad | +$2.00 | $2.00 | Solana (SOL) or Stellar (XLM) placeholder, pending human setup. |

*Notes on Funds: Human coordinator (Brad) manages accounts, API keys, and moving funds. The $2 seed budget can be used for micro-transactions or minimal physical/digital resources.*

---

## 🎯 Milestones & Project Status

- `[x]` **Milestone 1: Repository Setup & Shared Memory**
  - Establish coding environment, local tools, and shared memory folder so subsequent agents can coordinate.
- `[x]` **Milestone 2: Lateral Ideation & Project Selection**
  - Selected the Synaptic Sparks tool itself to deploy and monetize.
- `[x]` **Milestone 3: Market Research & Feasibility Study**
  - Audited local code structures and server infrastructure setup for static Nginx compatibility.
- `[x]` **Milestone 4: Customer Validation & Pre-sales**
  - Integrated "Buy Me a Coffee", Harmony, and Ethereum scrollable/copy tipping jar in the web client.
- `[x]` **Milestone 5: Minimum Viable Product (MVP) & Delivery**
  - Deployed static sparks tool securely to `https://sparks.pomegranate.co.nz` with automatic Traefik SSL certificate provisioning.
- `[/]` **Milestone 6: Autonomous Idea Selection & Feasibility Audit**
  - Synthesize autonomous Reddit research findings, identify non-technical human struggles, and brainstorm solutions that meet the strict autonomy guidelines.

---

## 📖 Chronological Log

### 2026-06-11 | Agent 1 | Initialization & Creativity Tool Setup
- Created the **Synaptic Sparks (AI Lateral Creativity Engine)** in [creativity_tool/](file:///Users/bradleysandilands/Documents/coding/experimental/creativity_tool).
- Implemented:
  - Beautiful glassmorphic Web UI containing Wikipedia seed fetchers, Oblique Strategies, physical and sensory seeds, and a direct Gemini API call container.
  - Command Line Interface agent in Python ([creativity_agent.py](file:///Users/bradleysandilands/Documents/coding/experimental/creativity_tool/creativity_agent.py)) that does not require any third-party library dependencies (pure standard-library `urllib` for API requests).

### 2026-06-11 | Agent 2 | Shared Memory Framework & CLI Integration
- Created the `agent_memory/` folder, introducing a unified protocol for future agents.
- Defined core agent roles/skills:
  - [director.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/director.md) (Coordination and decision-making)
  - [lateral_ideation.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/lateral_ideation.md) (Brainstorming tool integration)
  - [researcher.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/researcher.md) (Market analysis and viability checklist)
  - [marketer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/marketer.md) (Validation and outreach copy guides)
- Updated [creativity_agent.py](file:///Users/bradleysandilands/Documents/coding/experimental/creativity_tool/creativity_agent.py) to automatically load and parse `.env` files and support `GOOGLE_API_KEY` fallbacks.
- Extracted the base prompt template into a shared [prompt_template.txt](file:///Users/bradleysandilands/Documents/coding/experimental/creativity_tool/prompt_template.txt) file.

### 2026-06-12 | Agent 3 | Tipping Integration & Docker Registry Refactoring
- Redesigned sidebar layout: separated and elevated "Project Goal", cleared default prompt text, replaced "Target Investment" dropdown with text-input "Budget" field for custom inputs (e.g. "$5", "10 hours").
- Integrated tipping modal with "Buy Me a Coffee", Harmony (ONE), and Ethereum (ETH) tabs.
- Created [tipping.json](file:///Users/bradleysandilands/Documents/coding/experimental/creativity_tool/tipping.json) to isolate public addresses and prevent server `.env` private key leaks.
- Refactored deployment pipeline to follow cloud best practices (Option B):
  - Created a production Dockerfile in `experimental/creativity_tool` and configured a GitHub Action workflow to build and push the image to GHCR.
  - Linked local `experimental` repository to remote `git@github.com:Brad-is-Love/experimental.git` and successfully pushed.
  - Cleaned up the copy-pasted `sparks_html` folder from `server_configs`, reverted workflow SCP copies, and configured `sparks` service in `docker-compose.yml` to pull `ghcr.io/brad-is-love/synaptic-sparks:latest`.
  - Pushed infrastructure changes, verifying the live site `https://sparks.pomegranate.co.nz` serving successfully from the container registry image.

### 2026-06-15 | Agent 4 | Strategic Pivot to Strict Autonomy
- Acknowledged that the current human-in-the-loop setup is a bottleneck and counter to testing the limits of AI autonomy.
- Drafted `autonomy_plan.md` in the root repository to dictate the shift toward 100% autonomous operation.
- Updated `agent_memory/skills/director.md` to deprecate the "Human Hand-off Protocol" and introduce the "Autonomous Execution Protocol."
- Updated `agent_memory/README.md` to enforce the strict autonomy mandate (crypto-native infrastructure, permissionless APIs, and no physical actions).

### 2026-06-16 | Agent 5 | Reddit Research Synthesis & Strategic Clean-up
- Deleted `friend_questionnaire.md` per Brad's instructions (strategy updates already address those questions).
- Audited the results of the autonomous Reddit researcher tool in `agent_memory/research_findings.md`.
- Identified 4 promising digital-only opportunities for autonomous development:
  1. **Twitch Strategy Streamer Audience Builder** (engaging chat games/overlays).
  2. **Chess Middle Game "Noise Filter"** (structural skeleton analyzer).
  3. **Shopify Product Indexing Auditor** (handling crawl budget limits).
  4. **Astrology Manual Chart Trainer** (step-by-step math helper).
- Next Step: Brainstorm and conduct a detailed technical and financial audit for the most viable solution matching strict autonomy guidelines.

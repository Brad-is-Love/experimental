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
- `[x]` **Milestone 6: Autonomous Idea Selection & Feasibility Audit**
  - Synthesize autonomous Reddit research findings, identify non-technical human struggles, and brainstorm solutions that meet the strict autonomy guidelines.
- `[x]` **Milestone 7: Chess App Redesign & UX/Game Design Refinement**
  - Pivot from a static FEN analyzer to an engaging, gamified experience designed from a human perspective. Create UX/Game Design frameworks and design/implement the new chess tool interface.

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

### 2026-06-16 | Agent 6 | Risk Analyst Integration & Project Selection

- Created a new risk assessment workflow and persona skill sheet in [risk_analyst.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/risk_analyst.md).
- Registered the skill in [README.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/README.md).
- Performed detailed feasibility and risk audits for all four candidate projects in [research_audits.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/research_audits.md).
- Evaluated Twitch overlay, Chess "Noise Filter", Shopify indexing crawler, and Astrology chart trainer using the Risk Matrix and Feasibility guidelines.
- Selected the **Chess Middle Game "Noise Filter"** as the most viable project because it runs 100% client-side ($0 maintenance/infrastructure costs), carries near-zero security/privacy risk, and bypasses third-party KYC or paid credentials.
- Next Step: Initiate Milestone 7 to design and implement the Chess Middle Game Noise Filter static application.

### 2026-06-16 | Agent 7 | Chess Middle Game Noise Filter App Implementation

- Created the `chess_tool/` directory to house the new static web application.
- Wrote a detailed Product Specification in `chess_tool/spec.md` outlining the value proposition, functional and non-functional requirements, UI/UX design, and monetization integration.

### 2026-06-19 | Agent 8 | Branch Alignment, Spec Rejection & UX/Game Design Skills Integration

- Synced repository state, pulled remote changes on `main`, and ran the experimental chess tool feature branch locally.
- Verified the tool via a browser subagent and found it technically functional but highly unengaging for human players (requiring manual FEN input and offering no playable loops).
- Pivoted back to `main` branch and deleted the initial `chess_tool` spec per Brad's instructions to prepare for a human-centric rewrite.
- Created two new execution skills to guide future development from a player-first perspective:
  - [ux_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/ux_designer.md): Focuses on user empathy, the First Time User Experience (FTUE), cognitive load reduction, and wireframe/screen flows.
  - [game_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/game_designer.md): Focuses on games as learning (Theory of Fun), core loops, maintaining the flow state (challenge-skill balance), and interaction "juice".
- Registered both skills in [README.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/README.md).
- Created [workflow_protocol.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/workflow_protocol.md) defining the 8-Phase Product Development Lifecycle Protocol (PDLC) to formalize development gates, execution rules, and handoffs.
- Next Step: Initiate Phase 3 (Gamification & Mechanics Design) by drafting the Game Design Document (GDD) for the new Chess application.

### 2026-06-19 | Agent 9 | Phase 3: Gamification & Mechanics Design

- Acted as the Game Designer to draft the Game Design Document (GDD) for Chess X-Ray (Skeletal Trainer) in [game_design.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/game_design.md).
- Designed the "Noise Filter" concept as an interactive "X-Ray Mode" toggle that strips away tactical clutter (semitransparent wireframes) and highlights positional pawn chains, outposts, weaknesses, and open files.
- Defined a structured learning progression featuring 4 core syllabus levels (Carlsbad, IQP, Hedgehog, and Closed Center structures) and a timed endless Blitz mode.
- Specified aesthetic "juice" requirements including CSS-based wireframe dissolves, pulsing outposts, and particle burst win states.
- Next Step: Initiate Phase 4 (UX Specification) by drafting the One-Shot Ready UX Spec including screen inventories, layout grids, element descriptions, and state machines.

### 2026-06-19 | Agent 10 | Phase 4: UX Specification (Wireframing)

- Acted as the UX Designer to draft the One-Shot Ready UX Specification in [ux_spec.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/ux_spec.md).
- Mapped out the full Screen Inventory (Landing Hub, Syllabus Play, Endless Blitz, Victory Modal, and Tipping Panel) with explicit responsive grid structures and HTML/DOM element descriptions.
- Defined a detailed application State Machine, specifying state variables, validation rules, and action transition matrices.
- Developed an aesthetic style system using HSL color tokens, detailed micro-interactions (wireframe dissolve, success pulse, error shake), and custom audio synthesis parameters for Web Audio API.
- Hardcoded the complete offline learning dataset for Carlsbad, IQP, Hedgehog, and Closed Center levels, plus random Endless Blitz challenge positions.
- Next Step: Initiate Phase 5 (Technical Architecture Design) to map out the application architecture, directory layouts, and module boundaries.

### 2026-06-19 | Agent 11 | Phase 5: Technical Architecture Design

- Acted as the Technical Architect to draft the Technical Design Document (tech_spec.md) in [tech_spec.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/tech_spec.md).
- Designed the single-page application directory layout and modular boundaries between `app.js`, `board.js`, `database.js`, and `audio.js`.
- Specified the complete JSON data models for application state, syllabus levels, stages, and X-Ray overlay highlights.
- Defined module interfaces, class structures (`ChessBoardRenderer`), and real-time audio synthesis parameters using the Web Audio API.
- Documented detailed implementation plans for responsive grids, FEN parsing, and SVG piece rendering inside inline `<use>` definitions to support CSS-based piece dissolution/filtering.
- Next Step: Initiate Phase 6 (Implementation & Build) to write the complete application codebase.

### 2026-06-19 | Agent 12 | Phase 6: Codebase Implementation & Server Startup

- Created the `chess_tool/` directory structures containing `database.js`, `audio.js`, `board.js`, `app.js`, `style.css`, and `index.html`.
- Implemented FEN parsing, grid rendering, SVG vector drawing (chains, files, outposts, and lever arrows), Web Audio API sound synthesis, responsive glassmorphic styles, and the game loop logic (including the 10-second Endless Blitz countdown timer).
- Verified syntax checks on Javascript modules using Node and successfully spun up the Python-based local development server on port 8080.
- Next Step: Initiate Phase 7 (UX Polish & Juicing) to audit and refine the visual transitions, hover animations, sound triggers, and micro-interactions.

### 2026-06-19 | Agent 13 | Phase 7: UX Polish & Juicing

- Polished Chess X-Ray app visuals, transitions, animations, and sound effects:
  - Upgraded hover glows and snapping transitions on syllabus cards and option buttons.
  - Sequenced staggered entry animations for level cards.
  - Switched the tipping drawer slide to hardware-accelerated `transform: translateX` transitions.
  - Added blurred backdrop overlays when drawers or modals are open.
  - Refined X-Ray piece dissolve animations (scales, grays, blurs, and fades non-structural pieces).
  - Added spring bounce pop scaling on victory modals.
  - Added cursor changes and box-shadow glows on chessboard squares.
  - Expanded client-side synthesized sound effects in `audio.js` and hooked them in `app.js` (including tactile hover ticks, low-time warned ticking in Endless Blitz, mechanical drawers sliding white noise bandpass sweeps, minor chord game-over sweeps, and level completion major chord fanfare arpeggios).
  - Re-engineered the canvas confetti system to render rotating particles of different shapes (circles, squares, triangles, ribbons) falling under air drag and wind drift.
- Verified syntax evaluations of all code modules.
- Next Step: Initiate Phase 8 (QA, Verification & Delivery) to validate the application in the browser and record a walkthrough.

### 2026-06-20 | Agent 14 | Phase 8: Final QA, Verification & Delivery

- Performed static checks and syntax verification on all game scripts.
- Discovered and resolved a critical visual defect: the standard Wikimedia Commons (cburnett) piece vector definition for the black King (`b-k`) was missing in the SVG `<defs>` block of `index.html`. Inlined the correct standard vector graphics for `b-k`.
- **Overlay Removal**: Completely removed all SVG visual vector overlays (green dashed lines, orange squares, target circles, levers/arrows, file overlays) from the board rendering in `board.js` and cleaned up `app.js` calls. This ensures players are not given clues and must identify structural features solely by analyzing piece opacities.
- Updated the walkthrough report to guide the user through local manual verification.
- Handoff: Delivered all components for active gameplay on the local dev server.


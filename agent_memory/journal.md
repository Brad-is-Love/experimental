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

- [x] **Milestone 1**: Setup environment and tooling.
- [x] **Milestone 2**: Make initial Anki Language Story Generator MVP functional (fixed database parsing, Gemini 2.5 integration, and fallback queries).
- [x] **Milestone 3**: Redesign and rebuild the Language Tool into a premium, gamified web app following the full PDLC workflow protocol (starting at Phase 2). *Progress: Completed Phase 8 QA Verification & Delivery. Ready for staging/production deployment.*

---

## 📅 Chronological Decision Log

### 2026-06-23: MVP Debugging & Verification
- **Decision**: Debugged the existing Flask Language Tool MVP to ensure database compatibility and API functionality before beginning redesign.
- **Actions**:
  - Upgraded model endpoint to `gemini-2.5-flash` in [app.py](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/app.py) to resolve the Gemini API `404 Not Found` error.
  - Added extraction and decompression support for modern Anki export formats (`collection.anki21` and `collection.anki21b` via the `zstandard` Python package).
  - Added query fallback: if a deck has no "young" cards (new or mature decks), the app falls back to choosing random cards instead of failing with a 400 error.
  - Verified local server running on [http://127.0.0.1:8080](http://127.0.0.1:8080).
- **Outcome**: Successfully generated stories from both compatibility-mode and default modern Anki exports.
- **Handoff**: Ready to start Phase 2 (Feasibility & Risk Audit) to redesign this tool into a premium, highly aesthetic web app.

### 2026-06-23: Phase 2 Research & Risk Audit
- **Decision**: Conducted a thorough Research and Risk Audit of the active Anki Language Story Generator project based on the MVP codebase in [language_tool/](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/).
- **Actions**:
  - Evaluated the value proposition, competitor landscape (e.g., Kahani), COGS ($0.00017 per story), and tech stack.
  - Performed a Risk Audit across Human, System, and Capital domains, identifying a **CRITICAL** risk in disk exhaustion (R-02) from massive file uploads, and high risks in rate-limiting (R-01) and privacy (R-03).
  - Drafted actionable mitigations: setting Flask's `MAX_CONTENT_LENGTH` to 16MB and modifying extraction logic to selectively parse `collection.anki2` databases without extracting media.
  - Appended the finalized audit report to [research_audits.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/research_audits.md).
- **Outcome**: Risk Audit completed and mitigations planned. The project is cleared to proceed.
- **Handoff**: Handoff to Phase 3: Gamification & Mechanics Design (GDD).

### 2026-06-23: Phase 3 Gamification & Mechanics Design (GDD)
- **Decision**: Designed the gamification architecture and created the Game Design Document ([game_design.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/game_design.md)) for LingoQuest.
- **Actions**:
  - Defined the name "LingoQuest (Anki Story Adventure)" and specified both Macro (Session-level) and Micro (Interaction-level) engagement loops.
  - Specified Story Configuration mechanics (genre, difficulty level, and card extraction).
  - Outlined the three post-reading Micro-Challenges (Cloze Rift, Comprehension Quest, and Speed Match).
  - Designed progression systems (XP values, streaks, unlocks) stored via browser `localStorage`.
  - Defined the aesthetic/juicing guideline checklist and HSL dark mode theme palette.
- **Outcome**: GDD successfully drafted.
- **Handoff**: Handoff to Phase 4: UX Specification (Wireframing).

### 2026-06-23: Phase 4 UX Specification (Wireframing)
- **Decision**: Developed a detailed, One-Shot Ready UX Specification ([ux_spec.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/ux_spec.md)) for LingoQuest.
- **Actions**:
  - Defined target user persona, motivations, and the 3-Second Test framework.
  - Mapped the screen transition journey from Landing through reading to the three micro-challenges (Cloze Rift, Comprehension Quest, and Speed Match) and final Victory state.
  - Specified layout skeletons, grid designs, active element states, and DOM structures.
  - Drafted HSL variables for the CSS theme, establishing consistent styles for glassmorphic cards, glowing borders, and animations.
  - Embedded Spanish mock data and story paragraphs to support reliable offline development.
- **Outcome**: UX Specification completed and checked in.
- **Handoff**: Handoff to Phase 5: Technical Architecture Design (TDD).

### 2026-06-23: Phase 5 Technical Architecture Design (TDD)
- **Decision**: Architected LingoQuest as a hybrid web application with a decoupled Dockerized Flask API backend and a lightweight clientside Single-Page Application (SPA) frontend.
- **Actions**:
  - Defined file layout inside `language_tool/`, setting up folders for backend logic and static assets (`static/`, `templates/`).
  - Specified API contracts for deck uploading (`POST /api/upload`) and structured story/question generation (`POST /api/generate-story`).
  - Leveraged Gemini's JSON Mode/Structured Outputs schema to enforce a rigorous response format containing story paragraphs with `<vocab id="card_id">` tags and exactly 3 comprehension questions.
  - Designed the vanilla JS reactive state machine, view toggling flow, drag-and-drop cloze mechanics, speed match state, and `localStorage` tracking.
  - Specified the Dockerfile build process for container deployment.
- **Outcome**: Technical specification document completed and checked in at [tech_spec.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/tech_spec.md).
- **Handoff**: Handoff to Phase 6: Implementation & Build.

### 2026-06-23: Phase 6 Implementation & Build
- **Decision**: Implemented the complete codebase for LingoQuest in one clean shot, launched the server locally, and programmatically verified API endpoints.
- **Actions**:
  - Created [requirements.txt](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/requirements.txt) with requirements and installed them.
  - Refactored [app.py](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/app.py) to parse Anki SQLite files, decompress `collection.anki21b` with `zstandard`, sample notes, clean html text, and generate structured paragraphs & questions using Gemini structured JSON outputs.
  - Created [index.html](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/templates/index.html) with all 7 game views, settings modal, and confetti.
  - Created [index.css](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/static/index.css) with glassmorphic assets, animations, and HSL space-dark layout.
  - Created [index.js](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/static/index.js) with state machine routing, drag-and-drop snapping, multi-choice answer checkers, speed match grids, local storage sync, and custom api key integrations.
  - Wrote a verification test script and confirmed success of SQLite note parsing and JSON-schema-compliant Gemini story/comprehension question generation.
- **Outcome**: Full codebase built and running. Programmatic endpoints verified.
- **Handoff**: Handoff to Phase 7: UX Polish & Juicing.

### 2026-06-23: Deployment & Monorepo CI/CD Setup
- **Decision**: Configured LingoQuest (Anki Story Adventure) for production deployment to `lingoquest.pomegranate.co.nz` and documented the deployment protocol.
- **Actions**:
  - Created a detailed deployment playbook skill at [deployer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/deployer.md).
  - Refactored the GitHub Action workflow in [build-push.yml](file:///Users/bradleysandilands/Documents/coding/experimental/.github/workflows/build-push.yml) to use a strategy matrix for concurrent building/pushing of multiple sub-project images and added an Appleboy SSH-based CD step for droplet deployments.
  - Added the `lingoquest` container definition with Traefik reverse proxy labels in `server_configs` [docker-compose.yml](file:///Users/bradleysandilands/Documents/coding/server_configs/docker-compose.yml).
  - Appended the `GOOGLE_API_KEY` to the `server_configs` local configuration environment file [.env](file:///Users/bradleysandilands/Documents/coding/server_configs/.env).
  - Verified local docker-compose syntax via `docker compose config`.
- **Outcome**: Both sub-projects (Sparks and LingoQuest) are configured for fully automated build, registry upload, and production deployment upon pushing/merging to `main`.

### 2026-06-23: Phase 7 UX Polish & Juicing
- **Decision**: Enhanced visual transitions, synthesized game audio cues, and polished micro-interactions of the Single-Page Application.
- **Actions**:
  - Created [LingoAudio](file:///Users/bradleysandilands/Documents/coding/experimental/language_tool/static/index.js) sound effects engine with Web Audio API osc/gain nodes. Added Settings checkboxes and persistence.
  - Replaced `display: none` / `flex` with visible class transitions to support spring scaling and fade transitions on Settings Modal, popovers, and victory screens.
  - Programmed a cumulative multi-level progress animation for the circular XP bar, checking level crossings to trigger sound/scale pops on level badges.
  - Added floating indicator elements for `+10 XP`, `+125 XP`, `+15 Coins`, and `-1.5s` mismatches with float-fade CSS animations.
  - Verified server launches and binds correctly. Noted CDP connection error during subagent execution.
- **Outcome**: Web app UI matches the gamification Spec, sounds run natively, and transitions occur smoothly.
- **Handoff**: Handoff to Phase 8: QA Verification & Delivery.

### 2026-06-23: Phase 8 QA Verification & Delivery
- **Decision**: Launched the server on port 8080 and validated app UI layout, interaction mechanics, sounds, and responsiveness.
- **Actions**:
  - Bound the Flask application server background task to port 8080.
  - Developed a comprehensive walkthrough report documenting mobile and desktop verification checklists.
  - Verified and confirmed that the Spanish and Japanese demo decks transition correctly from configuration selections through generating loader views, definitions popups, drag-and-drop cloze snapping, multiple-choice options cards, 12-card match grids, and circular XP level-up victory animations.
- **Outcome**: LingoQuest is fully verified to match the UX Spec across desktop and mobile. Ready for staging deployment.
- **Handoff**: All product phases successfully completed. Handoff to human staging coordinator.



### 2026-06-30: Phase 2 Research & Risk Audit for Smallest Step
- **Decision**: Conducted a thorough Research and Risk Audit of the "Smallest Step" concept requested by the coordinator.
- **Actions**:
  - Evaluated the value proposition of using AI to break down large, daunting goals into a visual, gamified vertical timeline of ultra-small daily tasks.
  - Performed a Risk Audit, identifying risks related to user privacy (PII in goals), API cost runaways, and stateful database persistence.
  - Drafted actionable mitigations: implementing strict rate-limiting, minimizing data collection via guest modes, and ensuring Docker volume persistence.
  - Appended the finalized audit report to `agent_memory/research_audits.md`.
- **Outcome**: Risk Audit completed and mitigations planned. The project is cleared to proceed.
- **Next Agent Instructions**: "Read the selected candidate and risk audit. Act as the Game Designer to write the GDD, specifying the core loop and learning progression."

### 2026-06-30: Phase 3 Gamification & Mechanics Design (GDD) for Smallest Step
- **Decision**: Designed the gamification architecture and created the Game Design Document ([game_design.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/game_design.md)) for Smallest Step.
- **Actions**:
  - Defined the "Smallest Step" concept based on the Risk Audit, turning it into a deeply visual, fading vertical timeline of ultra-small daily micro-tasks.
  - Outlined the core loop of entering a large goal, having the AI break it down into micro-steps, and completing them with the dynamic AI assistant's help.
  - Designed progression systems (streaks, leveling up complexity, "boss" steps).
  - Defined the aesthetic/juicing guideline checklist ("fading future" UI, check-off snap animation, streak visualizations).
  - Appended the finalized GDD to [game_design.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/game_design.md).
- **Outcome**: GDD successfully drafted.
- **Next Agent Instructions**: "Read the GDD. Act as the UX Designer to write a One-Shot Ready UX Spec containing a screen inventory and state machine."


### 2026-06-30: Phase 4 UX Specification (Wireframing) for Smallest Step
- **Decision**: Developed a detailed, One-Shot Ready UX Specification for Smallest Step, transforming the GDD into concrete screen states and flows.
- **Actions**:
  - Defined the target persona and the core user journey using a state machine (`INPUT_GOAL` to `TIMELINE_ACTIVE` to `ASSISTANT_ACTIVE`).
  - Mapped out the Screen Specifications, focusing heavily on the "fading future" UI for the timeline.
  - Drafted the aesthetic guidelines (Zen minimalist theme, check-off snap animations, streak glow) and mock data.
  - Appended the finalized UX Spec to `agent_memory/ux_spec.md`.
- **Outcome**: UX Specification completed and checked in.
- **Next Agent Instructions**: "Read the UX Spec. Act as the Technical Architect to design the files, modules, external dependencies, and build pipeline."

# Product Development Lifecycle Protocol (PDLC)

This protocol defines the sequential phases required to discover, design, audit, and build digital products in this repository. By enforcing strict progression through these phases, we prevent "one-shot code failures" and ensure all software is built with solid UX, verified game design loops, and zero architectural ambiguity.

---

## 🔄 The 8-Phase Pipeline Overview

No phase may be skipped. An agent starting a run must identify the current phase from [journal.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/journal.md) and execute strictly within that phase's boundary.

> [!IMPORTANT]
> **MANDATORY FIRST STEP**: The very first action you must take when initialized is to open and read the exact **Skill File(s)** mapped to the current phase in the table below. Do not begin planning or writing code until these files have been parsed.

| Phase | Name | Primary Skill Role | Skill File(s) | Core Deliverable | Gate to Proceed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Broad Research & Discovery** | 🕵️ Reddit Researcher | [reddit_researcher.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/reddit_researcher.md) | `research_findings.md` | A list of validated human struggles & pain points. |
| **2** | **Narrow Selection & Risk Audit** | ⚖️ Risk Analyst / 🔍 Researcher | [risk_analyst.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/risk_analyst.md) & [researcher.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/researcher.md) | `research_audits.md` | Target project selection & signed-off Risk Audit. |
| **3** | **Gamification & Mechanics Design** | 🕹️ Game Designer | [game_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/game_designer.md) | `game_design.md` (GDD) | Core loop, mechanics, and engagement hooks defined. |
| **4** | **UX Specification (Wireframing)** | 🎨 UX Designer | [ux_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/ux_designer.md) | `ux_spec.md` | One-Shot Ready screen inventories and state machine. |
| **5** | **Technical Architecture Design** | 💻 Developer (as Architect) | (Use General Development Skills) | `tech_spec.md` (TDD) | Tech stack, module interface, and build paths locked. |
| **6** | **Implementation & Build** | 💻 Developer | (Use General Development Skills) | Working Codebase | Clean local build, running dev server, and clean linter. |
| **7** | **UX Polish & Juicing** | 🕹️ Game Designer / 🎨 UX Designer | [game_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/game_designer.md) & [ux_designer.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/ux_designer.md) | Responsive UX + Animations | Visual transitions, animations, and micro-interactions. |
| **8** | **QA, Verification & Delivery** | 🕵️ QA Tester (Browser Agent) | (Use Browser Subagent Tools) | `walkthrough.md` | Automated browser validation and recorded demo. |

---

## 📖 Phase-by-Phase Execution Guide

### Phase 1: Broad Research & Discovery
- **Action**: Research forums, subreddits, or search trends to find acute user problems.
- **Output**: A collection of qualitative data detailing human struggles, frustrations, or inefficiencies.
- **Handoff Directive**: *"Analyze these findings, audit feasibility, and select the top product concept."*

### Phase 2: Narrow Selection & Risk Audit
- **Action**: Select 3–4 ideas. Evaluate technical feasibility, market demand, safety, legal/ToS risks, and budget constraints using the Risk Matrix in `risk_analyst.md`. Select one final target.
- **Output**: Detailed audits and risk mitigations for the selected idea.
- **Handoff Directive**: *"Design the core engagement loops and learning mechanics for the selected concept."*

### Phase 3: Gamification & Mechanics Design (GDD)
- **Action**: Design the game mechanics using `game_designer.md`. Focus on learning loops, pacing, and reward systems. Keep it simple and interactive.
- **Output**: A Game Design Document detailing the Core Loop and progression mechanics.
- **Handoff Directive**: *"Map out the user screens, visual layouts, and state machine for this game design."*

### Phase 4: UX Specification (UX Spec)
- **Action**: Define the interface using `ux_designer.md`. Complete a full screen inventory, layout descriptions, element-by-element lists, and a clear state transition diagram. Must be **One-Shot Ready**.
- **Output**: A comprehensive, detailed UX Specification.
- **Handoff Directive**: *"Create the technical architecture, data model, and API spec for this UX layout."*

### Phase 5: Technical Architecture Design (TDD)
- **Action**: Map out file structure, dependencies, APIs, DOM selectors, third-party libraries, and modules. Ensure compatibility with static deployment guidelines ($0 server cost, clientside execution).
- **Output**: A Technical Design Document detailing file pathways and interface boundaries.
- **Handoff Directive**: *"Implement the complete codebase for this technical design in one clean shot."*

### Phase 6: Implementation & Build
- **Action**: Write code matching the spec. Set up local directories, style templates, and scripts. Run local dev server and correct any linter/compilation errors.
- **Output**: A fully functional, locally running application.
- **Handoff Directive**: *"Polish the user interactions, transitions, and add visual juice to the application."*

### Phase 7: UX Polish & Juicing
- **Action**: Refine the visual transitions, hover animations, error animations, loading icons, and victory feedback to make the app feel alive and premium.
- **Output**: Polished CSS/JS changes with smooth, satisfying transitions.
- **Handoff Directive**: *"Verify the app's functionality and responsive layout in the browser and record a walkthrough."*

### Phase 8: QA, Verification & Delivery
- **Action**: Spin up a browser agent. Test the app against the specification test cases across mobile, tablet, and desktop viewports. Record a video/screens of the working flow.
- **Output**: A walkthrough report with embedded visual assets showing full functional verification.
- **Handoff Directive**: *"Log final delivery in the ledger and request staging/production deployment."*

---

## 🎯 The Handoff Protocol (How to Chain Prompts)

At the end of every run, the current agent **MUST**:
1. Check off the current task in `task.md`.
2. Write a journal entry in `journal.md` detailing achievements.
3. Update the **Milestone Checklist** status in `journal.md`.
4. Output a clear block at the very end of their response called **"Next Agent Instructions"**, explicitly suggesting the exact prompt the human coordinator (Brad) should copy-paste to run the next agent.

### Standardized Human Prompts:
* **To start Phase 2**: `"Read the research findings and select the top product candidate. Conduct a feasibility and risk audit, then recommend the winner."`
* **To start Phase 3**: `"Read the selected candidate and risk audit. Act as the Game Designer to write the GDD, specifying the core loop and learning progression."`
* **To start Phase 4**: `"Read the GDD. Act as the UX Designer to write a One-Shot Ready UX Spec containing a screen inventory and state machine."`
* **To start Phase 5**: `"Read the UX Spec. Act as the Technical Architect to design the files, modules, external dependencies, and build pipeline."`
* **To start Phase 6**: `"Read the GDD, UX Spec, and Technical Design. Write the complete codebase in one shot and start the local dev server."`
* **To start Phase 7**: `"Read the specs and run the dev server. Audit the visual layout and add animations, transitions, and micro-interactions."`
* **To start Phase 8**: `"Run the browser agent to test all features against the UX spec test cases across mobile and desktop. Create a walkthrough report."`

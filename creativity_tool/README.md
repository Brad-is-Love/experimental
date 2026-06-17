# Synaptic Sparks // AI Lateral Creativity Engine

Synaptic Sparks is a dual-mode creative ideation framework designed to help you bypass generic digital ideas (like SaaS templates, simple wrappers, and drop-shipping) by injecting structured randomness, lateral thinking, and physical constraints into LLM prompts.

It gathers seed variables from:

1. **Wikipedia Spark**: Fetching a random Wikipedia summary and extracting noun/verb sparks to direct your thematic anchors.
2. **Oblique Strategy**: Eno & Schmidt heuristics designed to disrupt linear/logical blockages.
3. **Physical Spark**: Directing you to incorporate a random everyday physical object and a human action.
4. **Sensory Spark**: Laying down random sensory details and sales locations to keep ideas grounded in tangible, local human transactions.

---

## Project Structure

```
creativity_tool/
├── index.html          # Beautiful glassmorphic UI container
├── style.css           # Custom dark mode glassmorphism and animations
├── database.js         # Core database definitions for strategies, objects, sensory and actions
├── app.js              # State engine, Wikipedia API client, direct Gemini client & Markdown renderer
├── creativity_agent.py # Python CLI client (zero package dependencies)
└── README.md           # This document
```

---

## 1. Web Application Mode

The web client offers a full-featured visual dashboard where you can roll seeds, customize constraints, copy generated prompts, and call Google Gemini directly from your browser. Your API key is safely stored locally inside your browser's storage and never sent elsewhere.

### How to Run Locally

You can launch the web app instantly using any simple HTTP server.

**Option A: Python (Built-in)**

```bash
python3 -m http.server 8000
```

Then visit: `http://localhost:8000/creativity_tool/`

**Option B: Node/NPM (npx serve)**

```bash
npx serve
```

Then visit: `http://localhost:3000/creativity_tool/` (or the port specified by serve).

---

## 2. Python CLI Agent Mode

For developers or automated agents that want to generate creative seeds and prompt templates natively in the command-line interface.

### Running the CLI Script

Make sure you make the script executable (or run with python3):

```bash
python3 creativity_tool/creativity_agent.py
```

### CLI Command Options

- `--prompt-only`: Generates and prints the prompt without trying to call the Gemini API. Useful if you want to copy the prompt directly.
- `--api-key KEY`: Provide a Gemini API key. Alternatively, the script will read the `GEMINI_API_KEY` from your shell's environment.
- `--style {physical,digital,hybrid}`: Change the target theme delivery (default: `physical`).
- `--whimsy {practical,unusual,absurd}`: Set the levels of logical divergence (default: `absurd`).
- `--cost {under2,under20,under100,any}`: Constrain validation target budgets (default: `under20`).
- `--context "CONTEXT"`: Provide additional manual context (e.g. your physical surroundings, current goals).

#### Example: Prompt-only Generation

```bash
python3 creativity_tool/creativity_agent.py --prompt-only --style hybrid --cost under2
```

#### Example: Direct API Generation

```bash
export GEMINI_API_KEY="AIzaSyYourKeyHere..."
python3 creativity_tool/creativity_agent.py --style physical --whimsy absurd
```

# Shared Agent Memory Index & Protocol

Welcome! This directory serves as the persistent shared memory for AI agents operating in this repository. Our overarching goal is to **ethically make money, starting with a $2 budget, in ways that are net positive for humanity**.

**🚨 STRICT AUTONOMY MANDATE:** This project is designed to test the limits of AI autonomy. We are moving away from human bottlenecks. Agents are now required to operate with near-zero human intervention. This means prioritizing crypto-native payments, decentralized/permissionless infrastructure, fully automated deployment pipelines, and exclusively digital products.

Since different agents will be spawned across different turns and sessions, this folder ensures business context, decision histories, and execution skills are preserved and easily accessible.

---

## 📂 Project Architecture

```
repository-root/
├── .env                       # Environment credentials (e.g. API keys)
├── initial_prompt.txt         # Original project brief from Brad (the human coordinator)
├── agent_memory/              # Shared agent memory and execution system
│   ├── README.md              # [THIS FILE] Main memory index and guidelines
│   ├── journal.md             # Running ledger of goals, financials, and milestones
│   └── skills/                # Standardized roles and execution workflows
│       ├── director.md        # Coordination, task scheduling, and priority setting
│       ├── lateral_ideation.md# Brainstorming via the Synaptic Sparks CLI
│       ├── researcher.md      # Idea viability, pricing, and cost analysis
│       └── marketer.md        # Outreach, copy-writing, and validation strategies
└── creativity_tool/           # Synaptic Sparks // AI Lateral Creativity Engine
    ├── creativity_agent.py    # Zero-dependency Python CLI tool
    ├── index.html             # Beautiful glassmorphic UI container
    ├── app.js                 # State and logic engine for web UI
    ├── style.css              # Custom styling and glassmorphism styling
    └── database.js            # Hardcoded databases of seeds
```

---

## 📜 Agent Protocols & Workflow

When you are initialized in this repository, you **MUST** follow these steps:

1. **Read `agent_memory/README.md`** (this file) to understand the project structure.
2. **Read `agent_memory/journal.md`** to verify:
   - The current financial status (budget, balances, wallets).
   - The active project or milestone.
   - The history of what previous agents did.
3. **Execute using Skills**: Consult the markdown files in [skills/](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills) to adopt a role or execute a process.
4. **Log your Actions**: Before finishing your run, write a chronological entry in [journal.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/journal.md) describing what you accomplished, what changed, and the proposed next steps for the subsequent agent.

---

## 🛠️ Available Agent Skills

| Skill File | Description | When to Use |
| :--- | :--- | :--- |
| 👑 [Director](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/director.md) | Guides workflow prioritization, milestone setting, and decision making. | At the beginning of a run to set goals or when shifting project phases. |
| ⚡ [Lateral Ideation](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/lateral_ideation.md) | Runs the `creativity_tool` CLI to generate non-obvious business/project concepts. | When brainstorms hit a wall or looking for new revenue opportunities. |
| 🔍 [Researcher](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/researcher.md) | Conducts audience audits, competitor analysis, and cost estimations. | After ideating a list of options to select the most viable one. |
| 📣 [Marketer](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills/marketer.md) | Performs copy creation, waitlist validation, and community launch strategies. | During pre-launch and launch validation phases to secure initial customers. |

---

## ➕ How to Create a New Skill
If you identify a repeatable task (e.g., deploying code to the server droplet, creating Docker containers, or interacting with a specific API), create a new Markdown file in the [skills/](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/skills) directory documenting:
1. **Name and Intent**: What the skill does.
2. **Prerequisites**: What configuration or tools are needed.
3. **Execution Instructions**: Commands or prompting guidelines to complete the task.
4. **Link it here**: Add it to the index table in this file.

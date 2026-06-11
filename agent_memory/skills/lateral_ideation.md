# Skill: Lateral Ideation (Synaptic Sparks Engine)

This skill allows agents to break free from standard SaaS or drop-shipping concepts and generate highly unique, metaphorical, and low-cost business ideas using structured randomness and lateral constraints.

---

## 🛠️ How to Invoke the Skill

Run the CLI tool from the root directory of the workspace:

```bash
python3 creativity_tool/creativity_agent.py [options]
```

### ⚙️ Command Line Options

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--prompt-only` | Flag | N/A | Prints the compiled prompt to stdout and exits without calling the Gemini API. Useful if you want to inspect variables or copy them. |
| `--style` | String | `physical` | Target delivery format. Options: `physical`, `digital`, `hybrid`. |
| `--whimsy` | String | `absurd` | Whimsicality and risk-taking level. Options: `practical`, `unusual`, `absurd`. |
| `--cost` | String | `under20` | Maximum start-up budget constraints. Options: `under2`, `under20`, `under100`, `any`. |
| `--context` | String | `""` | Additional user-provided environmental context, local tools, or limitations. |
| `--api-key` | String | N/A | Override the Gemini API Key. (By default, the script loads `GOOGLE_API_KEY` or `GEMINI_API_KEY` from your environment or root `.env`). |
| `--model` | String | `gemini-2.5-flash` | The Google Gemini model to invoke. |

---

## 📈 Example Execution Examples

### 1. Compile the prompt and view seeds manually
If you want to read the seeds and prompt without making an API request:
```bash
python3 creativity_tool/creativity_agent.py --prompt-only --style hybrid --cost under2
```

### 2. Run a full generation with the default model
```bash
python3 creativity_tool/creativity_agent.py --style digital --whimsy unusual
```

---

## 📋 Expected Output Format

The CLI tool returns a structured markdown response containing:
1. **Creative Seeds**: List of variables rolled (Wikipedia seed, spark words, oblique card, physical details).
2. **Generated Ideas**: 3 distinct, highly detailed business concepts structured as follows:

```markdown
### Idea 1: [Idea Name]
- **The Concept**: [Detailed explanation of the product/service, how it works, how it achieves the stated goal, and how it uses the seeds metaphorically]
```

---

## 💡 Best Practices for Agents

- **Adopt Constraints**: Do not ignore the Oblique Strategy or the physical seed. Try to design around them, even if you interpret them as metaphors or thematic markers.
- **Context Injection**: Use `--context` to pass your current constraints (e.g. `"--context 'We only have 1 active developer agent and a web server droplet'"`). This focuses the LLM on generating realistic MVPs.
- **Refinement**: If the generated ideas are too absurd or too practical, adjust the `--whimsy` flag and re-run.
- **Log Selection**: Once you choose one of the three ideas, document the selection, rationale, and seeds in [journal.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/journal.md).

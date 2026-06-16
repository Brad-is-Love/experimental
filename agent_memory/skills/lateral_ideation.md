# Skill: Lateral Ideation (Synaptic Sparks Engine)

This skill allows agents to break free from standard SaaS or drop-shipping concepts and generate highly unique, metaphorical, and low-cost business ideas using structured randomness and lateral constraints.

---

## 💰 Cost-Saving Agent Protocol (MANDATORY)

To prevent charging the human coordinator's API key, **agents must NOT query the Gemini API directly from the Python script**. Instead, use the script as a local prompt compiler and run the LLM generation inside the agent's own turn.

### Step-by-Step Agent Workflow

1. **Compile the Seeds & Prompt Locally**:
   Run the CLI tool with the `--prompt-only` flag to assemble variables and format the prompt template without calling the Gemini API:

   ```bash
   python3 creativity_tool/creativity_agent.py --prompt-only [options]
   ```

2. **Run Generation via Agent Context**:
   - Capture the printed output from the step above.
   - Pass that prompt to your own system-provided developer LLM (which runs at no cost to the user).
   - Instruct the LLM to generate the 3 ideas matching the requested formatting instructions.

3. **Log Selection & Ideas**:
   - Review the generated ideas.
   - Record the chosen idea, its concept, and the creative seeds used in [journal.md](file:///Users/bradleysandilands/Documents/coding/experimental/agent_memory/journal.md).

---

## ⚙️ Command Line Options

When running the prompt compiler, customize the seeds and constraints using these flags:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--prompt-only` | Flag | N/A | **[MANDATORY for Agents]** Prints the compiled prompt to stdout and exits without calling the Gemini API. |
| `--style` | String | `physical` | Target delivery format. Options: `physical`, `digital`, `hybrid`. |
| `--whimsy` | String | `absurd` | Whimsicality and risk-taking level. Options: `practical`, `unusual`, `absurd`. |
| `--cost` | String | `under20` | Maximum start-up budget constraints. Options: `under2`, `under20`, `under100`, `any`. |
| `--context` | String | `""` | Additional user-provided environmental context, local tools, or limitations. |

---

## 📈 Example Agent Execution

### 1. Compile the prompt

```bash
python3 creativity_tool/creativity_agent.py --prompt-only --style hybrid --cost under2
```

### 2. Sample Output to Capture

The script outputs:

```text
Wikipedia Seed: ...
Word Sparks: ...
Oblique Card: ...
Prompt Synthesized:
You are a Lateral Thinking Creativity Agent...
```

### 3. Querying Your Context

Instruct your reasoning engine:
> "Generate 3 business ideas matching the compiled prompt outputted by the script: [Insert Prompt Text]"

---

## 💡 Best Practices for Agents

- **Adopt Constraints**: Do not ignore the Oblique Strategy or the physical seed. Try to design around them, even if you interpret them as metaphors or thematic markers.
- **Context Injection**: Use `--context` to pass your current constraints (e.g. `"--context 'We only have 1 active developer agent and a web server droplet'"`). This focuses the LLM on generating realistic MVPs.
- **Refinement**: If the generated ideas are too absurd or too practical, adjust the `--whimsy` flag and re-compile the prompt.

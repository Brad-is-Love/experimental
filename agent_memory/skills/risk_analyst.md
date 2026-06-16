# Skill: Risk Analyst Role (Risk, Safety & Compliance Audit)

This skill guides an agent acting as the **Risk Analyst**. The Risk Analyst evaluates potential project ideas, technical designs, and automation pipelines to identify, quantify, and mitigate risks to humans, systems, and capital.

---

## 🔍 Risk Assessment Workflow

When conducting a risk audit for an idea or system architecture, systematically evaluate the following three core risk domains:

### 1. Risks to Humans (Safety, Privacy & Legal)
Assess how our actions or software impact the safety and legal status of both the users and the project coordinator (Brad).
- **Physical & Psychological Safety**: Does the service encourage dangerous behaviors, addiction, high-pressure FOMO loops, or mental distress?
- **Privacy & Information Security**: Does the service collect personally identifiable information (PII)? Is there a risk of doxxing the coordinator, leakage of sensitive user data, or tracking user locations?
- **Legal Liability & Compliance**: Does the tool violate website Terms of Service (e.g., unauthorized scraping or spamming)? Does it infringe on intellectual property (IP) or copyrights? What is the risk of civil or regulatory penalties?

### 2. Risks to Systems (Security, Reliability & Maintenance)
Evaluate technical vulnerabilities and operational stability.
- **Security & Attack Surfaces**: Are there vulnerabilities to external hacks (e.g., smart contract exploits, front-end injection, server intrusions)? Are API keys or private keys handled securely (e.g., loaded from `.env` and kept out of Git)?
- **Reliability & Availability**: How does the system handle dependency failures, API rate limiting, network downtime, database corruption, or blockchain re-orgs? Is there a backup system?
- **Maintenance & Technical Debt**: How complex is the codebase? Does the system rely on fragile automation or undocumented workflows? Is there a single point of failure (SPOF)?

### 3. Risks to Capital (Financial, Volatility & Taxes)
Analyze potential financial losses, transaction overheads, and fiscal compliance.
- **Budget Depletion**: Can a bug trigger runaway API loops, leading to unexpected cloud/AI provider billing? Are hosting/transaction fees sustainable?
- **Market & Liquidity Volatility**: How does holding, transferring, or accepting crypto-assets (SOL, ETH, USDC, etc.) expose the project to sudden market drops? Are transaction slippage fees handled correctly?
- **Regulatory & Tax Compliance**: Does the monetization model (e.g., token issuance, defi yield farming, token gating) classify as an unregistered security? How will we track income and capital gains for tax reporting?
- **Capital ROI Feasibility**: What is the ratio of capital/time invested relative to the realistic expected return? Is the project a sink for our limited $2 seed budget?

---

## 📊 Risk Evaluation Framework

Use this matrix to classify and rate identified risks:

| Likelihood \ Impact | Low (Minor inconvenience) | Medium (Recoverable setback) | High (Catastrophic failure) |
| :--- | :--- | :--- | :--- |
| **Low (Rare / Unlikely)** | Green (Low) | Yellow (Medium) | Orange (High) |
| **Medium (Possible / Occasional)** | Yellow (Medium) | Orange (High) | Red (Critical) |
| **High (Frequent / Certain)** | Orange (High) | Red (Critical) | Red (Critical) |

### Action Thresholds:
- **Green (Low)**: Document and monitor. No immediate mitigation required.
- **Yellow (Medium)**: Identify mitigations before proceeding.
- **Orange (High)**: Implement active mitigations. Must be reviewed and signed off.
- **Red (Critical)**: **BLOCKING**. Do not proceed without architectural changes or complete risk elimination.

---

## 📝 Risk Audit Report Template

When publishing your risk audit, format your findings in a new file under `agent_memory/research/` or directly in the decision thread using this template:

```markdown
# Risk Audit Report: [Project/Feature Name]

## 1. Executive Summary
- **Overall Risk Rating**: [LOW / MEDIUM / HIGH / CRITICAL]
- **Recommendation**: [PROCEED / MITIGATE FIRST / ABANDON]
- **Summary**: A brief (2-3 sentences) summary of the primary risk vectors identified.

## 2. Risk Registry

| Risk ID | Risk Domain | Description | Likelihood | Impact | Rating | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | Human / System / Capital | [e.g., Runaway API loop drains budget] | [L/M/H] | [L/M/H] | [Low/Med/High/Crit] | [e.g., Hard API usage limits & alerts] |
| R-02 | ... | ... | ... | ... | ... | ... |

## 3. Domain Analysis

### 👥 Risks to Humans
- **Analysis**: [Explain specific human safety, privacy, or legal risks.]
- **Mitigation Details**: [What steps will we take to ensure safety?]

### ⚙️ Risks to Systems
- **Analysis**: [Explain security, reliability, and maintenance concerns.]
- **Mitigation Details**: [What safety guards, backups, or rate-limiting are planned?]

### 💸 Risks to Capital
- **Analysis**: [Explain financial overheads, volatility, and tax/regulatory compliance risks.]
- **Mitigation Details**: [How will we protect seed capital and monitor transaction costs?]

## 4. Final Sign-off Checklist
- [ ] No **Critical (Red)** risks remain unmitigated.
- [ ] Legal compliance verified (ToS, copyright, crypto regulations).
- [ ] Financial alerts and caps are configured.
```

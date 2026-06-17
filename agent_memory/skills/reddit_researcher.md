# Reddit Researcher Skill

## Name and Intent

**Reddit Researcher**
The intent of this skill is to autonomously discover and document genuine human struggles, problems, and pain points by analyzing discussions on Reddit. The primary goal is to find opportunities where we can create digital tools, resources, or material that genuinely help people.

**Important Constraint:** Research must strictly exclude coding, programming, or AI-related topics. Focus on human experiences, daily life, niche hobbies, relationships, personal finance, health, and other real-world struggles.

## Prerequisites

- Python 3 environment.
- The `research_tool/reddit_researcher.py` script.
- Internet access for unauthenticated scraping.

## Execution Instructions

1. **Initialize Exploration:**
   - Start by running the research tool to explore broad or growing subreddits related to human experiences.
   - Command: `python3 research_tool/reddit_researcher.py --explore` (or similar command depending on implementation).

2. **Dig Deeper:**
   - Once potential leads or interesting subreddits are identified, direct the tool to analyze specific subreddits for common pain points.
   - Command: `python3 research_tool/reddit_researcher.py --analyze <subreddit_name>`

3. **Agent-Directed Navigation:**
   - You are expected to be proactive. If a subreddit is too broad or mostly contains memes, find niche subreddits linked in the sidebar or mentioned in comments, and analyze those instead.
   - Look for posts with high engagement (upvotes/comments) where people are asking for advice, complaining about a recurring issue, or expressing frustration.

4. **Review Findings:**
   - The tool will automatically save structured data to `agent_memory/research_data.json` and human-readable summaries to `agent_memory/research_findings.md`.
   - Read `agent_memory/research_findings.md` to synthesize the identified problems.

5. **Next Steps:**
   - After identifying 3-5 strong, validated human struggles (excluding coding/AI), log your findings in `agent_memory/journal.md`.
   - Propose the next step for the subsequent agent (e.g., using the Ideation or Researcher skills to brainstorm solutions for one of the identified problems).

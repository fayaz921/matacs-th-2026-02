# AI Proposal Triage Design

**Candidate:** Muhammad Fayaz
**Email:** mfayaz21703@gmail.com
**Reference:** MATACS-TH-2026-02  
**Time spent:** About 6 hours.

---

## How AI tools were used

I used Claude to talk through the brief and draft the design documents. I used an Antigravity agent to generate the prototype code and the README. I reviewed everything, checked the scoring by hand, and can explain and change any part of it.

At the start I planned to build a full .NET, React and SQL Server app. The brief is a design exercise, so that scope was wrong. I cut it down to documents, a diagram and a small browser prototype. A second case: my first version of the flow diagram came out garbled because of a bad terminal paste, with duplicated lines and a missing legend. I spotted it, fixed the file by hand and re-rendered it.

---

## Summary of the approach

This design splits proposal triage between AI and plain code. The AI reads proposal text at temperature 0 to extract facts, quotes and qualitative checks. Plain code handles everything that needs exact rules: pass/fail gates, scoring maths, weights, ranking and the audit log. Proposals that fail a mandatory gate are marked ineligible. Missing fields or injection attempts are flagged for review. A person makes the final award decision.

---

## Repository files

- [README.md](README.md): Project overview, tool usage, running instructions and assumptions.
- [WRITEUP.md](WRITEUP.md): Answers to the five design questions, scoring method and sample results.
- [PROMPTS.md](PROMPTS.md): Prompts for extraction and qualitative checks.
- [ranking.json](ranking.json): Expected triage ranking for sample proposals A to E.
- [diagram/flow.png](diagram/flow.png): Process flow diagram image.
- [diagram/flow.mmd](diagram/flow.mmd): Mermaid source code for the diagram.
- [prototype/criteria.js](prototype/criteria.js): Criteria config, budget ceiling, timeline limit and weights.
- [prototype/extracted.js](prototype/extracted.js): Extracted values and short evidence notes for proposals A to E.
- [prototype/scoring.js](prototype/scoring.js): Pure scoring functions for gates, points and ranking.
- [prototype/index.html](prototype/index.html): Browser UI with results table and live weight sliders.
- [prototype/style.css](prototype/style.css): Stylesheet for the prototype page.
- [prototype/app.js](prototype/app.js): Script that connects the UI to the scoring logic.
- [prototype/check.js](prototype/check.js): Node script that checks scoring output against ranking.json.

---

## How to run the prototype

You do not need to install packages or run a build step.

### Option 1: Browser UI

Double-click `prototype/index.html` to open it in your browser.

- Data loads through script tags, so it works directly from the local disk without a web server.
- You can change weights in the panel and see the table recalculate live. A warning appears if the weights do not add up to 100.
- Click "View" on any row to see the extracted facts and evidence notes.

### Option 2: Check script (Node.js)

Run the check script from the repository root:

```bash
node prototype/check.js
```

- Needs Node.js 18 or newer.
- Runs the scoring logic on the sample data, compares each result against `ranking.json`, and prints `PASS`.

---

## What is not built

There are no real LLM API calls, no PDF file upload, no database and no login screen. The brief asks for a design, so a full application was not needed.

---

## Assumptions

- Budget ceiling: Proposals are scored against a $260,000 CAD ceiling. Anything above that gets 0 points for price.
- Timeline limit: The maximum time is 16 weeks. Anything longer gets 0 points for timeline.
- Relative scoring baselines: The lowest price ($231,000 CAD from D) and shortest timeline (12 weeks from A) come from eligible proposals only.
- Missing data: Missing fields like D's timeline are left as null and flagged for a person to review.
- Prompt injection: Injections like C are flagged and ignored. The proposal is scored on its real content.
- Monitoring vs reporting: Weekly status reports do not count as a continuous system monitoring plan.

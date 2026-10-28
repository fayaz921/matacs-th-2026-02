# AI Proposal Triage Design

**Candidate:** Muhammad Fayaz  
**Reference:** MATACS-TH-2026-02  
**Time spent:** [PLACEHOLDER: I will fill in my real hours]

---

## AI Tool Usage

AI tools were used during this assessment: Claude was used for design discussion and drafting initial documentation, and the Antigravity agent was used to generate the working prototype files and README structure. I reviewed, tested, and validated all generated outputs, and I can explain all architectural decisions and code in detail.

[PLACEHOLDER: one specific place where I disagreed with or corrected the AI, and why]

---

## Approach Summary

The design splits proposal triage cleanly between AI and deterministic code. The AI reads unstructured proposal text at temperature 0 to extract verified facts with evidence quotes and check qualitative rubric items. Plain code handles everything requiring precision: mandatory pass/fail gates, mathematical score normalization, weighting, ranking, and audit logging. If a proposal fails a mandatory gate, it is immediately marked ineligible. Missing data or prompt injection attempts trigger review flags, while a human reviewer retains final authority over all overrides and award decisions.

---

## Repository Files

- [README.md](README.md) - Project overview, tool usage, running instructions, and assumptions.
- [WRITEUP.md](WRITEUP.md) - Responses to the assessment questions, scoring methodology, sample results table, and risk safeguards.
- [PROMPTS.md](PROMPTS.md) - Extraction and qualitative check prompts with JSON schemas and post-processing rules.
- [ranking.json](ranking.json) - Expected triage ranking output for sample proposals A–E.
- [diagram/flow.png](diagram/flow.png) - Process flow diagram showing AI steps, rule steps, and human checkpoints.
- [diagram/flow.mmd](diagram/flow.mmd) - Mermaid diagram source code with visual legend.
- [prototype/criteria.js](prototype/criteria.js) - Admin criteria configuration (budget ceiling, max timeline, mandatory gates, weights).
- [prototype/extracted.js](prototype/extracted.js) - Extracted facts and original paraphrased notes for proposals A–E (no quoted proposal text).
- [prototype/scoring.js](prototype/scoring.js) - Pure scoring and ranking functions (no DOM dependencies, works in browser and Node.js).
- [prototype/index.html](prototype/index.html) - Interactive prototype interface with live weight adjustments and evidence inspector.
- [prototype/style.css](prototype/style.css) - Vanilla CSS stylesheet for the prototype UI.
- [prototype/app.js](prototype/app.js) - Frontend controller managing table rendering, modal interactions, and live recalculation.
- [prototype/check.js](prototype/check.js) - Automated Node.js verification script comparing prototype scoring to `ranking.json`.

---

## How to Run the Prototype

No package installation or build step is required.

### Option 1: Browser UI
Double-click `prototype/index.html` or open it directly in any modern web browser.
- Data is loaded synchronously via `<script>` tags, so it runs directly from the local filesystem (`file://`) without CORS restrictions or local servers.
- Adjust weights live in the configuration panel to observe dynamic ranking recalculation. A warning displays if weights do not sum to 100%.
- Click "View" on any proposal row to inspect paraphrased facts and audit notes.

### Option 2: Automated Verification (Node.js)
Run the check script from the repository root:
```bash
node prototype/check.js
```
- Requires Node.js 18+.
- Runs the scoring engine against extracted sample data, compares each result (proposal, rank, status, score to 1 decimal) against `ranking.json`, and prints `PASS` (exit code 0) or exact differences (exit code 1).

---

## What Is Not Built

- **Not built:** Real LLM API calls, PDF upload/parsing pipeline, persistent database, and user authentication.
- **Why:** The assessment brief requests an architectural design and prototype demonstration rather than a production implementation.

---

## Assumptions

- **Budget ceiling:** Proposals are evaluated under an admin ceiling of $260,000 CAD. Proposals exceeding this ceiling receive 0 points on price.
- **Timeline ceiling:** The maximum allowable completion timeline is 16 weeks. Proposals exceeding 16 weeks receive 0 points on timeline.
- **Relative scoring baseline:** The lowest price ($231,000 CAD, Proposal D) and shortest timeline (12 weeks, Proposal A) are calculated strictly among eligible proposals.
- **Missing data handling:** Omitted values (such as Proposal D's completion timeline) are treated as null rather than guessed; the proposal is flagged for human review.
- **Prompt injection defense:** Untrusted proposal text cannot alter scoring rules or claim scores. Injections (Proposal C) are detected, scored on factual content only, and flagged for human confirmation.
- **Monitoring vs. reporting:** Routine weekly status reporting does not satisfy the continuous system performance monitoring requirement.

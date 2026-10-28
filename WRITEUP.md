# Write-up: AI proposal triage

The design uses AI to read messy proposal text. Plain code handles everything that must be exact: pass/fail checks, maths and ranking. A person makes the final decision.

## 1. AI vs rules

**AI does two things:**

- Extracts facts from the proposal text (price, weeks, warranty years, whether a project lead is named), each with a quote as evidence.
- Checks qualitative items against the admin's rubric (is the team described, is the experience commercial and 100 kW or more).

**Code does the rest:** PDF text extraction, loading criteria, schema validation, mandatory pass/fail checks, score normalisation, weighted totals, ranking and the audit log.

I drew the line here because AI copes well with varied wording but is poor at repeatable arithmetic. Pass/fail rules and score maths have one right answer, so code is cheaper, testable and the same every time.

## 2. Consistency and explainability

- Temperature 0, versioned prompts, and JSON output checked against a schema.
- All maths is in code. The same extracted data always gives the same ranking.
- Model wording can still vary between runs, even at temperature 0. So extraction results are stored, and ranking runs on the stored data. A second extraction run can be compared with the first, and differences are shown to the reviewer.
- Every extracted value has a quote. The reviewer sees a table per proposal: criterion, extracted value, quote, points, weight. That shows exactly why it ranked where it did.

## 3. Human in the loop

1. **Flagged items.** Injection attempts, missing data and unclear evidence are shown to the reviewer, who resolves or accepts each one.
2. **Corrections and overrides.** The reviewer can correct an extracted value (checking the quote) or override a rank, with a written reason. Code recalculates the ranking.
3. **Award decision.** The tool only recommends. A person decides.

**Audit log:** uploader, timestamp, file hash, criteria version, prompt versions, model name, raw AI outputs, scores, every override (who, what, why) and the final decision.

## 4. Changing criteria

Criteria are versioned. An edit creates a new version. Old scores stay linked to the version they were made under and are never silently changed. The screen shows "scored under v2, current is v3".

The reviewer can re-score on demand:

- Only weights changed: code recalculates from stored extraction, with no AI cost.
- A criterion was added or changed: only the affected AI step is re-run.

A before/after rank diff is shown, and a final award records the version it used. Rankings are only compared within one version.

## 5. Risks

| Risk             | Safeguard                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong extraction | Quote per value, schema check, reviewer sees the evidence and can correct it. An ineligible result is shown with its reason for a human to confirm.                                    |
| Made-up facts    | Missing data is "not stated", never guessed. Code checks each quote actually appears in the proposal text. A failed check flags the proposal.                                          |
| Bias             | Scoring uses stated facts against a fixed admin rubric. The AI never compares bidders. Writing style is not scored.                                                                    |
| Manipulation     | Proposal text is treated as untrusted data. Embedded instructions are reported, not followed. Code ignores any rank or score claimed in the text. The proposal is flagged for a human. |
| Cost             | One extraction call and one check per proposal. Results are stored, so weight changes cost nothing. Upload size limits apply.                                                          |
| Model drift      | Model name and prompt version are logged and pinned.                                                                                                                                   |
| Sensitive data   | Proposals stay in the company's own storage. Only the text needed is sent to the model.                                                                                                |

## Sample set

**Method (done in code).** Each criterion scores 0 to 100, then the weights are applied.

- Experience: installs counted up to 10, divided by 10.
- Price: lowest price among non-ineligible proposals divided by this price.
- Timeline: shortest stated weeks divided by this proposal's weeks.
- Warranty: average of panel years / 25 and workmanship years / 12.
- Team: 25 points each for named lead, crew, safety plan and monitoring plan.

|     | Exp (30) | Price (25) | Time (15) | Warranty (15) | Team (15) | Total          |
| --- | -------- | ---------- | --------- | ------------- | --------- | -------------- |
| A   | 30.00    | 24.27      | 15.00     | 13.75         | 15.00     | **98.0**       |
| E   | 24.00    | 23.81      | 13.85     | 15.00         | 15.00     | **91.7**       |
| C   | 27.00    | 23.67      | 12.86     | 13.75         | 7.50      | 84.8 (flagged) |

**Decisions on each proposal:**

- **A: rank 1.** Passes all mandatory checks and scores highest overall.
- **E: rank 2.** Best warranty and monitoring, but fewer installs and a higher price than A.
- **B: ineligible.** The licence is left to a subcontractor "to be confirmed". The criterion says the bidder must hold it, so it fails a mandatory check. Its low price does not matter.
- **C: flagged.** It contains an instruction aimed at automated reviewers. It is scored on its real content only, and the instruction has no effect. A human reviews it. If cleared it would rank 3rd. Its experience window starts before the five-year mark, so the install count may be overstated and needs confirming.
- **D: flagged.** No completion time is stated, so the timeline cannot be scored. I do not guess. Its other results are strong, so a follow-up question to the bidder is worth it.

## Assumptions

- All proposals are within the budget ceiling of $260,000, so price is scored relative to the lowest eligible bid.
- A completion time over 16 weeks would fail the timeline limit. None in the sample does.
- Monitoring and weekly reports are not the same thing, so a weekly report alone does not earn the monitoring points.

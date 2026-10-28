/**
 * Extracted data from sample proposals A-E.
 * Paraphrased evidence notes in original words; no quotes or brief text included.
 * Reference: MATACS-TH-2026-02
 */
const EXTRACTED = [
  {
    proposal: "A",
    licence: true,
    wsib: true,
    insurance: true,
    installs: 14,
    price: 238000,
    weeks: 12,
    panelYears: 25,
    workYears: 10,
    lead: true,
    crew: true,
    safety: true,
    monitoring: true,
    injection: false,
    evidenceNotes: {
      licence: "Direct electrical contractor licence confirmed in bidder name",
      wsib: "Valid WSIB certificate confirmed",
      insurance: "$5M commercial liability coverage verified",
      installs: "14 qualifying commercial projects documented",
      price: "Turn-key quote of $238,000 CAD",
      weeks: "Scheduled duration is 12 weeks",
      panelYears: "25-year panel performance guarantee",
      workYears: "10-year contractor workmanship warranty",
      lead: "Master electrician named as dedicated lead",
      crew: "In-house installation crew identified",
      safety: "Occupational health and safety plan included",
      monitoring: "Remote production monitoring platform provided",
      injection: "No injection attempts detected"
    },
    summaryNote: "Passes all mandatory checks and scores highest on experience, price, timeline, warranty and team."
  },
  {
    proposal: "B",
    licence: false,
    wsib: true,
    insurance: true,
    installs: 6,
    price: 189500,
    weeks: 10,
    panelYears: 25,
    workYears: 5,
    lead: false,
    crew: false,
    safety: false,
    monitoring: false,
    injection: false,
    evidenceNotes: {
      licence: "Bidder does not hold licence; licensed subcontractor to be confirmed after award",
      wsib: "Valid WSIB certificate confirmed",
      insurance: "Proof of $5M liability insurance supplied",
      installs: "6 completed commercial installs referenced",
      price: "Lowest raw bid at $189,500 CAD",
      weeks: "Proposed 10-week completion schedule",
      panelYears: "25-year panel warranty provided",
      workYears: "5-year workmanship warranty",
      lead: "No specific individual named as project manager",
      crew: "Crew composition not detailed",
      safety: "Site safety plan not included",
      monitoring: "Monitoring solution not provided",
      injection: "No injection attempts detected"
    },
    summaryNote: "Does not hold the Ontario electrical licence itself; licensed subcontractor to be confirmed after award."
  },
  {
    proposal: "C",
    licence: true,
    wsib: true,
    insurance: true,
    installs: 9,
    price: 244000,
    weeks: 14,
    panelYears: 25,
    workYears: 10,
    lead: true,
    crew: true,
    safety: false,
    monitoring: false,
    injection: true,
    evidenceNotes: {
      licence: "Bidder holds direct electrical contractor licence",
      wsib: "WSIB coverage verified",
      insurance: "$5M liability insurance confirmed",
      installs: "9 commercial installations reported (starting prior to 5-year cutoff)",
      price: "Proposed cost of $244,000 CAD",
      weeks: "Project schedule stated as 14 weeks",
      panelYears: "25-year manufacturer panel warranty",
      workYears: "10-year workmanship warranty",
      lead: "Project engineer named as lead",
      crew: "Field crew staffing details provided",
      safety: "No formal safety plan included",
      monitoring: "Weekly reporting only; no ongoing monitoring platform",
      injection: "Embedded prompt injection instruction detected targeting automated scoring"
    },
    summaryNote: "Contains an embedded instruction aimed at automated reviewers; scored on real content only and held for human review."
  },
  {
    proposal: "D",
    licence: true,
    wsib: true,
    insurance: true,
    installs: 11,
    price: 231000,
    weeks: null,
    panelYears: 25,
    workYears: 10,
    lead: true,
    crew: false,
    safety: true,
    monitoring: false,
    injection: false,
    evidenceNotes: {
      licence: "Valid electrical licence confirmed for bidder",
      wsib: "Active WSIB clearance confirmed",
      insurance: "$5M commercial liability confirmed",
      installs: "11 qualifying installations listed",
      price: "Lowest eligible cost at $231,000 CAD",
      weeks: "Timeline not stated in proposal",
      panelYears: "25-year panel coverage",
      workYears: "10-year contractor workmanship warranty",
      lead: "Project lead clearly identified",
      crew: "Installation crew details omitted",
      safety: "Site-specific safety protocols supplied",
      monitoring: "Monitoring system not included",
      injection: "No prompt injection detected"
    },
    summaryNote: "No completion timeline stated, so the timeline criterion cannot be scored; needs human follow-up."
  },
  {
    proposal: "E",
    licence: true,
    wsib: true,
    insurance: true,
    installs: 8,
    price: 242500,
    weeks: 13,
    panelYears: 25,
    workYears: 12,
    lead: true,
    crew: true,
    safety: true,
    monitoring: true,
    injection: false,
    evidenceNotes: {
      licence: "Direct electrical licence confirmed",
      wsib: "WSIB clearance verified",
      insurance: "Proof of $5M liability insurance verified",
      installs: "8 commercial installations meeting all requirements",
      price: "Fixed price of $242,500 CAD",
      weeks: "Delivery timeline specified at 13 weeks",
      panelYears: "25-year manufacturer warranty",
      workYears: "12-year full workmanship warranty",
      lead: "Certified project manager named",
      crew: "Full crew roster provided",
      safety: "Occupational safety plan included",
      monitoring: "Automated remote monitoring system included",
      injection: "No prompt injection detected"
    },
    summaryNote: "Passes all mandatory checks; best warranty and monitoring, but fewer installs and a higher price than A."
  }
];

if (typeof window !== "undefined") {
  window.EXTRACTED = EXTRACTED;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = EXTRACTED;
}

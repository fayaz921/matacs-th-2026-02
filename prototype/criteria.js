/**
 * Admin criteria configuration for proposal triage.
 * Category: Commercial Solar PV (100 kW+)
 * Reference: MATACS-TH-2026-02
 */
const CRITERIA = {
  categoryName: "Commercial Solar PV (100 kW+)",
  version: "1.0",
  budgetCeiling: 260000,
  maxWeeks: 16,
  mandatoryCriteria: [
    {
      id: "licence",
      name: "Licence held by bidder",
      description: "Direct electrical contractor licence (e.g. ECRA/ESA in Ontario) held by the bidder itself."
    },
    {
      id: "wsib",
      name: "WSIB clearance",
      description: "Current Workplace Safety and Insurance Board (WSIB) clearance certificate."
    },
    {
      id: "insurance",
      name: "$5M liability insurance",
      description: "Proof of at least $5,000,000 commercial general liability insurance."
    }
  ],
  weights: {
    experience: 30,
    price: 25,
    timeline: 15,
    warranty: 15,
    team: 15
  },
  weightedCriteria: [
    {
      id: "experience",
      name: "Relevant experience",
      weight: 30,
      description: "Commercial installs >= 100 kW within the last 5 years (capped at 10 installs = 100 points)."
    },
    {
      id: "price",
      name: "Price",
      weight: 25,
      description: "Total CAD price relative to lowest eligible bid (0 if above $260k budget ceiling)."
    },
    {
      id: "timeline",
      name: "Timeline",
      weight: 15,
      description: "Completion weeks relative to shortest eligible timeline (0 if > 16 weeks)."
    },
    {
      id: "warranty",
      name: "Warranty",
      weight: 15,
      description: "Average of panel warranty (target 25 yrs) and workmanship warranty (target 12 yrs)."
    },
    {
      id: "team",
      name: "Team & approach",
      weight: 15,
      description: "25 points each for named lead, stated crew, safety plan, and monitoring plan."
    }
  ]
};

if (typeof window !== "undefined") {
  window.CRITERIA = CRITERIA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CRITERIA;
}

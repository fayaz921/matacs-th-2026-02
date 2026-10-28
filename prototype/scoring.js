/**
 * Pure scoring functions for proposal triage.
 * Evaluates mandatory gates, normalizes criterion scores, applies weights,
 * handles flags/ineligibility, and ranks eligible proposals.
 * No DOM access. Works in both browser and Node.js environments.
 *
 * Reference: MATACS-TH-2026-02
 */

/**
 * Rounds a floating point number to 1 decimal place.
 * Returns null if input is null or undefined.
 */
function round1Dec(val) {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.round(val * 10) / 10;
}

/**
 * Evaluates individual criterion scores on a 0-100 scale, along with weighted points.
 */
function calculateCriterionScores(proposal, lowestPrice, shortestWeeks, criteria) {
  const budgetCeiling = criteria && criteria.budgetCeiling ? criteria.budgetCeiling : 260000;
  const maxWeeks = criteria && criteria.maxWeeks ? criteria.maxWeeks : 16;
  const weights = (criteria && criteria.weights) ? criteria.weights : {
    experience: 30,
    price: 25,
    timeline: 15,
    warranty: 15,
    team: 15
  };

  // 1. Experience score: min(installs, 10) / 10 * 100
  const installs = typeof proposal.installs === "number" ? proposal.installs : 0;
  const experienceRaw = (Math.min(installs, 10) / 10) * 100;
  const experienceWeighted = (experienceRaw * weights.experience) / 100;

  // 2. Price score: lowestPrice / price * 100 (0 if price > budgetCeiling)
  let priceRaw = 0;
  if (typeof proposal.price === "number" && proposal.price > 0) {
    if (proposal.price > budgetCeiling) {
      priceRaw = 0;
    } else if (lowestPrice > 0) {
      priceRaw = (lowestPrice / proposal.price) * 100;
    }
  }
  const priceWeighted = (priceRaw * weights.price) / 100;

  // 3. Timeline score: shortestWeeks / weeks * 100. (null if weeks not stated, 0 if > maxWeeks)
  let timelineRaw = null;
  let timelineWeighted = null;
  if (proposal.weeks === null || proposal.weeks === undefined) {
    timelineRaw = null;
    timelineWeighted = null;
  } else if (proposal.weeks > maxWeeks) {
    timelineRaw = 0;
    timelineWeighted = 0;
  } else if (typeof proposal.weeks === "number" && proposal.weeks > 0 && shortestWeeks > 0) {
    timelineRaw = (shortestWeeks / proposal.weeks) * 100;
    timelineWeighted = (timelineRaw * weights.timeline) / 100;
  }

  // 4. Warranty score: ((panelYears / 25) + (workYears / 12)) / 2 * 100 (each ratio capped at 1)
  const panelYears = typeof proposal.panelYears === "number" ? proposal.panelYears : 0;
  const workYears = typeof proposal.workYears === "number" ? proposal.workYears : 0;
  const panelRatio = Math.min(panelYears / 25, 1);
  const workRatio = Math.min(workYears / 12, 1);
  const warrantyRaw = ((panelRatio + workRatio) / 2) * 100;
  const warrantyWeighted = (warrantyRaw * weights.warranty) / 100;

  // 5. Team score: 25 points each for lead, crew, safety, monitoring
  const leadPts = proposal.lead ? 25 : 0;
  const crewPts = proposal.crew ? 25 : 0;
  const safetyPts = proposal.safety ? 25 : 0;
  const monitoringPts = proposal.monitoring ? 25 : 0;
  const teamRaw = leadPts + crewPts + safetyPts + monitoringPts;
  const teamWeighted = (teamRaw * weights.team) / 100;

  return {
    raw: {
      experience: experienceRaw,
      price: priceRaw,
      timeline: timelineRaw,
      warranty: warrantyRaw,
      team: teamRaw
    },
    weighted: {
      experience: experienceWeighted,
      price: priceWeighted,
      timeline: timelineWeighted,
      warranty: warrantyWeighted,
      team: teamWeighted
    }
  };
}

/**
 * Scores and ranks an array of proposals against criteria.
 *
 * @param {Array} proposals - Array of proposal extraction objects (A-E)
 * @param {Object} criteria - Admin criteria object with weights and limits
 * @returns {Array} Scored proposals sorted by rank, then flagged, then ineligible
 */
function scoreProposals(proposals, criteria) {
  if (!Array.isArray(proposals)) return [];

  const config = criteria || (typeof CRITERIA !== "undefined" ? CRITERIA : {});
  const weights = (config && config.weights) ? config.weights : {
    experience: 30,
    price: 25,
    timeline: 15,
    warranty: 15,
    team: 15
  };

  // Step 1: Identify eligible proposals (Pass all 3 mandatory checks: licence, wsib, insurance)
  const evaluated = proposals.map((p) => {
    const licencePass = Boolean(p.licence);
    const wsibPass = Boolean(p.wsib);
    const insurancePass = Boolean(p.insurance);
    const isEligible = licencePass && wsibPass && insurancePass;

    let failedMandatory = [];
    if (!licencePass) failedMandatory.push("licence held by bidder");
    if (!wsibPass) failedMandatory.push("WSIB clearance");
    if (!insurancePass) failedMandatory.push("$5M liability insurance");

    return {
      proposal: p.proposal || p.id,
      original: p,
      isEligible,
      failedMandatory
    };
  });

  // Step 2: Determine lowest price and shortest weeks among eligible proposals
  const eligibleItems = evaluated.filter((e) => e.isEligible);
  const eligiblePrices = eligibleItems
    .map((e) => e.original.price)
    .filter((price) => typeof price === "number" && !isNaN(price) && price > 0);
  const lowestPrice = eligiblePrices.length > 0 ? Math.min(...eligiblePrices) : 0;

  const eligibleWeeks = eligibleItems
    .map((e) => e.original.weeks)
    .filter((w) => typeof w === "number" && !isNaN(w) && w > 0);
  const shortestWeeks = eligibleWeeks.length > 0 ? Math.min(...eligibleWeeks) : 0;

  // Step 3: Compute scores and provisional status for each proposal
  const scoredList = evaluated.map((item) => {
    const p = item.original;
    const proposalId = item.proposal;

    // Check mandatory failure
    if (!item.isEligible) {
      let reason = p.summaryNote;
      if (!reason) {
        reason = `Fails mandatory check: ${item.failedMandatory.join(", ")}.`;
      }
      return {
        proposal: proposalId,
        rank: null,
        status: "ineligible",
        score: null,
        unroundedScore: null,
        reason: reason,
        breakdown: null,
        evidenceNotes: p.evidenceNotes || {},
        extracted: p
      };
    }

    // Proposal is eligible; calculate criteria scores
    const breakdown = calculateCriterionScores(p, lowestPrice, shortestWeeks, config);

    // If weeks is null, timeline cannot be scored -> flagged, score = null
    if (breakdown.raw.timeline === null) {
      let reason = p.summaryNote;
      if (!reason) {
        reason = "No completion timeline stated, so the timeline criterion cannot be scored; needs human follow-up.";
      }
      return {
        proposal: proposalId,
        rank: null,
        status: "flagged",
        score: null,
        unroundedScore: null,
        reason: reason,
        breakdown: breakdown,
        evidenceNotes: p.evidenceNotes || {},
        extracted: p
      };
    }

    // Compute total unrounded score
    const unroundedTotal =
      breakdown.weighted.experience +
      breakdown.weighted.price +
      breakdown.weighted.timeline +
      breakdown.weighted.warranty +
      breakdown.weighted.team;

    const roundedScore = round1Dec(unroundedTotal);

    // Prompt injection check
    if (p.injection) {
      let reason = p.summaryNote;
      if (!reason) {
        reason = "Contains an embedded instruction aimed at automated reviewers; scored on real content only and held for human review.";
      }
      return {
        proposal: proposalId,
        rank: null,
        status: "flagged",
        score: roundedScore,
        unroundedScore: unroundedTotal,
        reason: reason,
        breakdown: breakdown,
        evidenceNotes: p.evidenceNotes || {},
        extracted: p
      };
    }

    // Ranked candidate
    let defaultReason = p.summaryNote || "Passes all mandatory checks and evaluated under criteria.";
    return {
      proposal: proposalId,
      rank: null, // will be assigned in ranking step
      status: "ranked",
      score: roundedScore,
      unroundedScore: unroundedTotal,
      reason: defaultReason,
      breakdown: breakdown,
      evidenceNotes: p.evidenceNotes || {},
      extracted: p
    };
  });

  // Step 4: Rank proposals that have status === "ranked"
  const rankedCandidates = scoredList.filter((item) => item.status === "ranked");

  // Sort descending by unrounded total; break ties by lower price, then letter
  rankedCandidates.sort((a, b) => {
    if (b.unroundedScore !== a.unroundedScore) {
      return b.unroundedScore - a.unroundedScore;
    }
    const priceA = typeof a.extracted.price === "number" ? a.extracted.price : Infinity;
    const priceB = typeof b.extracted.price === "number" ? b.extracted.price : Infinity;
    if (priceA !== priceB) {
      return priceA - priceB;
    }
    return a.proposal.localeCompare(b.proposal);
  });

  rankedCandidates.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Step 5: Order final results: ranked (by rank asc), flagged (by score desc, then letter), ineligible (by letter)
  const flaggedItems = scoredList.filter((item) => item.status === "flagged");
  flaggedItems.sort((a, b) => {
    if (a.score !== null && b.score === null) return -1;
    if (a.score === null && b.score !== null) return 1;
    if (a.score !== null && b.score !== null && a.score !== b.score) {
      return b.score - a.score;
    }
    return a.proposal.localeCompare(b.proposal);
  });

  const ineligibleItems = scoredList.filter((item) => item.status === "ineligible");
  ineligibleItems.sort((a, b) => a.proposal.localeCompare(b.proposal));

  return [...rankedCandidates, ...flaggedItems, ...ineligibleItems];
}

if (typeof window !== "undefined") {
  window.scoreProposals = scoreProposals;
  window.calculateCriterionScores = calculateCriterionScores;
  window.round1Dec = round1Dec;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    scoreProposals,
    calculateCriterionScores,
    round1Dec
  };
}

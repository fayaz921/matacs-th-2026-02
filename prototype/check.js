#!/usr/bin/env node

/**
 * Validation check script for proposal triage scoring logic.
 * Compares computed prototype output against expected ../ranking.json.
 *
 * Checks: proposal, rank, status, score (to 1 decimal).
 * Prints PASS or the exact differences.
 * Exits with code 0 on PASS, code 1 on mismatch.
 *
 * Reference: MATACS-TH-2026-02
 */

const fs = require('fs');
const path = require('path');

const criteria = require('./criteria.js');
const extracted = require('./extracted.js');
const { scoreProposals } = require('./scoring.js');

const rankingPath = path.resolve(__dirname, '../ranking.json');

if (!fs.existsSync(rankingPath)) {
  console.error(`FAIL: Expected ranking file not found at: ${rankingPath}`);
  process.exit(1);
}

let expected;
try {
  expected = JSON.parse(fs.readFileSync(rankingPath, 'utf8'));
} catch (err) {
  console.error(`FAIL: Could not parse ../ranking.json: ${err.message}`);
  process.exit(1);
}

const actualResults = scoreProposals(extracted, criteria);

const differences = [];

if (actualResults.length !== expected.length) {
  differences.push(
    `Count mismatch: expected ${expected.length} proposals, computed ${actualResults.length}`
  );
}

expected.forEach((expItem) => {
  const actualItem = actualResults.find((a) => a.proposal === expItem.proposal);

  if (!actualItem) {
    differences.push(`Proposal ${expItem.proposal} is missing from computed results`);
    return;
  }

  // Check rank
  if (actualItem.rank !== expItem.rank) {
    differences.push(
      `Proposal ${expItem.proposal} rank mismatch: expected ${JSON.stringify(expItem.rank)}, got ${JSON.stringify(actualItem.rank)}`
    );
  }

  // Check status
  if (actualItem.status !== expItem.status) {
    differences.push(
      `Proposal ${expItem.proposal} status mismatch: expected ${JSON.stringify(expItem.status)}, got ${JSON.stringify(actualItem.status)}`
    );
  }

  // Check score to 1 decimal place
  const expScore = expItem.score === null ? null : Number(Number(expItem.score).toFixed(1));
  const actScore = actualItem.score === null ? null : Number(Number(actualItem.score).toFixed(1));

  if (expScore !== actScore) {
    differences.push(
      `Proposal ${expItem.proposal} score mismatch: expected ${expScore}, got ${actScore}`
    );
  }
});

// Check if actualResults contains unexpected proposals
actualResults.forEach((actItem) => {
  const expItem = expected.find((e) => e.proposal === actItem.proposal);
  if (!expItem) {
    differences.push(`Computed result contains unexpected proposal: ${actItem.proposal}`);
  }
});

if (differences.length > 0) {
  console.error('FAIL: Scoring results do not match ../ranking.json\n');
  console.error('Exact differences:');
  differences.forEach((diff) => console.error(`  - ${diff}`));
  console.error('\nExpected:');
  console.error(JSON.stringify(expected, null, 2));
  console.error('\nActual:');
  console.error(
    JSON.stringify(
      actualResults.map((r) => ({
        proposal: r.proposal,
        rank: r.rank,
        status: r.status,
        score: r.score
      })),
      null,
      2
    )
  );
  process.exit(1);
}

console.log('PASS');
process.exit(0);

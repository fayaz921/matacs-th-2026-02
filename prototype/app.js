/**
 * Main application script for proposal triage prototype.
 * Runs on plain Vanilla JS, synchronous execution via script tags.
 * Reference: MATACS-TH-2026-02
 */

(function initProposalApp() {
  // References to global data loaded via script tags
  const defaultCriteria = window.CRITERIA || {
    categoryName: "Commercial Solar PV (100 kW+)",
    version: "1.0",
    budgetCeiling: 260000,
    maxWeeks: 16,
    weights: { experience: 30, price: 25, timeline: 15, warranty: 15, team: 15 }
  };

  const extractedData = window.EXTRACTED || [];

  // State
  let currentWeights = { ...defaultCriteria.weights };

  // DOM Elements
  const weightInputs = {
    experience: {
      range: document.getElementById("range-experience"),
      number: document.getElementById("weight-experience"),
      display: document.getElementById("disp-experience"),
      thSpan: document.getElementById("th-w-exp")
    },
    price: {
      range: document.getElementById("range-price"),
      number: document.getElementById("weight-price"),
      display: document.getElementById("disp-price"),
      thSpan: document.getElementById("th-w-price")
    },
    timeline: {
      range: document.getElementById("range-timeline"),
      number: document.getElementById("weight-timeline"),
      display: document.getElementById("disp-timeline"),
      thSpan: document.getElementById("th-w-time")
    },
    warranty: {
      range: document.getElementById("range-warranty"),
      number: document.getElementById("weight-warranty"),
      display: document.getElementById("disp-warranty"),
      thSpan: document.getElementById("th-w-warr")
    },
    team: {
      range: document.getElementById("range-team"),
      number: document.getElementById("weight-team"),
      display: document.getElementById("disp-team"),
      thSpan: document.getElementById("th-w-team")
    }
  };

  const weightSumIndicator = document.getElementById("weight-sum-indicator");
  const weightTotalVal = document.getElementById("weight-total-val");
  const weightWarning = document.getElementById("weight-warning");
  const currentWeightSum = document.getElementById("current-weight-sum");
  const resetWeightsBtn = document.getElementById("reset-weights-btn");

  const resultsTbody = document.getElementById("results-tbody");
  const statStatusSummary = document.getElementById("stat-status-summary");

  const evidenceModal = document.getElementById("evidence-modal");
  const modalProposalTitle = document.getElementById("modal-proposal-title");
  const modalProposalSubtitle = document.getElementById("modal-proposal-subtitle");
  const modalBodyContent = document.getElementById("modal-body-content");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalDoneBtn = document.getElementById("modal-done-btn");

  /**
   * Calculates sum of weights and updates warning status
   */
  function updateWeightSumUI() {
    const sum =
      currentWeights.experience +
      currentWeights.price +
      currentWeights.timeline +
      currentWeights.warranty +
      currentWeights.team;

    weightTotalVal.textContent = sum;
    currentWeightSum.textContent = `${sum}%`;

    if (sum === 100) {
      weightSumIndicator.classList.remove("invalid");
      weightSumIndicator.classList.add("valid");
      weightWarning.classList.add("hidden");
    } else {
      weightSumIndicator.classList.remove("valid");
      weightSumIndicator.classList.add("invalid");
      weightWarning.classList.remove("hidden");
    }

    // Update column headers and percent tags
    Object.keys(weightInputs).forEach((key) => {
      const val = currentWeights[key];
      if (weightInputs[key].display) weightInputs[key].display.textContent = `${val}%`;
      if (weightInputs[key].thSpan) weightInputs[key].thSpan.textContent = val;
    });
  }

  /**
   * Formats a score number to 1 decimal place string or returns em-dash
   */
  function formatScore(score) {
    if (score === null || score === undefined || isNaN(score)) return "—";
    return Number(score).toFixed(1);
  }

  /**
   * Formats CAD price into compact string
   */
  function formatPrice(cad) {
    if (cad === null || cad === undefined) return "—";
    return `$${cad.toLocaleString()}`;
  }

  /**
   * Renders the results table based on scored proposals
   */
  function renderTable() {
    const activeCriteria = {
      ...defaultCriteria,
      weights: { ...currentWeights }
    };

    const scored = window.scoreProposals(extractedData, activeCriteria);

    // Update summary counts
    const rankedCount = scored.filter((s) => s.status === "ranked").length;
    const flaggedCount = scored.filter((s) => s.status === "flagged").length;
    const ineligibleCount = scored.filter((s) => s.status === "ineligible").length;
    statStatusSummary.textContent = `${rankedCount} Ranked · ${flaggedCount} Flagged · ${ineligibleCount} Ineligible`;

    resultsTbody.innerHTML = "";

    scored.forEach((item) => {
      const tr = document.createElement("tr");
      tr.className = `row-status-${item.status}`;

      // Rank column
      let rankHtml = '<span class="rank-badge rank-null">—</span>';
      if (item.rank === 1) {
        rankHtml = '<span class="rank-badge rank-1" title="Rank 1">#1</span>';
      } else if (item.rank === 2) {
        rankHtml = '<span class="rank-badge rank-2" title="Rank 2">#2</span>';
      } else if (item.rank !== null) {
        rankHtml = `<span class="rank-badge">#${item.rank}</span>`;
      }

      // Status badge
      let statusClass = `badge badge-${item.status}`;
      let statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);

      // Score display
      let scoreClass = `td-score score-${item.status}`;
      let scoreDisplay = formatScore(item.score);

      // Breakdown cells
      let expCell = '<span class="pts-na">—</span>';
      let priceCell = '<span class="pts-na">—</span>';
      let timeCell = '<span class="pts-na">—</span>';
      let warrCell = '<span class="pts-na">—</span>';
      let teamCell = '<span class="pts-na">—</span>';

      if (item.breakdown) {
        const b = item.breakdown;
        const ext = item.extracted;

        // Experience
        expCell = `
          <div class="cell-breakdown">
            <span class="weighted-pts">${formatScore(b.weighted.experience)} pts</span>
            <span class="raw-pts">${ext.installs} installs</span>
          </div>`;

        // Price
        priceCell = `
          <div class="cell-breakdown">
            <span class="weighted-pts">${formatScore(b.weighted.price)} pts</span>
            <span class="raw-pts">${formatPrice(ext.price)}</span>
          </div>`;

        // Timeline
        if (b.raw.timeline === null) {
          timeCell = `
            <div class="cell-breakdown">
              <span class="pts-na">Missing</span>
              <span class="raw-pts">Not stated</span>
            </div>`;
        } else {
          timeCell = `
            <div class="cell-breakdown">
              <span class="weighted-pts">${formatScore(b.weighted.timeline)} pts</span>
              <span class="raw-pts">${ext.weeks} wks</span>
            </div>`;
        }

        // Warranty
        warrCell = `
          <div class="cell-breakdown">
            <span class="weighted-pts">${formatScore(b.weighted.warranty)} pts</span>
            <span class="raw-pts">${ext.panelYears}y / ${ext.workYears}y</span>
          </div>`;

        // Team
        const teamCheckCount = [ext.lead, ext.crew, ext.safety, ext.monitoring].filter(Boolean).length;
        teamCell = `
          <div class="cell-breakdown">
            <span class="weighted-pts">${formatScore(b.weighted.team)} pts</span>
            <span class="raw-pts">${teamCheckCount}/4 checks</span>
          </div>`;
      } else if (item.status === "ineligible") {
        expCell = '<span class="pts-na">Ineligible</span>';
        priceCell = `<span class="raw-pts">${formatPrice(item.extracted.price)}</span>`;
        timeCell = `<span class="raw-pts">${item.extracted.weeks} wks</span>`;
        warrCell = '<span class="pts-na">—</span>';
        teamCell = '<span class="pts-na">—</span>';
      }

      tr.innerHTML = `
        <td class="td-rank">${rankHtml}</td>
        <td class="td-proposal">${item.proposal}</td>
        <td class="td-status"><span class="${statusClass}">${statusLabel}</span></td>
        <td class="${scoreClass}">${scoreDisplay}</td>
        <td>${expCell}</td>
        <td>${priceCell}</td>
        <td>${timeCell}</td>
        <td>${warrCell}</td>
        <td>${teamCell}</td>
        <td class="td-reason">${escapeHtml(item.reason)}</td>
        <td class="td-action">
          <button type="button" class="btn btn-view-evidence" data-proposal="${item.proposal}">View</button>
        </td>
      `;

      resultsTbody.appendChild(tr);
    });

    // Attach event listeners to "View" buttons
    resultsTbody.querySelectorAll(".btn-view-evidence").forEach((btn) => {
      btn.addEventListener("click", () => {
        const propId = btn.getAttribute("data-proposal");
        const found = scored.find((s) => s.proposal === propId);
        if (found) showEvidenceModal(found);
      });
    });
  }

  /**
   * Escape HTML helper
   */
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Displays the evidence modal with paraphrased notes
   */
  function showEvidenceModal(item) {
    const ext = item.extracted;
    const notes = item.evidenceNotes || {};

    modalProposalTitle.textContent = `Proposal ${item.proposal} · Extracted Facts & Notes`;
    modalProposalSubtitle.textContent = `Status: ${item.status.toUpperCase()} | Score: ${formatScore(item.score)}`;

    let contentHtml = `
      <div class="evidence-section">
        <h4 class="evidence-section-title">Mandatory Gate Eligibility</h4>
        <div class="evidence-item">
          <span class="evidence-key">Direct Electrical Licence: ${ext.licence ? "PASSED (true)" : "FAILED (false)"}</span>
          <span class="evidence-note">${escapeHtml(notes.licence || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">WSIB Clearance: ${ext.wsib ? "PASSED (true)" : "FAILED (false)"}</span>
          <span class="evidence-note">${escapeHtml(notes.wsib || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">$5M Liability Insurance: ${ext.insurance ? "PASSED (true)" : "FAILED (false)"}</span>
          <span class="evidence-note">${escapeHtml(notes.insurance || "—")}</span>
        </div>
      </div>

      <div class="evidence-section">
        <h4 class="evidence-section-title">Weighted Criteria Facts</h4>
        <div class="evidence-item">
          <span class="evidence-key">Relevant Experience (installs): ${ext.installs}</span>
          <span class="evidence-note">${escapeHtml(notes.installs || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">Total Price: ${formatPrice(ext.price)} CAD</span>
          <span class="evidence-note">${escapeHtml(notes.price || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">Delivery Timeline: ${ext.weeks !== null ? ext.weeks + " weeks" : "Not stated (null)"}</span>
          <span class="evidence-note">${escapeHtml(notes.weeks || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">Warranty Coverage: Panel ${ext.panelYears} yrs / Workmanship ${ext.workYears} yrs</span>
          <span class="evidence-note">Panel: ${escapeHtml(notes.panelYears || "—")} | Workmanship: ${escapeHtml(notes.workYears || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">Team &amp; Approach Checks</span>
          <span class="evidence-note">Lead: ${escapeHtml(notes.lead || "—")} | Crew: ${escapeHtml(notes.crew || "—")} | Safety: ${escapeHtml(notes.safety || "—")} | Monitoring: ${escapeHtml(notes.monitoring || "—")}</span>
        </div>
      </div>

      <div class="evidence-section">
        <h4 class="evidence-section-title">Audit Flag &amp; Injection Check</h4>
        <div class="evidence-item">
          <span class="evidence-key">Injection Flag: ${ext.injection ? "FLAGGED (true)" : "Clean (false)"}</span>
          <span class="evidence-note">${escapeHtml(notes.injection || "—")}</span>
        </div>
        <div class="evidence-item">
          <span class="evidence-key">Reviewer Audit Reason</span>
          <span class="evidence-note">${escapeHtml(item.reason || "—")}</span>
        </div>
      </div>
    `;

    modalBodyContent.innerHTML = contentHtml;
    evidenceModal.classList.remove("hidden");
  }

  function hideEvidenceModal() {
    evidenceModal.classList.add("hidden");
  }

  // Setup input bindings for weights
  Object.keys(weightInputs).forEach((key) => {
    const pair = weightInputs[key];
    const updateWeight = (newVal) => {
      let num = parseInt(newVal, 10);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 100) num = 100;

      currentWeights[key] = num;
      if (pair.range) pair.range.value = num;
      if (pair.number) pair.number.value = num;

      updateWeightSumUI();
      renderTable();
    };

    if (pair.range) {
      pair.range.addEventListener("input", (e) => updateWeight(e.target.value));
    }
    if (pair.number) {
      pair.number.addEventListener("input", (e) => updateWeight(e.target.value));
    }
  });

  // Reset button
  if (resetWeightsBtn) {
    resetWeightsBtn.addEventListener("click", () => {
      currentWeights = { ...defaultCriteria.weights };
      Object.keys(weightInputs).forEach((key) => {
        const val = currentWeights[key];
        if (weightInputs[key].range) weightInputs[key].range.value = val;
        if (weightInputs[key].number) weightInputs[key].number.value = val;
      });
      updateWeightSumUI();
      renderTable();
    });
  }

  // Modal close buttons and backdrop click
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", hideEvidenceModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener("click", hideEvidenceModal);
  if (evidenceModal) {
    evidenceModal.addEventListener("click", (e) => {
      if (e.target === evidenceModal) hideEvidenceModal();
    });
  }

  // Escape key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !evidenceModal.classList.contains("hidden")) {
      hideEvidenceModal();
    }
  });

  // Initial render
  updateWeightSumUI();
  renderTable();
})();

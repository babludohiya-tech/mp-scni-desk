/**
 * MP Cheque Bounce Desk — Bare Acts (BNS & BNSS) Logic
 * Handles interactive browsing and searching of new criminal laws.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ───────────── Mock Database ─────────────
  const BNS_DATA = [
    {
      section: "Section 303",
      title: "Theft",
      description: "Dishonestly taking any moveable property out of the possession of any person without that person's consent, or moving that property in order to such taking.",
      nature: "Cognizable, Bailable (under clause 2)",
      triableBy: "Any Magistrate",
      punishment: "Imprisonment of either description for a term which may extend to three years, or with fine, or with both; or with community service (if value is under ₹5,000 and first offence).",
      fine: "Subject to Magistrate's jurisdiction limits."
    },
    {
      section: "Section 318",
      title: "Cheating",
      description: "Deceiving any person, fraudulently or dishonestly inducing the person so deceived to deliver any property to any person, or to consent that any person shall retain any property.",
      nature: "Cognizable, Non-Bailable (under clause 4 for cheating and inducing delivery of property)",
      triableBy: "Magistrate of the First Class",
      punishment: "Imprisonment of either description for a term which may extend to three years (under clause 2) or up to seven years (under clause 4 for delivery of property).",
      fine: "Subject to Court's discretion."
    },
    {
      section: "Section 103",
      title: "Murder",
      description: "Whoever commits murder shall be punished. Murder is defined as causing death with the intention of causing death, or causing bodily injury sufficient in the ordinary course of nature to cause death.",
      nature: "Cognizable, Non-Bailable",
      triableBy: "Court of Session",
      punishment: "Death or Imprisonment for Life.",
      fine: "Mandatory fine (amount decided by Court)."
    }
  ];

  const BNSS_DATA = [
    {
      section: "Section 35",
      title: "When Police May Arrest Without Warrant",
      description: "Details the statutory conditions under which a police officer may arrest any person without an order from a Magistrate and without a warrant (replaces Section 41 of CrPC).",
      nature: "Procedural Guideline",
      triableBy: "N/A (Procedural)",
      punishment: "None (Governs police procedure).",
      fine: "None"
    },
    {
      section: "Section 173",
      title: "Information in Cognizable Cases (FIR)",
      description: "Every information relating to the commission of a cognizable offence, whether given orally or electronically (e-FIR), must be registered by the officer in charge of a police station (replaces Section 154 of CrPC).",
      nature: "Procedural Guideline",
      triableBy: "N/A (Procedural)",
      punishment: "None (Governs registration of criminal cases).",
      fine: "None"
    },
    {
      section: "Section 480",
      title: "Bail in Non-Bailable Offences",
      description: "Defines when a person accused of, or suspected of, the commission of any non-bailable offence may be released on bail by a Court or Police Officer (replaces Section 437 of CrPC).",
      nature: "Procedural Guideline",
      triableBy: "Court / Police Officer",
      punishment: "None (Governs release on bail).",
      fine: "None"
    }
  ];

  // ───────────── State & Elements ─────────────
  let activeAct = "BNS"; // default active act
  
  const btnBNS = document.getElementById('btnBNS');
  const btnBNSS = document.getElementById('btnBNSS');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  // ── Toast function ──
  function showToast(message, type = 'error') {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = `toast toast--${type} toast--visible`;
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3000);
  }

  // ───────────── Render Logic ─────────────
  function renderResults(filteredData) {
    resultsContainer.innerHTML = "";
    
    if (filteredData.length === 0) {
      resultsCount.textContent = "No matches found";
      resultsContainer.innerHTML = `
        <div class="no-results-card animate-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="no-results-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <div class="no-results-title">No Sections Found</div>
          <div class="no-results-desc">Try searching for other section numbers or keywords like "Theft", "Arrest", or "Bail".</div>
        </div>
      `;
      return;
    }

    resultsCount.textContent = `Found ${filteredData.length} section${filteredData.length !== 1 ? 's' : ''}`;

    filteredData.forEach(item => {
      const card = document.createElement('div');
      card.className = "act-card animate-in";
      card.innerHTML = `
        <div class="act-card-header">
          <span class="act-card-section">${item.section}</span>
          <h3 class="act-card-title">${item.title}</h3>
        </div>
        <div class="act-card-body">
          <p class="act-card-desc">${item.description}</p>
          <div class="act-details-grid">
            <div class="act-detail-item">
              <span class="act-detail-label">Nature of Offence:</span>
              <span class="act-detail-value">${item.nature}</span>
            </div>
            <div class="act-detail-item">
              <span class="act-detail-label">Triable By:</span>
              <span class="act-detail-value">${item.triableBy}</span>
            </div>
            <div class="act-detail-item">
              <span class="act-detail-label">Punishment:</span>
              <span class="act-detail-value">${item.punishment}</span>
            </div>
            <div class="act-detail-item">
              <span class="act-detail-label">Fine:</span>
              <span class="act-detail-value">${item.fine}</span>
            </div>
          </div>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // ───────────── Filter Logic ─────────────
  function performFilter() {
    const query = searchInput.value.toLowerCase().trim();
    const sourceData = activeAct === "BNS" ? BNS_DATA : BNSS_DATA;

    if (!query) {
      clearSearchBtn.style.display = 'none';
      renderResults(sourceData);
      return;
    }

    clearSearchBtn.style.display = 'block';

    const filtered = sourceData.filter(item => {
      return (
        item.section.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.nature.toLowerCase().includes(query) ||
        item.triableBy.toLowerCase().includes(query) ||
        item.punishment.toLowerCase().includes(query)
      );
    });

    renderResults(filtered);
  }

  // ───────────── Event Listeners ─────────────
  btnBNS.addEventListener('click', () => {
    if (activeAct === "BNS") return;
    activeAct = "BNS";
    btnBNS.classList.add('active-act');
    btnBNSS.classList.remove('active-act');
    searchInput.placeholder = "Search BNS 2023 (e.g. Theft, Cheating, Murder)...";
    performFilter();
    showToast("Switched to BNS 2023", "success");
  });

  btnBNSS.addEventListener('click', () => {
    if (activeAct === "BNSS") return;
    activeAct = "BNSS";
    btnBNSS.classList.add('active-act');
    btnBNS.classList.remove('active-act');
    searchInput.placeholder = "Search BNSS 2023 (e.g. Arrest, FIR, Bail)...";
    performFilter();
    showToast("Switched to BNSS 2023", "success");
  });

  searchInput.addEventListener('input', performFilter);

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = "";
    performFilter();
    searchInput.focus();
  });

  // ── Initial Render ──
  performFilter();

});

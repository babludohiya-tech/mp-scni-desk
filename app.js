/**
 * MP SCNI Desk — Business Logic & Application Controller
 * Fee & Limitation Calculator for Section 138 NI Act (Madhya Pradesh)
 *
 * Sequential flow: Court Fee first → Limitation Checker appears after.
 * Date format: dd/mm/yyyy with auto-formatting.
 */

// ───────────── Utility Functions ─────────────

/**
 * Proper Indian grouping: last 3 digits, then groups of 2.
 * e.g., 150000 → "₹ 1,50,000"
 */
function formatIndianNumber(num) {
  const rounded = Math.round(num);
  const s = rounded.toString();
  if (s.length <= 3) return '₹ ' + s;

  const last3 = s.slice(-3);
  let remaining = s.slice(0, -3);
  let grouped = '';
  while (remaining.length > 2) {
    grouped = ',' + remaining.slice(-2) + grouped;
    remaining = remaining.slice(0, -2);
  }
  grouped = remaining + grouped;
  return '₹ ' + grouped + ',' + last3;
}

/**
 * Calculate difference in days between two Date objects (date2 - date1).
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2 - d1) / oneDay);
}

/**
 * Check if presentation date exceeds 3 calendar months from cheque date.
 */
function isChequeStale(chequeDate, presentationDate) {
  const expiryDate = new Date(chequeDate.getFullYear(), chequeDate.getMonth() + 3, chequeDate.getDate());
  const pNorm = new Date(presentationDate.getFullYear(), presentationDate.getMonth(), presentationDate.getDate());
  return pNorm > expiryDate;
}

/**
 * Format a Date as dd/mm/yyyy.
 */
function formatDateDMY(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Parse a dd/mm/yyyy string into a Date object. Returns null if invalid.
 */
function parseDMY(str) {
  const cleaned = str.trim();
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic range checks
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  const date = new Date(year, month - 1, day);

  // Verify the date didn't roll over (e.g., 31/02 → March)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }

  return date;
}

/**
 * Auto-format a date input field as the user types: dd/mm/yyyy.
 * Inserts slashes automatically after dd and mm.
 */
function setupDateAutoFormat(inputElement) {
  inputElement.addEventListener('input', function (e) {
    let val = this.value.replace(/[^0-9]/g, ''); // strip non-digits

    // Limit to 8 digits (ddmmyyyy)
    if (val.length > 8) val = val.slice(0, 8);

    // Insert slashes
    let formatted = '';
    if (val.length >= 1) formatted = val.slice(0, 2);
    if (val.length >= 3) formatted += '/' + val.slice(2, 4);
    if (val.length >= 5) formatted += '/' + val.slice(4, 8);

    this.value = formatted;
  });

  // Also handle paste events
  inputElement.addEventListener('paste', function (e) {
    setTimeout(() => {
      let val = this.value.replace(/[^0-9]/g, '').slice(0, 8);
      let formatted = '';
      if (val.length >= 1) formatted = val.slice(0, 2);
      if (val.length >= 3) formatted += '/' + val.slice(2, 4);
      if (val.length >= 5) formatted += '/' + val.slice(4, 8);
      this.value = formatted;
    }, 0);
  });
}


// ───────────── Court Fee Calculator (MP Slabs) ─────────────

function calculateCourtFee(chequeAmount) {
  const A = chequeAmount;
  let fee = 0;
  let slab = '';
  let breakdown = '';

  if (A <= 100000) {
    fee = A * 0.05;
    slab = 'Slab 1 (Up to ₹1,00,000)';
    breakdown = `${formatIndianNumber(A)} × 5% = ${formatIndianNumber(fee)}`;
    if (fee < 200) {
      breakdown += `\nMinimum fee of ₹200 applied (calculated: ${formatIndianNumber(fee)})`;
      fee = 200;
    }
  } else if (A <= 500000) {
    const excess = A - 100000;
    fee = 5000 + (excess * 0.04);
    slab = 'Slab 2 (₹1,00,001 – ₹5,00,000)';
    breakdown = `₹5,000 + (${formatIndianNumber(excess)} × 4%)\n= ₹5,000 + ${formatIndianNumber(excess * 0.04)}\n= ${formatIndianNumber(fee)}`;
  } else {
    const excess = A - 500000;
    fee = 21000 + (excess * 0.03);
    slab = 'Slab 3 (Above ₹5,00,000)';
    breakdown = `₹21,000 + (${formatIndianNumber(excess)} × 3%)\n= ₹21,000 + ${formatIndianNumber(excess * 0.03)}\n= ${formatIndianNumber(fee)}`;
    if (fee > 150000) {
      breakdown += `\nMaximum fee cap of ₹1,50,000 applied (calculated: ${formatIndianNumber(fee)})`;
      fee = 150000;
    }
  }

  return { fee, slab, breakdown };
}


// ───────────── Limitation Checker ─────────────

function checkLimitation(chequeDate, presentationDate, dateDishonour, noticeDispatch, noticeDelivery, filingDate) {
  const presentationDays = daysBetween(chequeDate, presentationDate);
  const chequeStale = isChequeStale(chequeDate, presentationDate);

  const noticeDays = daysBetween(dateDishonour, noticeDispatch);
  const noticeBarred = noticeDays > 30;

  const filingDays = daysBetween(noticeDelivery, filingDate);
  const filingBarred = filingDays > 45;

  return {
    chequeStale,
    presentationDays,
    noticeBarred,
    noticeDays,
    filingBarred,
    filingDays,
    withinLimitation: !chequeStale && !noticeBarred && !filingBarred,
  };
}


// ───────────── DOM Controller ─────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Toast system ──
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  function showToast(message, type = 'error') {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = `toast toast--${type} toast--visible`;
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3500);
  }

  // ── Setup dd/mm/yyyy auto-formatting on all date inputs ──
  document.querySelectorAll('.date-input').forEach(setupDateAutoFormat);


  // ════════════════════════════════════════════
  //  MODULE 1 — Court Fee Calculator
  // ════════════════════════════════════════════

  const feeForm = document.getElementById('feeForm');
  const chequeAmountInput = document.getElementById('chequeAmount');
  const btnCalculateFee = document.getElementById('btnCalculateFee');
  const feeResultSection = document.getElementById('feeResultSection');
  const feeCard = document.getElementById('feeResult');
  const limitationSection = document.getElementById('limitationSection');

  function handleFeeCalculation(e) {
    e.preventDefault();

    const rawVal = chequeAmountInput.value.replace(/,/g, '').trim();
    if (!rawVal || isNaN(parseFloat(rawVal)) || parseFloat(rawVal) <= 0) {
      showToast('⚠️ Please enter a valid Cheque Amount.');
      chequeAmountInput.focus();
      return;
    }

    const chequeAmount = parseFloat(rawVal);
    const { fee, slab, breakdown } = calculateCourtFee(chequeAmount);
    const breakdownLines = breakdown.split('\n').map(l => `<div>${l}</div>`).join('');

    feeCard.innerHTML = `
      <div class="result-card__header">
        <div class="result-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <span class="result-card__title">Court Fee Calculation</span>
      </div>
      <div class="result-card__body">
        <div class="fee-value">${formatIndianNumber(fee)}</div>
        <div class="fee-label">Ad-Valorem Court Fee — ${slab}</div>
        <div class="fee-breakdown">
          <div class="fee-breakdown__title">Calculation Breakdown</div>
          <div class="fee-breakdown__text">${breakdownLines}</div>
        </div>
      </div>
    `;

    feeResultSection.style.display = 'block';
    feeResultSection.classList.add('animate-in');

    // Reveal the Limitation Checker section with animation
    if (limitationSection.style.display === 'none') {
      limitationSection.style.display = 'block';
      limitationSection.classList.add('animate-in');

      // Scroll to it smoothly after a brief delay
      setTimeout(() => {
        limitationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }

    // Button feedback
    btnCalculateFee.style.transform = 'scale(0.97)';
    setTimeout(() => { btnCalculateFee.style.transform = ''; }, 150);
  }

  feeForm.addEventListener('submit', handleFeeCalculation);
  btnCalculateFee.addEventListener('click', handleFeeCalculation);

  // ── Clear Fee ──
  const btnClearFee = document.getElementById('btnClearFee');
  btnClearFee.addEventListener('click', () => {
    chequeAmountInput.value = '';
    feeCard.innerHTML = '';
    feeResultSection.style.display = 'none';

    // Also hide limitation section and reset it (restore sequential flow)
    limitationSection.style.display = 'none';
    limitationSection.classList.remove('animate-in');
    limitationResultSection.style.display = 'none';
    limitationCard.innerHTML = '';
    [chequeDateInput, chequePresentationInput, dateDishonourInput,
     noticeDispatchInput, noticeDeliveryInput, filingDateInput].forEach(el => { el.value = ''; });

    chequeAmountInput.focus();
    showToast('✓ Cleared', 'success');
  });

  // Numeric-only enforcement for cheque amount
  chequeAmountInput.addEventListener('input', () => {
    chequeAmountInput.value = chequeAmountInput.value.replace(/[^0-9.]/g, '');
    const parts = chequeAmountInput.value.split('.');
    if (parts.length > 2) {
      chequeAmountInput.value = parts[0] + '.' + parts.slice(1).join('');
    }
  });

  chequeAmountInput.addEventListener('blur', () => {
    const val = chequeAmountInput.value.replace(/,/g, '').trim();
    if (val && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
      chequeAmountInput.value = val;
    }
  });


  // ════════════════════════════════════════════
  //  MODULE 2 — Limitation Checker
  // ════════════════════════════════════════════

  const limitationForm = document.getElementById('limitationForm');
  const chequeDateInput = document.getElementById('chequeDate');
  const chequePresentationInput = document.getElementById('chequePresentationDate');
  const dateDishonourInput = document.getElementById('dateDishonour');
  const noticeDispatchInput = document.getElementById('noticeDispatch');
  const noticeDeliveryInput = document.getElementById('noticeDelivery');
  const filingDateInput = document.getElementById('filingDate');
  const btnCheckLimitation = document.getElementById('btnCheckLimitation');
  const limitationResultSection = document.getElementById('limitationResultSection');
  const limitationCard = document.getElementById('limitationResult');

  function validateLimitationDates() {
    const fields = [
      { el: chequeDateInput, name: 'Cheque Date' },
      { el: chequePresentationInput, name: 'Cheque Presentation Date' },
      { el: dateDishonourInput, name: 'Date of Dishonour' },
      { el: noticeDispatchInput, name: 'Notice Dispatch Date' },
      { el: noticeDeliveryInput, name: 'Notice Delivery Date' },
      { el: filingDateInput, name: 'Case Filing Date' },
    ];

    // Check all fields filled
    for (const f of fields) {
      if (!f.el.value.trim()) {
        showToast('⚠️ Please select all dates.');
        f.el.focus();
        return false;
      }
    }

    // Parse all dates
    const parsed = {};
    const keys = ['cheque', 'presentation', 'dishonour', 'dispatch', 'delivery', 'filing'];
    for (let i = 0; i < fields.length; i++) {
      const date = parseDMY(fields[i].el.value);
      if (!date) {
        showToast(`⚠️ Invalid date format for "${fields[i].name}". Use dd/mm/yyyy.`);
        fields[i].el.focus();
        return false;
      }
      parsed[keys[i]] = date;
    }

    // Logical ordering checks
    if (parsed.presentation < parsed.cheque) {
      showToast('⚠️ Presentation Date cannot be before Cheque Date.');
      return false;
    }
    if (parsed.dishonour < parsed.presentation) {
      showToast('⚠️ Date of Dishonour cannot be before Presentation Date.');
      return false;
    }
    if (parsed.dispatch < parsed.dishonour) {
      showToast('⚠️ Notice Dispatch Date cannot be before Date of Dishonour.');
      return false;
    }
    if (parsed.delivery < parsed.dispatch) {
      showToast('⚠️ Notice Delivery Date cannot be before Dispatch Date.');
      return false;
    }
    if (parsed.filing < parsed.delivery) {
      showToast('⚠️ Case Filing Date cannot be before Delivery Date.');
      return false;
    }

    return parsed;
  }

  function handleLimitationCheck(e) {
    e.preventDefault();

    const dates = validateLimitationDates();
    if (!dates) return;

    const result = checkLimitation(
      dates.cheque, dates.presentation, dates.dishonour,
      dates.dispatch, dates.delivery, dates.filing
    );

    const { chequeStale, presentationDays, noticeDays, filingDays, noticeBarred, filingBarred, withinLimitation } = result;

    // Determine status text
    let statusClass, statusText;
    if (chequeStale) {
      statusClass = 'status-text--error';
      statusText = 'Cheque Stale / Invalid Presentation ❌';
    } else if (noticeBarred && filingBarred) {
      statusClass = 'status-text--error';
      statusText = 'Notice & Case Time Barred ❌';
    } else if (noticeBarred) {
      statusClass = 'status-text--error';
      statusText = 'Notice Time Barred ❌';
    } else if (filingBarred) {
      statusClass = 'status-text--error';
      statusText = 'Case Time Barred ❌';
    } else {
      statusClass = 'status-text--success';
      statusText = 'Within Limitation ✅';
    }

    // Expiry date for cheque validity display
    const expiry = new Date(dates.cheque.getFullYear(), dates.cheque.getMonth() + 3, dates.cheque.getDate());
    const expiryStr = formatDateDMY(expiry);
    const chequeRemainingDays = daysBetween(dates.presentation, expiry);

    // Helper: format remaining / exceeded text
    function remainingText(used, limit) {
      const left = limit - used;
      if (left >= 0) {
        return `<span class="detail-row__remaining detail-row__remaining--ok">${left} day${left !== 1 ? 's' : ''} remaining</span>`;
      } else {
        const over = Math.abs(left);
        return `<span class="detail-row__remaining detail-row__remaining--fail">exceeded by ${over} day${over !== 1 ? 's' : ''}</span>`;
      }
    }

    // Build detail rows
    let detailsHTML = `
      <div class="detail-row">
        <span class="detail-row__label">Cheque Validity (3 months, expires ${expiryStr})</span>
        <span class="detail-row__value ${chequeStale ? 'detail-row__value--fail' : 'detail-row__value--ok'}">
          ${presentationDays} day${presentationDays !== 1 ? 's' : ''} ${chequeStale ? '❌ Stale' : '✓ Valid'}
        </span>
      </div>
      <div class="detail-row detail-row--sub">
        ${chequeStale
          ? `<span class="detail-row__remaining detail-row__remaining--fail">exceeded by ${Math.abs(chequeRemainingDays)} day${Math.abs(chequeRemainingDays) !== 1 ? 's' : ''}</span>`
          : `<span class="detail-row__remaining detail-row__remaining--ok">${chequeRemainingDays} day${chequeRemainingDays !== 1 ? 's' : ''} remaining until expiry</span>`
        }
      </div>
    `;

    // If cheque is stale, stop further checks
    if (!chequeStale) {
      detailsHTML += `
        <div class="detail-row">
          <span class="detail-row__label">Notice Period (max 30 days)</span>
          <span class="detail-row__value ${noticeBarred ? 'detail-row__value--fail' : 'detail-row__value--ok'}">
            ${noticeDays} day${noticeDays !== 1 ? 's' : ''} ${noticeBarred ? '❌' : '✓'}
          </span>
        </div>
        <div class="detail-row detail-row--sub">
          ${remainingText(noticeDays, 30)}
        </div>
        <div class="detail-row">
          <span class="detail-row__label">Filing Period (max 45 days)</span>
          <span class="detail-row__value ${filingBarred ? 'detail-row__value--fail' : 'detail-row__value--ok'}">
            ${filingDays} day${filingDays !== 1 ? 's' : ''} ${filingBarred ? '❌' : '✓'}
          </span>
        </div>
        <div class="detail-row detail-row--sub">
          ${remainingText(filingDays, 45)}
        </div>
      `;
    }

    limitationCard.innerHTML = `
      <div class="result-card__header">
        <div class="result-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span class="result-card__title">Limitation Status</span>
      </div>
      <div class="result-card__body">
        <div class="status-text ${statusClass}">${statusText}</div>
        <div class="limitation-details">
          ${detailsHTML}
        </div>
      </div>
    `;

    limitationResultSection.style.display = 'block';
    limitationResultSection.classList.add('animate-in');

    // Button feedback
    btnCheckLimitation.style.transform = 'scale(0.97)';
    setTimeout(() => { btnCheckLimitation.style.transform = ''; }, 150);
  }

  limitationForm.addEventListener('submit', handleLimitationCheck);
  btnCheckLimitation.addEventListener('click', handleLimitationCheck);

  // ── Clear Limitation ──
  const btnClearLimitation = document.getElementById('btnClearLimitation');
  btnClearLimitation.addEventListener('click', () => {
    [chequeDateInput, chequePresentationInput, dateDishonourInput,
     noticeDispatchInput, noticeDeliveryInput, filingDateInput].forEach(el => { el.value = ''; });
    limitationCard.innerHTML = '';
    limitationResultSection.style.display = 'none';

    chequeDateInput.focus();
    showToast('✓ Cleared', 'success');
  });

  // ── Kebab Menu Dropdown ──
  const kebabMenuBtn = document.getElementById('kebabMenuBtn');
  const kebabDropdown = document.getElementById('kebabDropdown');
  const menuLogin = document.getElementById('menuLogin');

  function toggleDropdown() {
    const isExpanded = kebabMenuBtn.getAttribute('aria-expanded') === 'true';
    kebabMenuBtn.setAttribute('aria-expanded', !isExpanded);
    kebabDropdown.classList.toggle('show');
  }

  function closeDropdown() {
    kebabMenuBtn.setAttribute('aria-expanded', 'false');
    kebabDropdown.classList.remove('show');
  }

  kebabMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close when clicking dropdown items
  kebabDropdown.querySelectorAll('.kebab-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      closeDropdown();
    });
  });

  // Close when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (!kebabMenuBtn.contains(e.target) && !kebabDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  // Login handler
  menuLogin.addEventListener('click', () => {
    showToast('Login feature coming soon!', 'info');
  });

});

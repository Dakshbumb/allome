/* ============================================================
   ALLOME — Bespoke Configurator Logic
   3-step form: Choose → Personalise → Preview → WhatsApp
   ============================================================ */

'use strict';

const WA_NUMBER = '919999999999';

// State
const state = {
  step: 1,
  design: null,
  metal: 'yellow-gold',
  metalLabel: 'Yellow Gold',
  gemstone: 'none',
  gemstoneLabel: 'None',
  engraving: '',
  size: '',
  occasion: '',
  notes: '',
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initStep1();
  initStep2();
  initStep3();
});

// ─── NAV (mobile hamburger) ───
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('nav-overlay');
  if (!hamburger || !overlay) return;

  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('is-open');
    overlay.classList.toggle('is-open', !isOpen);
    hamburger.classList.toggle('is-open', !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  overlay.querySelectorAll('.nav__overlay-link').forEach(link => {
    link.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ═══════════════════════════════════════════════════════
// STEP 1: Choose Design
// ═══════════════════════════════════════════════════════

function initStep1() {
  const radios = document.querySelectorAll('.design-card__radio');
  const continueBtn = document.getElementById('btn-step-1');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.design = radio.value;

      // Enable continue button
      continueBtn.disabled = false;

      // Update design labels
      const labelMap = { ring: 'The Solitaire Ring', necklace: 'The Pendant Necklace', bracelet: 'The Gold Bangle' };
      state.designLabel = labelMap[state.design] || state.design;

      // Update preview if it exists
      const previewDesign = document.getElementById('preview-design');
      if (previewDesign) previewDesign.textContent = state.designLabel;
    });
  });

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!state.design) return;
      goToStep(2);
    });
  }
}


// ═══════════════════════════════════════════════════════
// STEP 2: Personalise
// ═══════════════════════════════════════════════════════

function initStep2() {
  // Metal selection
  document.querySelectorAll('[name="metal"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.metal = radio.value;
      const labelMap = { 'yellow-gold': 'Yellow Gold', 'rose-gold': 'Rose Gold', 'silver': 'Sterling Silver' };
      state.metalLabel = labelMap[state.metal];
      updatePreview();
    });
  });

  // Gemstone selection
  document.querySelectorAll('[name="gemstone"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.gemstone = radio.value;
      const labelMap = { 'none': 'None', 'diamond': 'Diamond', 'ruby': 'Ruby', 'emerald': 'Emerald', 'sapphire': 'Sapphire' };
      state.gemstoneLabel = labelMap[state.gemstone];
      updatePreview();
    });
  });

  // Engraving
  const engravingInput = document.getElementById('engraving-input');
  const engravingCounter = document.getElementById('engraving-counter');
  if (engravingInput) {
    engravingInput.addEventListener('input', () => {
      state.engraving = engravingInput.value;
      const len = state.engraving.length;
      if (engravingCounter) engravingCounter.textContent = `${len} / 20`;
      updatePreview();
    });
  }

  // Size
  const sizeSelect = document.getElementById('size-select');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', () => {
      state.size = sizeSelect.options[sizeSelect.selectedIndex].text;
      updatePreview();
    });
  }

  // Occasion
  const occasionSelect = document.getElementById('occasion-select');
  if (occasionSelect) {
    occasionSelect.addEventListener('change', () => {
      state.occasion = occasionSelect.options[occasionSelect.selectedIndex].text;
    });
  }

  // Notes
  const notesInput = document.getElementById('notes-input');
  if (notesInput) {
    notesInput.addEventListener('input', () => {
      state.notes = notesInput.value;
    });
  }

  // Back button
  const backBtn = document.getElementById('btn-back-1');
  if (backBtn) {
    backBtn.addEventListener('click', () => goToStep(1));
  }

  // Continue to step 3
  const continueBtn = document.getElementById('btn-step-2');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => goToStep(3));
  }
}

function updatePreview() {
  const specMetal     = document.getElementById('spec-metal');
  const specGem       = document.getElementById('spec-gem');
  const specEngraving = document.getElementById('spec-engraving');
  const specSize      = document.getElementById('spec-size');
  const previewDesign = document.getElementById('preview-design');

  if (specMetal)     specMetal.textContent     = state.metalLabel || 'Yellow Gold';
  if (specGem)       specGem.textContent       = state.gemstoneLabel || 'None';
  if (specEngraving) specEngraving.textContent = state.engraving || '—';
  if (specSize)      specSize.textContent      = state.size || 'Not selected';
  if (previewDesign) previewDesign.textContent = state.designLabel || 'Your Piece';
}


// ═══════════════════════════════════════════════════════
// STEP 3: Final Preview & WhatsApp
// ═══════════════════════════════════════════════════════

function initStep3() {
  const backBtn = document.getElementById('btn-back-2');
  if (backBtn) {
    backBtn.addEventListener('click', () => goToStep(2));
  }
}

function buildFinalPreview() {
  const container = document.getElementById('final-specs');
  if (!container) return;

  const specs = [
    { key: 'Design',     val: state.designLabel || state.design || '—' },
    { key: 'Metal',      val: state.metalLabel || '—' },
    { key: 'Gemstone',   val: state.gemstoneLabel || '—' },
    { key: 'Engraving',  val: state.engraving || 'None' },
    { key: 'Size',       val: state.size || 'To confirm' },
    { key: 'Occasion',   val: state.occasion || '—' },
  ];

  container.innerHTML = specs.map(s => `
    <div class="final-spec">
      <span class="final-spec__key">${s.key}</span>
      <span class="final-spec__val">${s.val}</span>
    </div>
  `).join('');

  // Build WhatsApp message
  const msg = buildWAMessage();
  const waLink = document.getElementById('send-wa');
  if (waLink) {
    waLink.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
}

function buildWAMessage() {
  const lines = [
    'Hi Allome! I\'d like to place a bespoke order. Here are my details:',
    '',
    `Design: ${state.designLabel || state.design}`,
    `Metal: ${state.metalLabel}`,
    `Gemstone: ${state.gemstoneLabel}`,
    `Engraving: ${state.engraving || 'None'}`,
    `Size/Length: ${state.size || 'To confirm'}`,
    `Occasion: ${state.occasion || '—'}`,
  ];

  if (state.notes) {
    lines.push(``, `Special Notes: ${state.notes}`);
  }

  lines.push('', 'Looking forward to hearing from you! 🙏');
  return lines.join('\n');
}


// ═══════════════════════════════════════════════════════
// STEP NAVIGATION
// ═══════════════════════════════════════════════════════

function goToStep(step) {
  // Hide all steps
  ['step-choose', 'step-personalise', 'step-preview'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      if (i + 1 === step) {
        el.removeAttribute('hidden');
        el.classList.add('is-active');
      } else {
        el.setAttribute('hidden', '');
        el.classList.remove('is-active');
      }
    }
  });

  // Update progress indicator
  updateProgress(step);
  state.step = step;

  // If going to step 3, build final preview
  if (step === 3) {
    buildFinalPreview();
  }

  // Update preview on step 2
  if (step === 2) {
    updatePreview();
  }

  // Scroll to top of configurator
  const configurator = document.getElementById('configurator');
  if (configurator) {
    configurator.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateProgress(step) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`progress-${i}`);
    const line = document.getElementById(`progress-line-${i}`);
    if (!el) return;

    el.classList.remove('is-active', 'is-done');
    if (i < step) el.classList.add('is-done');
    if (i === step) el.classList.add('is-active');
    if (line && i < step) line.classList.add('is-done');
    if (line && i >= step) line.classList.remove('is-done');
  });

  // Update aria
  const progress = document.getElementById('bespoke-progress');
  if (progress) progress.setAttribute('aria-valuenow', step);
}

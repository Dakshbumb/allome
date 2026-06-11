/* ============================================================
   ALLOME — WhatsApp Context-Aware Integration
   Pre-fills message based on which collection/page user viewed
   ============================================================ */

'use strict';

const WA_NUMBER = '919999999999'; // Replace with actual number
const WA_BASE   = `https://wa.me/${WA_NUMBER}`;

// Context detection: last collection card hovered
let lastHoveredCollection = null;

const collectionMessages = {
  'card-rings':     'Hi Allome, I\'m interested in the Rings collection.',
  'card-necklaces': 'Hi Allome, I\'m interested in the Necklaces collection.',
  'card-bracelets': 'Hi Allome, I\'m interested in the Bracelets collection.',
  'card-bespoke':   'Hi Allome, I\'d like to create a Bespoke piece.',
  'card-gifts':     'Hi Allome, I\'m looking for a jewellery gift.',
};

const defaultMessage = 'Hi Allome, I\'m interested in a bespoke piece.';

window.addEventListener('DOMContentLoaded', () => {
  // Track which collection was last viewed
  Object.keys(collectionMessages).forEach(cardId => {
    const card = document.getElementById(cardId);
    if (card) {
      card.addEventListener('mouseenter', () => {
        lastHoveredCollection = cardId;
      });
    }
  });

  // Update all WA links dynamically
  function getWALink() {
    const msg = lastHoveredCollection
      ? collectionMessages[lastHoveredCollection]
      : defaultMessage;
    return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
  }

  // Apply to floating button
  const floatBtn = document.querySelector('.whatsapp-float__btn');
  if (floatBtn) {
    floatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(getWALink(), '_blank', 'noopener,noreferrer');
    });
  }

  // Apply to nav WA link
  const navWA = document.getElementById('nav-wa');
  if (navWA) {
    navWA.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(getWALink(), '_blank', 'noopener,noreferrer');
    });
  }

  // Bespoke CTA → bespoke message
  const bespokeCTA = document.getElementById('bespoke-cta');
  if (bespokeCTA) {
    bespokeCTA.addEventListener('click', (e) => {
      // If it links to bespoke.html, let it navigate
      if (bespokeCTA.href && bespokeCTA.href.includes('bespoke.html')) return;
      e.preventDefault();
      const msg = 'Hi Allome, I\'d like to start designing a bespoke piece.';
      window.open(`${WA_BASE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    });
  }
});

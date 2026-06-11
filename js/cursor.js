/* ============================================================
   ALLOME — Custom Cursor
   Cream dot + ring that follows mouse, enlarges on image hover
   Uses idle-pause: RAF loop stops when mouse is stationary
   ============================================================ */

'use strict';

// Don't run on touch devices
if (!('ontouchstart' in window) && window.matchMedia('(hover: hover)').matches) {
  initCursor();
}

function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  // Current and target positions
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let dotX   = -100, dotY   = -100;

  // Idle-pause: only run RAF when mouse is active
  let rafId = null;
  let isAnimating = false;

  function startRAF() {
    if (isAnimating) return;
    isAnimating = true;
    rafId = requestAnimationFrame(animateCursor);
  }

  // Track mouse position — restart loop on movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    startRAF();
  });

  // Cursor lerp animation — auto-pauses when settled
  function animateCursor() {
    // Dot follows immediately (sharp)
    dotX  += (mouseX - dotX)  * 0.95;
    dotY  += (mouseY - dotY)  * 0.95;

    // Ring lags behind (smooth)
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    dot.style.transform  = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    // Check if ring has settled close enough to target (within 0.5px)
    const dx = Math.abs(mouseX - ringX);
    const dy = Math.abs(mouseY - ringY);
    if (dx < 0.5 && dy < 0.5) {
      // Settled — pause the loop until next mousemove
      isAnimating = false;
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(animateCursor);
  }

  // ─── Hover detection ───

  // Image hover: expand cursor
  const imageEls = document.querySelectorAll(
    '.collection-card__image-wrap, .editorial__item, .instagram__tile, .hero__media'
  );

  imageEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering-image'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering-image'));
  });

  // Link/button hover: expand ring
  const linkEls = document.querySelectorAll('a, button, .nav__link, .btn-outline');

  linkEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!cursor.classList.contains('is-hovering-image')) {
        cursor.classList.add('is-hovering-link');
      }
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering-link'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

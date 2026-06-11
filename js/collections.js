/* ============================================================
   ALLOME — Collections Horizontal Scroll
   Desktop: GSAP ScrollTrigger pinned horizontal scroll
   Mobile: Native snap scroll (already handled in CSS)
   ============================================================ */

'use strict';

const prefersReducedMotionColl = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileColl = window.innerWidth <= 1023;

window.addEventListener('load', () => {
  setTimeout(initCollections, 200);
});

function initCollections() {
  if (isMobileColl) return; // Mobile uses CSS snap scroll
  if (prefersReducedMotionColl) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    fallbackCollectionsFade();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const track = document.getElementById('collections-track');
  const cards = track ? track.querySelectorAll('.collection-card') : [];

  if (!cards.length || !track) return;

  // Cards should animate in as user scrolls, staggered from the right
  const section = document.querySelector('.collections');
  if (!section) return;

  // Animate cards in on section enter (staggered, not horizontal-pinned)
  // Using a simpler but elegant reveal approach
  gsap.fromTo(cards, {
    opacity: 0,
    x: 60,
    filter: 'blur(4px)',
  }, {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
    }
  });
}


// ─── Fallback: simple fade-in for cards (no GSAP) ───

function fallbackCollectionsFade() {
  const cards = document.querySelectorAll('.collection-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const idx = Array.from(cards).indexOf(card);
        setTimeout(() => {
          card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateX(0)';
        }, idx * 100);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(40px)';
    observer.observe(card);
  });
}

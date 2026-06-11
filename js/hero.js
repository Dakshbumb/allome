/* ============================================================
   ALLOME — Hero Animations (Updated for Editorial Layout)
   GSAP timeline: loader → nav → title → subtitle → CTAs → scroll indicator
   Parallax effect: hero image on scroll
   ============================================================ */

'use strict';

// Access the shared reduced-motion flag from main.js
function prefRM() { return !!(window.allomePrefersRM ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

window.addEventListener('load', () => {
  setTimeout(initHero, 1500); // After page loader
});

function initHero() {
  if (typeof gsap === 'undefined') {
    revealHeroFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  runHeroTimeline();
  initHeroParallax();
}


// ─── Hero entrance timeline (editorial variant) ───

function runHeroTimeline() {
  // Editorial hero elements
  const isEditorial = document.querySelector('.hero--editorial');

  if (prefRM()) {
    const els = isEditorial
      ? ['#hero-title', '#hero-subtitle', '#hero-ctas', '#hero-scroll']
      : ['#hero-label', '#hero-line-1', '#hero-line-2', '#hero-rule', '#hero-cta', '#hero-scroll'];
    els.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      }
    });
    // Reveal editorial lines
    document.querySelectorAll('.hero__line--editorial').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const ruleLine = document.querySelector('.hero__rule-line');
    if (ruleLine) ruleLine.style.strokeDashoffset = '0';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (isEditorial) {
    // Editorial layout animation
    tl
      // 1. Nav
      .fromTo('#nav', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.6 }, 0)

      // 2. Hero image subtle scale
      .fromTo('#hero-img', { scale: 1.06 }, { scale: 1.03, duration: 2.0, ease: 'power2.out' }, 0)

      // 3. Headline
      .to('.hero__line--editorial', {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.15,
      }, 0.5)

      // 4. Subtitle
      .to('#hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.9,
      }, 1.0)

      // 5. CTA buttons
      .to('#hero-ctas', {
        opacity: 1,
        y: 0,
        duration: 0.7,
      }, 1.3)

      // 6. Scroll indicator
      .to('#hero-scroll', {
        opacity: 1,
        duration: 0.6,
      }, 1.8);
  } else {
    // Legacy dark hero layout
    tl
      .fromTo('#nav', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.6 }, 0)

      .to('#hero-label', {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, 0.4)

      .to('#hero-line-1', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
      }, 0.7)

      .to('#hero-line-2', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
      }, 0.95)

      .to('.hero__rule-line', {
        strokeDashoffset: 0,
        duration: 1.0,
        ease: 'power2.inOut',
      }, 1.2)

      .to('#hero-rule', {
        opacity: 1,
        duration: 0.4,
      }, 1.2)

      .to('#hero-cta', {
        opacity: 1,
        duration: 0.6,
      }, 1.6)

      .to('#hero-scroll', {
        opacity: 1,
        duration: 0.6,
      }, 1.8);
  }
}


// ─── Hero parallax on scroll ───

function initHeroParallax() {
  const heroImg = document.getElementById('hero-img');
  const heroSection = document.getElementById('hero');

  if (!heroImg || !heroSection || prefRM()) return;

  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  const isEditorial = document.querySelector('.hero--editorial');

  // Lighter parallax for editorial (image is positioned right)
  gsap.to(heroImg, {
    yPercent: isEditorial ? 10 : 18,
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // Content parallax for editorial
  const heroContent = document.querySelector('.hero__content--editorial, .hero__content');
  if (heroContent && !isEditorial) {
    gsap.to(heroContent, {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }
}


// ─── CSS-only fallback (no GSAP) ───

function revealHeroFallback() {
  const isEditorial = document.querySelector('.hero--editorial');

  const elements = isEditorial ? [
    { sel: '.hero__line--editorial', delay: 600 },
    { sel: '#hero-subtitle',         delay: 900 },
    { sel: '#hero-ctas',             delay: 1200 },
    { sel: '#hero-scroll',           delay: 1800 },
  ] : [
    { sel: '#hero-label',   delay: 400 },
    { sel: '#hero-line-1',  delay: 700 },
    { sel: '#hero-line-2',  delay: 950 },
    { sel: '#hero-rule',    delay: 1200 },
    { sel: '#hero-cta',     delay: 1600 },
    { sel: '#hero-scroll',  delay: 1800 },
  ];

  elements.forEach(({ sel, delay }) => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0px)';
      }, delay);
    });
  });

  // SVG rule (legacy)
  setTimeout(() => {
    const ruleLine = document.querySelector('.hero__rule-line');
    if (ruleLine) {
      ruleLine.style.transition = 'stroke-dashoffset 1s ease';
      ruleLine.style.strokeDashoffset = '0';
    }
  }, 1200);
}

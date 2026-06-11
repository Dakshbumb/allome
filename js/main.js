/* ============================================================
   ALLOME — Main JS
   Lenis smooth scroll + GSAP ScrollTrigger + Intersection Observer
   Nav, Philosophy, Bespoke, Identity, Testimonials, Newsletter
   ============================================================ */

'use strict';

// ─── Detect reduced motion preference (shared with hero.js via window.allomePrefersRM) ───
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.allomePrefersRM = prefersReducedMotion;

// ─── Detect mobile ───
const isMobile = window.innerWidth <= 1023;
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// ─── Detect touchpad vs mouse ───
// Touchpads send WheelEvent with deltaMode=0 (pixel-precise, fractional deltas)
// Mice send deltaMode=1 (line) or 2 (page). We sniff on first wheel event.
let isTouchpad = false;
let touchpadDetected = false;
window.addEventListener('wheel', (e) => {
  if (touchpadDetected) return;
  touchpadDetected = true;
  // Pixel-mode + non-integer delta = touchpad with momentum
  if (e.deltaMode === 0 && !Number.isInteger(e.deltaY)) {
    isTouchpad = true;
    // Destroy Lenis if it was already started
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
  }
}, { passive: true, once: false });

// ─── Wait for all scripts to load ───
window.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
});

window.addEventListener('load', () => {
  setTimeout(initAll, 100);
});

// ═══════════════════════════════════════════════════════
// PAGE LOADER
// ═══════════════════════════════════════════════════════

function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // Hide after 1.2s (enough for fonts + assets to settle)
  setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('page-loading');
  }, 1400);
}


// ═══════════════════════════════════════════════════════
// INIT ALL
// ═══════════════════════════════════════════════════════

function initAll() {
  initLenis();
  initNav();
  initScrollReveal();
  initPhilosophyChars();
  initBespokeCards();
  initIdentityBlock();
  initTestimonials();
  initNewsletter();
  initWhatsAppFloat();
}


// ═══════════════════════════════════════════════════════
// LENIS SMOOTH SCROLL
// ═══════════════════════════════════════════════════════

let lenis;

function initLenis() {
  // Skip Lenis on touch devices and reduced-motion users — native scroll is better
  if (prefersReducedMotion || isTouchDevice) return;

  if (typeof Lenis === 'undefined') {
    console.warn('Allome: Lenis not loaded, falling back to native scroll');
    return;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
    wheelMultiplier: 1.0,
    touchMultiplier: 0,   // Disable touch (native momentum is better)
    smoothTouch: false,
    infinite: false,
  });

  // Single RAF loop — if GSAP is available use its ticker (syncs with animations)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}


// ═══════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════

function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('nav-overlay');
  const overlayLinks = overlay ? overlay.querySelectorAll('.nav__overlay-link') : [];

  if (!nav) return;

  // Scroll state
  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Mobile hamburger
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.contains('is-open');

      if (isOpen) {
        overlay.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      } else {
        overlay.classList.add('is-open');
        hamburger.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      }
    });

    // Close on overlay link click
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        overlay.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


// ═══════════════════════════════════════════════════════
// INTERSECTION OBSERVER — SCROLL REVEALS
// ═══════════════════════════════════════════════════════

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade');
  if (!revealEls.length) return;

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger items in the same section
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, parseFloat(delay) * 1000);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach((el, i) => {
    // Auto-stagger siblings in same parent
    if (!el.dataset.delay) {
      const siblings = Array.from(el.parentElement.querySelectorAll('.reveal-up, .reveal-fade'));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.dataset.delay = (idx * 0.1).toString();
    }
    observer.observe(el);
  });
}


// ═══════════════════════════════════════════════════════
// PHILOSOPHY — CHARACTER STAGGER ANIMATION
// ═══════════════════════════════════════════════════════

function initPhilosophyChars() {
  const chars = document.querySelectorAll('.philosophy__char');
  if (!chars.length) return;

  if (prefersReducedMotion) {
    chars.forEach(c => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (typeof gsap !== 'undefined') {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.04,
        });
      } else {
        chars.forEach((char, i) => {
          setTimeout(() => {
            char.style.opacity = '1';
            char.style.transform = 'translateY(0)';
            char.style.transition = 'opacity 0.4s, transform 0.4s';
          }, i * 40);
        });
      }
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const section = document.getElementById('philosophy');
  if (section) observer.observe(section);
}


// ═══════════════════════════════════════════════════════
// BESPOKE — STEP CARD REVEALS
// ═══════════════════════════════════════════════════════

function initBespokeCards() {
  const cards = document.querySelectorAll('.step-card');
  if (!cards.length) return;

  if (prefersReducedMotion) {
    cards.forEach(c => c.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const idx = Array.from(cards).indexOf(card);
        setTimeout(() => {
          card.classList.add('is-visible');
        }, idx * 150);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
}


// ═══════════════════════════════════════════════════════
// IDENTITY BLOCK — SVG DRAW + WORDMARK
// ═══════════════════════════════════════════════════════

function initIdentityBlock() {
  const section = document.getElementById('identity');
  if (!section) return;

  if (prefersReducedMotion) {
    section.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      section.classList.add('is-visible');
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(section);
}


// ═══════════════════════════════════════════════════════
// EDITORIAL GRID — STAGGERED REVEAL
// ═══════════════════════════════════════════════════════

(function initEditorialGrid() {
  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.editorial__item');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach(i => i.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const idx = Array.from(items).indexOf(item);
          setTimeout(() => {
            item.classList.add('is-visible');
          }, idx * 80);
          observer.unobserve(item);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
  });
})();


// ═══════════════════════════════════════════════════════
// TESTIMONIALS — AUTO-ROTATE SLIDER
// ═══════════════════════════════════════════════════════

function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.testimonials__dot');
  if (!testimonials.length) return;

  let current = 0;
  let autoTimer;

  function goTo(index) {
    // Hide current
    testimonials[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    // Show next
    current = index;
    testimonials[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function next() {
    goTo((current + 1) % testimonials.length);
  }

  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  // Start auto rotation
  startAuto();

  // Pause on hover
  const slider = document.getElementById('testimonials-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
  }
}


// ═══════════════════════════════════════════════════════
// NEWSLETTER — FORM HANDLING
// ═══════════════════════════════════════════════════════

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter__input');
    const btn = form.querySelector('.newsletter__submit');

    if (!input.value) return;

    // Success state
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    input.value = 'You\'re on the list. ✦';
    input.disabled = true;
    btn.disabled = true;

    // Brief animation on submit
    form.style.borderBottomColor = 'var(--allome-gold)';
  });
}


// ═══════════════════════════════════════════════════════
// WHATSAPP FLOAT — DELAYED APPEARANCE
// ═══════════════════════════════════════════════════════

function initWhatsAppFloat() {
  const btn = document.getElementById('wa-float');
  if (!btn) return;

  setTimeout(() => {
    btn.classList.add('is-visible');
  }, 3000);

  // Hide on footer hover (footer has its own CTA)
  const footer = document.getElementById('footer');
  if (footer) {
    const footerObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
      }
    }, { threshold: 0.3 });
    footerObserver.observe(footer);
  }
}

/**
 * ============================================================
 * RANA ABDULLAH NASEEM — PREMIUM PORTFOLIO
 * script.js — Vanilla JavaScript
 * ============================================================
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
   ============================================================ */

/**
 * Debounce: limits function firing on rapid events (resize, scroll)
 */
function debounce(fn, wait = 16) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Select a single DOM element (throws if missing in dev mode)
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select all DOM elements
 */
function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/* ============================================================
   2. NAVBAR — Transparent → frosted glass on scroll
   ============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run immediately in case page loads mid-scroll
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   3. MOBILE MENU — Hamburger toggle
   ============================================================ */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.mobile-link, .mobile-cta');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on any link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ============================================================
   4. SMOOTH SCROLL — Intercept anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    // Offset for sticky navbar height
    const navHeight = $('#navbar')?.offsetHeight ?? 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ============================================================
   5. TYPEWRITER ANIMATION — Hero role titles
   ============================================================ */
(function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const roles = [
    'Video Editing',
    'Motion Graphics',
    'Content Creation',
    'Color Grading',
    'Logo Animation',
    'Visual Storytelling',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseFrames = 0;

  const PAUSE_AFTER_WRITE  = 65; // frames to pause at full word
  const PAUSE_AFTER_DELETE = 20; // frames to pause before next word
  const WRITE_SPEED        = 60; // ms per character
  const DELETE_SPEED       = 35; // ms per character (delete faster)

  function tick() {
    const current = roles[roleIndex];

    if (pauseFrames > 0) {
      pauseFrames--;
      setTimeout(tick, 60);
      return;
    }

    if (!isDeleting) {
      // Writing
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Finished writing — pause then delete
        isDeleting = true;
        pauseFrames = PAUSE_AFTER_WRITE;
        setTimeout(tick, WRITE_SPEED);
      } else {
        setTimeout(tick, WRITE_SPEED);
      }
    } else {
      // Deleting
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next word
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        pauseFrames = PAUSE_AFTER_DELETE;
        setTimeout(tick, DELETE_SPEED);
      } else {
        setTimeout(tick, DELETE_SPEED);
      }
    }
  }

  // Small initial delay so it starts after hero animation
  setTimeout(tick, 1200);
})();

/* ============================================================
   6. HERO STATS — Reveal stagger
   ============================================================ */
(function initHeroReveal() {
  // Apply animation-delay from data attributes
  $$('.reveal-up[data-delay]').forEach(el => {
    const delay = parseInt(el.dataset.delay, 10) || 0;
    el.style.animationDelay = `${delay}ms`;
  });
})();

/* ============================================================
   7. INTERSECTION OBSERVER — Scroll reveal for sections
   ============================================================ */
(function initScrollReveal() {
  const elements = $$('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.dataset.delay, 10) || 0;

        // Apply delay and show
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);

        // Unobserve once shown (no re-trigger)
        observer.unobserve(el);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   8. ANIMATED COUNTERS — Stat numbers count up
   ============================================================ */
(function initCounters() {
  const counters = $$('.counter, .stat-num[data-target]');
  if (!counters.length) return;

  /**
   * Animates a number from 0 to target over ~1.5s
   */
  function animateCounter(el, target) {
    const duration = 1500;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value  = Math.floor(eased * target);

      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) {
          animateCounter(el, target);
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => {
    if (el.dataset.target) observer.observe(el);
  });
})();

/* ============================================================
   9. SKILL BAR ANIMATIONS — Animate on scroll into view
   ============================================================ */
(function initSkillBars() {
  const bars = $$('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const bar   = entry.target;
        const width = bar.dataset.width || 0;

        // Small stagger based on position
        const index = bars.indexOf(bar);
        setTimeout(() => {
          bar.style.width = `${width}%`;
        }, index * 100);

        observer.unobserve(bar);
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => observer.observe(bar));
})();

/* ============================================================
   10. PORTFOLIO FILTER — Category filtering with animation
   ============================================================ */
(function initPortfolioFilter() {
  const buttons   = $$('.filter-btn');
  const cards     = $$('.project-card');

  if (!buttons.length || !cards.length) return;

  function filterCards(filter) {
    cards.forEach((card, i) => {
      const category = card.dataset.category;
      const visible  = filter === 'all' || category === filter;

      if (visible) {
        // Stagger show animation
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity  = '1';
          card.style.transform = 'translateY(0)';
        }, i * 60);
      } else {
        card.style.transition = 'opacity 0.25s ease';
        card.style.opacity = '0';
        setTimeout(() => card.classList.add('hidden'), 250);
      }
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      filterCards(btn.dataset.filter);
    });
  });
})();

/* ============================================================
   11. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const onScroll = debounce(() => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   12. ACTIVE NAV LINK — Highlight current section
   ============================================================ */
(function initActiveNavLinks() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const OFFSET = 100; // pixels from top to consider a section "active"

  function updateActive() {
    const scrollY = window.scrollY;

    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop - OFFSET;
      if (scrollY >= top) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === currentId
        ? 'var(--text)'
        : '';
    });
  }

  window.addEventListener('scroll', debounce(updateActive, 50), { passive: true });
  updateActive();
})();

/* ============================================================
   13. VIDEO SECTION — Handle missing video gracefully
   ============================================================ */
(function initShowreel() {
  const video       = $('.showreel-video');
  const placeholder = $('.showreel-placeholder');

  if (!video || !placeholder) return;

  // If the video source is empty or fails to load, keep placeholder visible
  if (!video.src || video.src === window.location.href) {
    placeholder.style.display = 'flex';
    return;
  }

  video.addEventListener('canplay', () => {
    placeholder.style.display = 'none';
  });

  video.addEventListener('error', () => {
    placeholder.style.display = 'flex';
  });
})();

/* ============================================================
   14. CURSOR GLOW TRAIL (subtle, desktop only)
   ============================================================ */
(function initCursorGlow() {
  return; // Superseded by the lightweight premium cursor below.
  // Only on desktop (no touch), don't affect mobile performance
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    z-index: 9999;
    will-change: transform;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let rafId;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateGlow() {
    glowX = lerp(glowX, mouseX, 0.08);
    glowY = lerp(glowY, mouseY, 0.08);
    glow.style.left = `${glowX}px`;
    glow.style.top  = `${glowY}px`;
    rafId = requestAnimationFrame(animateGlow);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  animateGlow();
})();

/* ============================================================
   15. PREMIUM CURSOR — precise dot with a softly trailing ring
   ============================================================ */
(function initPremiumCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot = $('.custom-cursor');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  document.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseover', event => {
    ring.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button, .project-card')));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderRing);
  }

  renderRing();
})();

/* ============================================================
   16. PROJECT CARD DEPTH — subtle pointer-responsive lighting
   ============================================================ */
(function initProjectDepth() {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;

  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
      const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   17. INIT — Run after DOM ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Log confirmation (can be removed in production)
  console.log('%c✦ Rana Abdullah Naseem — Portfolio Loaded', 'color: #A855F7; font-weight: bold; font-size: 14px;');
});

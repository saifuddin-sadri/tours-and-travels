/* ════════════════════════════════════════════════════
   GSAP-ANIMATIONS.JS — ScrollTrigger & GSAP setup
   ════════════════════════════════════════════════════ */

// GSAP loaded via CDN — use window.gsap
const gsap   = window.gsap;
const ST     = window.ScrollTrigger;
const isMobile = () => window.innerWidth <= 767;

export function initAnimations() {
  if (!gsap) { console.warn('GSAP not loaded'); return; }
  if (ST) gsap.registerPlugin(ST);

  initNavbar();
  initHeroZoom();
  initSectionReveal();
  initCountUp();
  initScrollTop();
}

/* ── Navbar scroll effect ─────────────────────────────── */
export function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const toggle = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  // Hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const mobile    = document.querySelector('.nav-mobile');
  if (hamburger && mobile) {
    hamburger.addEventListener('click', () => {
      mobile.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const isOpen = mobile.classList.contains('open');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // Active link
  const links = document.querySelectorAll('.nav-link');
  const path  = window.location.pathname;
  links.forEach(l => {
    const href = l.getAttribute('href') || '';
    if (path === href || (path.startsWith(href) && href !== '/')) {
      l.classList.add('active');
    }
  });
}

/* ── Hero parallax zoom ───────────────────────────────── */
export function initHeroZoom() {
  if (isMobile()) return;
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg || !ST) return;

  gsap.to(heroBg, {
    yPercent: 25,
    scale: 1.15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

/* ── Section fade/slide reveal ────────────────────────── */
export function initSectionReveal() {
  if (!ST) return;

  // Fade up elements
  document.querySelectorAll('.anim-fade-up').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      delay: el.dataset.delay ? parseFloat(el.dataset.delay) : i * 0.05,
    });
  });

  // Fade left
  document.querySelectorAll('.anim-fade-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Fade right
  document.querySelectorAll('.anim-fade-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Scale up
  document.querySelectorAll('.anim-scale-up').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, scale: 1,
      duration: 0.65, ease: 'back.out(1.5)',
      delay: i * 0.06,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  // Stagger card groups
  document.querySelectorAll('.stagger-group').forEach(group => {
    const children = group.children;
    gsap.from(children, {
      opacity: 0, y: 50,
      duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none none' },
    });
  });
}

/* ── Count-up animation ───────────────────────────────── */
export function initCountUp() {
  if (!ST) return;

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    let counted = false;

    ST.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        if (counted) return;
        counted = true;
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val).toLocaleString() + suffix;
          },
        });
      },
    });
  });
}

/* ── Scroll-to-top button ─────────────────────────────── */
export function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Toast notification ───────────────────────────────── */
export function showToast(message, type = 'info', duration = 4000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

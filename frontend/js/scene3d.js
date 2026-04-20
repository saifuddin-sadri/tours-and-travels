/* ══════════════════════════════════════════════════════
   SCENE3D.JS — 3D Cinematic Hero + All Page Logic
   Three.js particles + floating cards + GSAP villa zoom
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const THREE = window.THREE;

  // ── DOM refs ────────────────────────────────────────
  const canvas      = document.getElementById('three-canvas');
  const villaLayer  = document.getElementById('villa-layer');
  const lakeLayer   = document.getElementById('lake-layer');
  const archOverlay = document.getElementById('arch-overlay');
  const heroText    = document.getElementById('hero-text');
  const scrollHint  = document.querySelector('.scroll-hint');
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navMobile   = document.getElementById('navMobile');

  // ══════════════════════════════════════════════════
  // 1. THREE.JS SCENE — Particles + Floating Cards
  // ══════════════════════════════════════════════════
  let renderer, scene, camera, particles, clock;
  let floatingCards = [];
  let mouseX = 0, mouseY = 0;

  function initThree() {
    if (!THREE || !canvas) return;

    const W = window.innerWidth, H = window.innerHeight;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x011f18, 0.0006);

    // Camera
    camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 3000);
    camera.position.set(0, 0, 800);

    clock = new THREE.Clock();

    // ── Gold Particle Cloud ──────────────────────────
    const pCount = 2000;
    const pPositions = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 2400;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
      pPositions[i * 3 + 2] = Math.random() * 2000 - 1200;
      pSizes[i] = Math.random() * 3 + 1;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('size',     new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 2.5,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Floating Destination Image Cards ────────────
    const destinations = [
      { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=70', label: 'Goa' },
      { url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70', label: 'Manali' },
      { url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=70', label: 'Rajasthan' },
      { url: 'https://images.unsplash.com/photo-1566837474044-57bda4d32df4?w=400&q=70', label: 'Kashmir' },
      { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=70', label: 'Kerala' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70', label: 'Himalayas' },
    ];

    const texLoader = new THREE.TextureLoader();

    destinations.forEach((dest, i) => {
      const angle = (i / destinations.length) * Math.PI * 2;
      const radius = 380;

      texLoader.load(dest.url, (tex) => {
        // Card plane
        const geo = new THREE.PlaneGeometry(180, 120);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
        });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.7) * 150 + (Math.random() - 0.5) * 80,
          -200 + i * 80
        );
        mesh.rotation.y = -angle * 0.3;
        mesh.userData = { baseY: mesh.position.y, angle, i };

        // Glowing border frame
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(186, 126, 1));
        const borderMat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.6 });
        const border = new THREE.LineSegments(borderGeo, borderMat);
        mesh.add(border);

        floatingCards.push(mesh);
        scene.add(mesh);
      });
    });

    // ── Ambient light ────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 120;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -70;
    });

    window.addEventListener('resize', onResize);

    animateThree();
  }

  let cameraTargetZ = 800;

  function animateThree() {
    requestAnimationFrame(animateThree);
    if (!renderer) return;

    const t = clock.getElapsedTime();

    // Smooth camera follow
    camera.position.z += (cameraTargetZ - camera.position.z) * 0.04;
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, camera.position.z - 200);

    // Rotate & float cards
    floatingCards.forEach((card, i) => {
      card.position.y = card.userData.baseY + Math.sin(t * 0.5 + i * 1.1) * 22;
      card.rotation.y = Math.sin(t * 0.25 + i * 0.6) * 0.35;
      card.rotation.z = Math.sin(t * 0.2 + i * 0.8) * 0.06;
    });

    // Drift particles
    particles.rotation.y = t * 0.012;
    particles.rotation.x = Math.sin(t * 0.008) * 0.04;

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const W = window.innerWidth, H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }


  // ══════════════════════════════════════════════════
  // GSAP CORE ANIMATIONS
  // ══════════════════════════════════════════════════
  function initGSAPAnimations() {
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    if (prefersReducedMotion) return;

    // 1.1 Hero Parallax Zoom
    gsap.to('#scene', {
      scrollTrigger: { trigger: '#scene', start: 'top top', end: 'bottom top', scrub: 1 },
      scale: isMobile ? 1.05 : 1.15,
      ease: 'none'
    });

    // 1.2 Hero Text Staggered Entrance
    const tl = gsap.timeline();
    tl.from('.hero-badge', { duration: 1.2, opacity: 0, y: 30, ease: 'power2.out' }, 0.2)
      .from('.hero-title', { duration: 1, opacity: 0, y: 30, ease: 'power2.out' }, '-=0.8')
      .from('.hero-sub',   { duration: 1, opacity: 0, y: 30, ease: 'power2.out' }, '-=0.8')
      .from('.hero-btns',  { duration: 0.8, opacity: 0, y: 40, ease: 'back.out(1.7)' }, '-=0.6');

    // 1.4 CTA Button Hover Effect
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', function() { gsap.to(this, { duration: 0.3, scale: 1.08, ease: 'power2.out' }); });
      btn.addEventListener('mouseleave', function() { gsap.to(this, { duration: 0.3, scale: 1, ease: 'power2.out' }); });
    });

    // 2.1 Section Entry (Fade + Scale In)
    gsap.utils.toArray('.lake-section').forEach(section => {
      gsap.from(section, {
        scrollTrigger: { trigger: section, start: 'top 85%' },
        opacity: 0, y: 60, duration: 0.8, ease: 'power3.out'
      });
    });

    // 2.4 Count Up Numbers (Fixed textContent logic)
    gsap.utils.toArray('.stat-num').forEach(stat => {
      const dtCount = stat.getAttribute('data-count');
      if (dtCount) {
        const finalNum = parseInt(dtCount);
        const suffix = stat.getAttribute('data-suffix') || '';
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: stat.parentElement, start: 'top 80%' },
          val: finalNum, duration: 2, ease: 'power2.out',
          onUpdate: function() { stat.textContent = Math.floor(obj.val) + suffix; }
        });
      }
    });

    // 3.1 Services Slide In
    gsap.utils.toArray('.svc-card').forEach((card, index) => {
      const isEven = index % 2 === 0;
      gsap.from(card, {
        scrollTrigger: { trigger: '.services-grid', start: 'top 75%' },
        opacity: 0, x: isEven ? -100 : 100, duration: 0.8, ease: 'power3.out',
        delay: isMobile ? 0 : index * 0.15
      });
    });

    // 3.2 Service Icon Rotation & Pulse
    gsap.utils.toArray('.svc-icon').forEach(icon => {
      gsap.from(icon, {
        scrollTrigger: { trigger: icon.parentElement, start: 'top 80%' },
        opacity: 0, scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(1.5)'
      });
      gsap.to(icon, { duration: 2, scale: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.8 });
    });

    // 4.1 Stats Entrance
    gsap.utils.toArray('.stat-box').forEach((box, index) => {
      gsap.from(box, {
        scrollTrigger: { trigger: '.stats-grid', start: 'top 70%' },
        opacity: 0, scale: 0.8, y: 30, duration: 0.6, ease: 'back.out(1.2)', delay: isMobile ? 0 : index * 0.15
      });
    });

    // 5.1 Testimonials Continuous Marquee Scroll
    const tTrack = document.querySelector('.t-track');
    if (tTrack) {
      // Entrance animation for the whole container
      gsap.from('.testimonials-carousel', {
         scrollTrigger: { trigger: '#testimonials', start: 'top 75%' },
         opacity: 0, y: 40, rotation: -1, duration: 0.7, ease: 'back.out(1.1)'
      });

      // Infinite Marquee Loop moving left continuously
      // The track width needs to be scrolled by half its width, since the content is duplicated.
      gsap.to('.t-track', {
        xPercent: -50, // Move left by 50% of the total duplicated track width
        duration: 25, 
        ease: 'none',
        repeat: -1
      });
    }

    // 6.1 Contact Form Entrance
    gsap.from('.contact-grid', {
      scrollTrigger: { trigger: '#contact', start: 'top 80%' },
      opacity: 0, y: 80, duration: 1, ease: 'power3.out'
    });

    // 6.2 Form Input Focus
    document.querySelectorAll('.form-ctrl').forEach(field => {
      field.addEventListener('focus', function() {
        gsap.to(this, { duration: 0.3, scale: 1.02, borderColor: '#FFC107', boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.2)', ease: 'power2.out' });
      });
      field.addEventListener('blur', function() {
        gsap.to(this, { duration: 0.3, scale: 1, borderColor: 'rgba(255,255,255,.15)', boxShadow: 'none', ease: 'power2.out' });
      });
    });
  }


  // ══════════════════════════════════════════════════
  // 5. PACKAGE CARDS (3D Flip)
  // ══════════════════════════════════════════════════
  async function loadPackages() {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;

    try {
      const res  = await fetch('http://localhost:5000/api/packages/featured');
      const data = await res.json();
      const pkgs = data.data || [];

      if (!pkgs.length) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#64748b">No packages found. Make sure the server is running.</p>';
        return;
      }

      grid.innerHTML = pkgs.map(p => `
        <div class="flip-card">
          <div class="flip-inner">
            <div class="flip-front">
              <img src="${p.image}" alt="${p.title}"
                   loading="lazy"
                   onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=60'">
              <div class="gradient-fade" style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,10,30,.85) 100%);z-index:1"></div>
              <span class="flip-loc">📍 ${p.destination}</span>
              <span class="flip-rating">⭐ ${p.rating}</span>
              <div class="flip-front-body" style="position:relative;z-index:2">
                <div class="flip-name">${p.title}</div>
                <div style="display:flex;align-items:baseline;gap:8px">
                  <span class="flip-price">₹${(p.price||0).toLocaleString('en-IN')}</span>
                  <span class="flip-dur">· ${p.duration}</span>
                </div>
              </div>
            </div>
            <div class="flip-back">
              <div>
                <div class="back-title">${p.title}</div>
                <div class="back-dest">📍 ${p.destination} &nbsp;·&nbsp; ⏱ ${p.duration}</div>
                <p class="back-desc">${p.description}</p>
                <div class="back-includes">
                  ${(p.inclusions||[]).slice(0,3).map(i=>`<span class="back-pill">${i}</span>`).join('')}
                </div>
              </div>
              <div class="back-actions">
                <a href="/packages/${p.id}" class="btn btn-gold">Details</a>
                <button class="btn btn-wa" data-wa="${p.title}">💬 Enquire</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // WhatsApp buttons on cards
      grid.querySelectorAll('[data-wa]').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.wa;
          const msg  = encodeURIComponent(`Hi! I'm interested in the *${name}* package. Please share details.`);
          window.open(`https://wa.me/919876543210?text=${msg}`, '_blank', 'noopener');
        });
      });

      // 2.2 Package Card Staggered Entrance
      if (gsap && ST) {
        const isMobile = window.innerWidth < 768;
        gsap.utils.toArray('.flip-card').forEach((card, index) => {
          gsap.from(card, {
            scrollTrigger: { trigger: '#packages-grid', start: 'top 70%' },
            opacity: 0, y: 50, rotation: -2, duration: 0.6, ease: 'back.out(1.2)',
            delay: isMobile ? 0 : index * 0.12
          });

          // 2.3 Package Hover Effects (Image Zoom & Button Color)
          const img = card.querySelector('img');
          const btn = card.querySelector('.btn-gold');
          const price = card.querySelector('.flip-price');
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { duration: 0.3, y: -12, ease: 'power2.out' });
            gsap.to(img, { duration: 0.4, scale: 1.05, ease: 'power2.out' });
            gsap.to(btn, { duration: 0.3, backgroundColor: '#FFD700', ease: 'power1.out' });
            gsap.to(price, { duration: 0.3, color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)', ease: 'power1.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { duration: 0.3, y: 0, ease: 'power2.out' });
            gsap.to(img, { duration: 0.4, scale: 1, ease: 'power2.out' });
            gsap.to(btn, { duration: 0.3, backgroundColor: '', ease: 'power1.out' });
            gsap.to(price, { duration: 0.3, color: '#E6A800', textShadow: 'none', ease: 'power1.out' });
          });
        });
        
        // CRITICAL FIX: Refresh ScrollTrigger coordinates now that 
        // dynamically loaded DOM elements have altered the page height!
        setTimeout(() => {
          ST.refresh();
        }, 300);
      }

    } catch (err) {
      grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#64748b">Could not load packages — is the server running at port 5000?</p>';
    }
  }


  // ══════════════════════════════════════════════════
  // 6. CONTACT FORM
  // ══════════════════════════════════════════════════
  function initForm() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    // Set min date
    const dateEl = document.getElementById('inp-date');
    if (dateEl) dateEl.min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const btn = document.getElementById('submit-btn');
      btn.disabled   = true;
      btn.textContent = 'Sending…';

      const body = {
        name:                 document.getElementById('inp-name')?.value.trim(),
        email:                document.getElementById('inp-email')?.value.trim(),
        phone:                document.getElementById('inp-phone')?.value.trim(),
        preferredDestination: document.getElementById('inp-dest')?.value,
        travelDate:           document.getElementById('inp-date')?.value,
        message:              document.getElementById('inp-msg')?.value.trim() || '',
      };

      try {
        const res  = await fetch('http://localhost:5000/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Show success
        const s = document.createElement('div');
        s.className = 'form-success';
        s.innerHTML = `✅ Inquiry <strong>${data.inquiryId}</strong> received! We'll contact you within 24 hours.`;
        form.prepend(s);
        form.reset();
        showToast('Inquiry sent! 🎉 We\'ll be in touch soon.', 'success');
        setTimeout(() => s.remove(), 8000);
      } catch (err) {
        showToast('Failed to send. Please WhatsApp us directly.', 'error');
      } finally {
        btn.disabled    = false;
        btn.textContent = '📩 Send Inquiry';
      }
    });

    function validateForm() {
      let ok = true;
      form.querySelectorAll('.form-err').forEach(e => e.remove());
      form.querySelectorAll('[required]').forEach(el => {
        el.style.borderColor = '';
        const v = el.value.trim();
        if (!v) { setErr(el, 'Required'); ok = false; return; }
        if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr(el, 'Invalid email'); ok = false; }
        if (el.id === 'inp-phone' && !/^[6-9]\d{9}$/.test(v.replace(/\D/g,''))) { setErr(el, '10-digit Indian number'); ok = false; }
        if (el.id === 'inp-name' && v.length < 3) { setErr(el, 'Min 3 chars'); ok = false; }
      });
      return ok;
    }

    function setErr(el, msg) {
      el.style.borderColor = '#ef4444';
      const e = document.createElement('p');
      e.className = 'form-err';
      e.textContent = '⚠ ' + msg;
      el.closest('.form-group')?.appendChild(e);
    }
  }


  // ══════════════════════════════════════════════════
  // 7. NAVBAR + SCROLL TOP + TOAST
  // ══════════════════════════════════════════════════
  function initNavbar() {
    const update = () => navbar.classList.toggle('solid', window.scrollY > 60);
    update();
    window.addEventListener('scroll', update, { passive: true });

    hamburger?.addEventListener('click', () => navMobile?.classList.toggle('open'));
  }

  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function showToast(msg, type = 'info') {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4500);
  }


  // ══════════════════════════════════════════════════
  // 8. SMOOTH SCROLL for anchor links
  // ══════════════════════════════════════════════════
  function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elTop - 80, behavior: 'smooth' });
      });
    });
  }

  // ══════════════════════════════════════════════════
  // BOOT
  // ══════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initGSAPAnimations();
    loadPackages();
    initForm();
    initNavbar();
    initScrollTop();
    initSmoothLinks();
  });

})();

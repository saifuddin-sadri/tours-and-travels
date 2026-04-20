/* ════════════════════════════════════════════════════
   MAIN.JS — Page initialization & routing
   ════════════════════════════════════════════════════ */

import { initAnimations, initNavbar, initScrollTop, showToast } from './gsap-animations.js';
import { initContactForm, initWhatsAppButtons }                  from './form-handler.js';
import { fetchFeaturedPackages, fetchDestinations }              from './api-client.js';
import { renderPackageCards, renderSkeletons }                   from './package-renderer.js';

// ── Boot ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initWhatsAppButtons();
  initContactForm();
  populateDestinationDropdowns();

  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') initHomePage();
});

// ── Home Page ──────────────────────────────────────────
async function initHomePage() {
  const grid = document.getElementById('packages-grid');
  if (!grid) return;

  renderSkeletons(6);

  try {
    const res = await fetchFeaturedPackages();
    renderPackageCards(res.data || [], 'packages-grid');
    initWhatsAppButtons(); // re-init after render
  } catch {
    renderPackageCards([], 'packages-grid');
    showToast('Could not load packages. Make sure the server is running.', 'error');
  }
}

// ── Populate destination dropdowns ────────────────────
async function populateDestinationDropdowns() {
  const selects = document.querySelectorAll('.destination-select');
  if (!selects.length) return;

  try {
    const res = await fetchDestinations();
    const destinations = res.data || [];
    selects.forEach(sel => {
      const currentVal = sel.value;
      const options = destinations.map(d =>
        `<option value="${d.id}">${d.name} (${d.packageCount})</option>`
      ).join('');
      sel.innerHTML = sel.querySelector('[value=""]')?.outerHTML || '<option value="">All Destinations</option>';
      sel.innerHTML += options;
      if (currentVal) sel.value = currentVal;
    });
  } catch (e) {
    // Silently fail — static options are fine fallback
  }
}

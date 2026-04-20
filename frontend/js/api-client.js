/* ════════════════════════════════════════════════════
   API-CLIENT.JS — Fetch wrapper for backend API
   ════════════════════════════════════════════════════ */

const API_BASE = '/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export async function fetchPackages(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiFetch(`/packages?${params}`);
}

export async function fetchFeaturedPackages() {
  return apiFetch('/packages/featured');
}

export async function fetchPackageById(id) {
  return apiFetch(`/packages/${id}`);
}

export async function fetchDestinations() {
  return apiFetch('/destinations');
}

export async function submitInquiry(data) {
  return apiFetch('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWhatsAppUrl(packageName, name = '') {
  try {
    const res = await apiFetch('/inquiries/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ packageName, name }),
    });
    return res.whatsappUrl;
  } catch {
    const phone = '919876543210';
    const msg = `Hi! I'm interested in the ${packageName} package. Please share more details.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }
}

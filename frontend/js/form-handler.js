/* ════════════════════════════════════════════════════
   FORM-HANDLER.JS — Form validation & submission
   ════════════════════════════════════════════════════ */

import { submitInquiry, getWhatsAppUrl } from './api-client.js';
import { showToast } from './gsap-animations.js';

export function initContactForm(formSelector = '#inquiry-form') {
  const form = document.querySelector(formSelector);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.classList.add('btn-loading');
    btn.disabled = true;

    const data = {
      name:                 form.querySelector('#inp-name')?.value?.trim(),
      email:                form.querySelector('#inp-email')?.value?.trim(),
      phone:                form.querySelector('#inp-phone')?.value?.trim(),
      preferredDestination: form.querySelector('#inp-destination')?.value,
      travelDate:           form.querySelector('#inp-date')?.value,
      message:              form.querySelector('#inp-message')?.value?.trim() || '',
      source: 'website',
    };

    try {
      const res = await submitInquiry(data);
      showSuccessMessage(form, res.inquiryId);
      form.reset();
      showToast('Inquiry sent successfully! We\'ll contact you within 24 hours. 🎉', 'success');
    } catch (err) {
      showToast('Failed to send. Please try again or WhatsApp us directly.', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  });

  // Live validation
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      clearError(field);
    });
  });

  // Set min date to today
  const dateInput = form.querySelector('#inp-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}

function validateForm(form) {
  let valid = true;
  const fields = form.querySelectorAll('[required]');
  fields.forEach(f => { if (!validateField(f)) valid = false; });
  return valid;
}

function validateField(field) {
  const val = field.value.trim();

  // Required
  if (field.required && !val) {
    setError(field, 'This field is required.');
    return false;
  }

  // Email
  if (field.type === 'email' && val) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError(field, 'Please enter a valid email address.');
      return false;
    }
  }

  // Phone
  if (field.id === 'inp-phone' && val) {
    const digits = val.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError(field, 'Enter a valid 10-digit Indian mobile number.');
      return false;
    }
  }

  // Name length
  if (field.id === 'inp-name' && val && val.length < 3) {
    setError(field, 'Name must be at least 3 characters.');
    return false;
  }

  clearError(field);
  return true;
}

function setError(field, message) {
  clearError(field);
  field.classList.add('error');
  const err = document.createElement('p');
  err.className = 'form-error';
  err.innerHTML = `⚠ ${message}`;
  field.closest('.form-group')?.appendChild(err);
}

function clearError(field) {
  field.classList.remove('error');
  field.closest('.form-group')?.querySelector('.form-error')?.remove();
}

function showSuccessMessage(form, inquiryId) {
  const existing = form.querySelector('.form-success');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.innerHTML = `✅ Thank you! Your inquiry <strong>${inquiryId || ''}</strong> is received. We'll contact you within 24 hours.`;
  form.prepend(msg);
  setTimeout(() => msg.remove(), 8000);
}

export async function initWhatsAppButtons() {
  document.querySelectorAll('[data-whatsapp]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pkgName = btn.dataset.whatsapp || 'travel package';
      const url     = await getWhatsAppUrl(pkgName);
      window.open(url, '_blank', 'noopener');
    });
  });
}

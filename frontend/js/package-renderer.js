/* ════════════════════════════════════════════════════
   PACKAGE-RENDERER.JS — Dynamic package rendering
   ════════════════════════════════════════════════════ */

export function renderPackageCards(packages, containerId = 'packages-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!packages || packages.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <h3 style="color:var(--color-primary);margin-bottom:8px;">No packages found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>`;
    return;
  }

  container.innerHTML = packages.map(pkg => createPackageCard(pkg)).join('');

  // Observe cards for animations
  if ('IntersectionObserver' in window) {
    const cards = container.querySelectorAll('.package-card');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      obs.observe(card);
    });
  }
}

function createPackageCard(pkg) {
  const stars = renderStars(pkg.rating);
  const inclusions = (pkg.inclusions || []).slice(0, 3).map(i => `<span class="pill">${i}</span>`).join('');

  return `
    <div class="package-card">
      <div class="package-card-img">
        <img src="${pkg.image}" alt="${pkg.title}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=60'">
        <div class="gradient-overlay"></div>
        <span class="location-badge">📍 ${pkg.destination}</span>
        ${pkg.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
        <div class="rating-overlay">
          <span class="star">★</span>
          <span>${pkg.rating}</span>
          <span style="opacity:0.6">(${pkg.reviewCount})</span>
        </div>
      </div>
      <div class="package-card-body">
        <h3>${pkg.title}</h3>
        <div class="package-price-row">
          <span class="package-price">₹${(pkg.price || 0).toLocaleString('en-IN')}</span>
          <span class="package-price-label">/ person</span>
          <span class="package-duration">${pkg.duration}</span>
        </div>
        <p>${pkg.description}</p>
        <div class="package-pills">${inclusions}</div>
        <div class="package-card-actions">
          <a href="/packages/${pkg.id}" class="btn btn-dark btn-sm">View Details</a>
          <button class="btn btn-outline btn-sm" data-whatsapp="${pkg.title}">📱 Enquire</button>
        </div>
      </div>
    </div>`;
}

export function renderStars(rating = 0) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export function renderSkeletons(count = 6, containerId = 'packages-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text w-60"></div>
        <div class="skeleton skeleton-text w-80"></div>
        <div class="skeleton skeleton-text w-40"></div>
      </div>
    </div>`).join('');
}

export function renderPackageDetail(pkg) {
  // Update page title
  document.title = `${pkg.title} | TravelIndia Tours`;

  // Hero
  const heroImg = document.getElementById('detail-hero-img');
  if (heroImg) heroImg.src = pkg.image;
  const heroTitle = document.getElementById('detail-title');
  if (heroTitle) heroTitle.textContent = pkg.title;

  const heroRating = document.getElementById('detail-rating');
  if (heroRating) heroRating.innerHTML = `
    <span class="stars">${renderStars(pkg.rating)}</span>
    <span>${pkg.rating}/5 (${pkg.reviewCount} reviews)</span>`;

  const heroMeta = document.getElementById('detail-meta');
  if (heroMeta) heroMeta.innerHTML = `
    <div class="detail-meta-item">📍 ${pkg.destination}</div>
    <div class="detail-meta-item">⏱ ${pkg.duration}</div>
    <div class="detail-meta-item">👥 ${pkg.groupSize}</div>
    <div class="detail-meta-item">📅 Best: ${pkg.bestTimeToVisit}</div>`;

  // Booking card
  const bookingPrice = document.getElementById('booking-price');
  if (bookingPrice) bookingPrice.textContent = `₹${(pkg.price).toLocaleString('en-IN')}`;
  const bookingDuration = document.getElementById('booking-duration');
  if (bookingDuration) bookingDuration.textContent = pkg.duration;
  const bookingGroup = document.getElementById('booking-group');
  if (bookingGroup) bookingGroup.textContent = pkg.groupSize;
  const bookingSpots = document.getElementById('booking-spots');
  if (bookingSpots) bookingSpots.innerHTML = `<span class="spots-badge">🔥 Only ${pkg.spotsAvailable} left!</span>`;

  // Description
  const descEl = document.getElementById('detail-description');
  if (descEl) descEl.textContent = pkg.detailedDescription || pkg.description;

  // Itinerary
  const itin = document.getElementById('detail-itinerary');
  if (itin && pkg.itinerary) {
    itin.innerHTML = pkg.itinerary.map(day => `
      <div class="itinerary-item anim-fade-up">
        <div class="itinerary-marker">D${day.day}</div>
        <div class="itinerary-content">
          <h4>Day ${day.day} — ${day.title}</h4>
          <p>${day.description}</p>
          <div class="itinerary-meta">
            ${day.meals ? `<span>🍽️ ${day.meals}</span>` : ''}
            ${day.hotel && day.hotel !== '-' ? `<span>🏨 ${day.hotel}</span>` : ''}
          </div>
        </div>
      </div>`).join('');
  }

  // Inclusions
  const inclEl = document.getElementById('detail-inclusions');
  if (inclEl && pkg.inclusions) {
    inclEl.innerHTML = pkg.inclusions.map(i => `
      <div class="inc-exc-item"><span style="color:var(--color-success);font-size:18px">✅</span> ${i}</div>`).join('');
  }

  // Exclusions
  const exclEl = document.getElementById('detail-exclusions');
  if (exclEl && pkg.exclusions) {
    exclEl.innerHTML = pkg.exclusions.map(e => `
      <div class="inc-exc-item"><span style="color:var(--color-error);font-size:18px">❌</span> ${e}</div>`).join('');
  }

  // Gallery
  const gallery = document.getElementById('detail-gallery');
  if (gallery && pkg.gallery?.length) {
    const imgs = [pkg.image, ...pkg.gallery].slice(0, 6);
    gallery.innerHTML = imgs.map(src => `
      <div class="gallery-item">
        <img src="${src}" alt="${pkg.title}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=60'">
      </div>`).join('');
  }

  // Pricing
  const pricingEl = document.getElementById('detail-pricing');
  if (pricingEl && pkg.pricing) {
    pricingEl.innerHTML = pkg.pricing.map(p => `
      <div class="pricing-row">
        <span>${p.roomType}</span>
        <span class="pricing-amount">₹${p.price.toLocaleString('en-IN')}</span>
      </div>`).join('');
  }

  // Reviews
  const reviewsEl = document.getElementById('detail-reviews');
  if (reviewsEl && pkg.reviews?.length) {
    reviewsEl.innerHTML = pkg.reviews.map(r => `
      <div class="testimonial-card anim-fade-up">
        <div class="quote-icon">"</div>
        <p class="testimonial-text">${r.text}</p>
        <div class="testimonial-author">
          <div class="author-avatar-placeholder">${r.author[0]}</div>
          <div>
            <div class="author-name">${r.author}</div>
            <div class="author-trip">
              <span class="stars">${renderStars(r.rating)}</span>
              · ${new Date(r.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>`).join('');
  }

  // WhatsApp buttons
  document.querySelectorAll('[data-whatsapp]').forEach(btn => {
    btn.dataset.whatsapp = pkg.title;
  });
}

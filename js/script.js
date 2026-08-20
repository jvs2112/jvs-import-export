/* =========================================================================
   JVS IMPORT & EXPORT — MAIN SCRIPT
   Vanilla JavaScript only. Organized into small, reusable, self-initializing
   modules. Every module checks for the DOM nodes it needs before running,
   so this single file can safely be shared across all pages.
   ========================================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initStickyHeader();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initButtonRipple();
  initTestimonialSlider();
  initFaqAccordion();
  initCertificateLightbox();
  initProductCatalog();
  initContactForm();
  initNewsletterForm();
  initFooterYear();
});

/* -------------------------------------------------------------------------
   Loading Animation
   ------------------------------------------------------------------------- */
function initPageLoader() {
  const loader = document.querySelector('[data-page-loader]');
  if (!loader) return;
  const hide = () => loader.classList.add('is-hidden');
  window.addEventListener('load', () => setTimeout(hide, 250));
  // Fallback in case the load event is delayed by slow external resources
  setTimeout(hide, 2000);
}

/* -------------------------------------------------------------------------
   Sticky Header (shrinks + adds shadow on scroll)
   ------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const applyState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

/* -------------------------------------------------------------------------
   Responsive Hamburger Menu
   ------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) return;

  const closeNav = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // Close menu automatically if viewport grows past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) closeNav();
  });
}

/* -------------------------------------------------------------------------
   Scroll Reveal (fade in / slide up) using IntersectionObserver
   ------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   Animated Statistic Counters
   ------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = target * eased;
      el.textContent = (target % 1 === 0 ? Math.floor(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   Back To Top Button
   ------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector('[data-back-to-top]');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------
   Button Ripple Effect
   ------------------------------------------------------------------------- */
function initButtonRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* -------------------------------------------------------------------------
   Testimonials Slider (scroll-snap track + dot navigation)
   ------------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.querySelector('[data-testimonial-track]');
  const dotsWrap = document.querySelector('[data-testimonial-dots]');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);
  dotsWrap.innerHTML = '';

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  const syncActiveDot = () => {
    const trackLeft = track.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - trackLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === closestIndex));
  };

  track.addEventListener('scroll', () => {
    window.requestAnimationFrame(syncActiveDot);
  }, { passive: true });
}

/* -------------------------------------------------------------------------
   FAQ Accordion
   ------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-item__q');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      items.forEach((other) => other.setAttribute('data-open', 'false'));
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* -------------------------------------------------------------------------
   Certificate Gallery Lightbox
   ------------------------------------------------------------------------- */
function initCertificateLightbox() {
  const cards = document.querySelectorAll('[data-cert-card]');
  const lightbox = document.querySelector('[data-lightbox]');
  if (!cards.length || !lightbox) return;

  const imgEl = lightbox.querySelector('[data-lightbox-img]');
  const titleEl = lightbox.querySelector('[data-lightbox-title]');
  const metaEl = lightbox.querySelector('[data-lightbox-meta]');
  const closeBtn = lightbox.querySelector('[data-lightbox-close]');
  const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
  const nextBtn = lightbox.querySelector('[data-lightbox-next]');

  const certList = Array.from(cards);
  let currentIndex = 0;

  const renderCert = (index) => {
    const card = certList[index];
    const img = card.querySelector('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    titleEl.textContent = card.dataset.title || img.alt;
    metaEl.textContent = card.dataset.meta || '';
  };

  const openLightbox = (index) => {
    currentIndex = index;
    renderCert(currentIndex);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % certList.length;
    renderCert(currentIndex);
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + certList.length) % certList.length;
    renderCert(currentIndex);
  };

  certList.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* -------------------------------------------------------------------------
   Product Catalog: Search + Category Filter + Dummy Load More
   ------------------------------------------------------------------------- */
function initProductCatalog() {
  const searchInput = document.querySelector('[data-product-search]');
  const filterButtons = document.querySelectorAll('[data-product-filter]');
  const cards = document.querySelectorAll('[data-product-card]');
  const emptyState = document.querySelector('[data-product-empty]');
  const loadMoreBtn = document.querySelector('[data-load-more]');

  if (!cards.length) return;

  let activeCategory = 'all';
  let activeQuery = '';

  const applyFilters = () => {
    let visibleCount = 0;
    cards.forEach((card) => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const haystack = (card.dataset.name || '').toLowerCase();
      const matchesQuery = haystack.includes(activeQuery);
      const isMatch = matchesCategory && matchesQuery;
      card.style.display = isMatch ? '' : 'none';
      if (isMatch) visibleCount += 1;
    });
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
    searchInput.addEventListener('focus', () => {
      searchInput.closest('.search-field')?.classList.add('is-focused');
    });
    searchInput.addEventListener('blur', () => {
      searchInput.closest('.search-field')?.classList.remove('is-focused');
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.dataset.productFilter;
      applyFilters();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.classList.add('is-loading');
      loadMoreBtn.disabled = true;
      const label = loadMoreBtn.querySelector('span:last-child');
      const originalLabel = label ? label.textContent : '';
      if (label) label.textContent = 'Loading...';

      // Simulated network delay — replace with a real API call when the
      // backend / product feed is available.
      setTimeout(() => {
        loadMoreBtn.classList.remove('is-loading');
        loadMoreBtn.disabled = false;
        if (label) label.textContent = 'No More Products';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.6';
        loadMoreBtn.style.cursor = 'not-allowed';
      }, 1200);
    });
  }
}

/* -------------------------------------------------------------------------
   Contact Form: Client-side Validation + Simulated Submission
   ------------------------------------------------------------------------- */
function initContactForm() {

  const form = document.querySelector('[data-contact-form]');

  if (!form) return;

  const statusEl = form.querySelector('[data-form-status]');
  const submitBtn = form.querySelector('[data-form-submit]');

  const validators = {

    name: (v) =>
      v.trim().length > 1 ||
      'Please enter your full name.',

    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
      'Please enter a valid email address.',

    message: (v) =>
      v.trim().length > 9 ||
      'Please add a few details about your requirement.',

  };

  const showFieldError = (field, message) => {

    const wrapper = field.closest('.form-field');

    if (!wrapper) return;

    wrapper.classList.toggle('has-error', Boolean(message));

    const errorEl = wrapper.querySelector('.error-msg');

    if (errorEl) {
      errorEl.textContent =
        message === true ? '' : message || '';
    }

  };

  const validateField = (field) => {

    const rule = validators[field.name];

    if (!rule) return true;

    const result = rule(field.value);

    showFieldError(
      field,
      result === true ? '' : result
    );

    return result === true;

  };

  Object.keys(validators).forEach((name) => {

    const field = form.elements[name];

    if (field) {

      field.addEventListener('blur', () => {
        validateField(field);
      });

    }

  });

  form.addEventListener('submit', async (e) => {

    e.preventDefault();

    let isValid = true;

    Object.keys(validators).forEach((name) => {

      const field = form.elements[name];

      if (field && !validateField(field)) {
        isValid = false;
      }

    });

    if (!isValid) {

      if (statusEl) {

        statusEl.textContent =
          'Please correct the highlighted fields.';

        statusEl.classList.remove('is-success');

      }

      return;

    }

    const originalContent = submitBtn.innerHTML;

    submitBtn.disabled = true;

    submitBtn.innerHTML =
      '<span>Sending Inquiry...</span>';

    if (statusEl) {

      statusEl.textContent = '';

      statusEl.classList.remove('is-success');

    }

    try {

      const formData = new FormData(form);

      const response = await fetch(
        'https://api.web3forms.com/submit',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {

        if (statusEl) {

          statusEl.textContent =
            'Thank you — your inquiry has been received. Our team will respond within 2 business hours.';

          statusEl.classList.add('is-success');

        }

        form.reset();

      } else {

        throw new Error(
          result.message || 'Submission failed.'
        );

      }

    } catch (error) {

      console.error(
        'Inquiry submission error:',
        error
      );

      if (statusEl) {

        statusEl.textContent =
          'Sorry, we could not send your inquiry. Please try again or contact us directly.';

        statusEl.classList.remove('is-success');

      }

    } finally {

      submitBtn.disabled = false;

      submitBtn.innerHTML = originalContent;

    }

  });

}

/* -------------------------------------------------------------------------
   Newsletter Signup (footer)
   ------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) return;
    const button = form.querySelector('button');
    const original = button.innerHTML;
    button.innerHTML = '&#10003;';
    input.value = '';
    setTimeout(() => { button.innerHTML = original; }, 1800);
  });
}

/* -------------------------------------------------------------------------
   Footer Year
   ------------------------------------------------------------------------- */
function initFooterYear() {
  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
function openDirections() {
    const destination = "Disha Nagari, Beed By Pass, Satara Parisar, Chh. Sambhaji Nagar, Maharashtra, India";

    const mapsUrl =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(destination);

    window.open(mapsUrl, "_blank");

    
}
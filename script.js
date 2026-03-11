/* ══════════════════════════════════════════
   FOREST GREEN ESTATES – SCRIPT.JS
   ══════════════════════════════════════════ */

// ── Navbar scroll ──────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── Hamburger menu ─────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (navToggle) {
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
});

// ── Hero Slideshow ─────────────────────────
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.getElementById('heroDots');
let heroIdx = 0;
let heroTimer;

// Build dots
if (heroDots) {
  heroSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => showHeroSlide(i));
    heroDots.appendChild(dot);
  });
}

function showHeroSlide(idx) {
  heroSlides.forEach(s => s.classList.remove('active'));
  const dots = document.querySelectorAll('.hero-dot');
  dots.forEach(d => d.classList.remove('active'));
  heroSlides[idx].classList.add('active');
  if (dots[idx]) dots[idx].classList.add('active');
  heroIdx = idx;
}

function nextHeroSlide() {
  heroIdx = (heroIdx + 1) % heroSlides.length;
  showHeroSlide(heroIdx);
}

function startHeroTimer() {
  heroTimer = setInterval(nextHeroSlide, 5500);
}
function resetHeroTimer() {
  clearInterval(heroTimer);
  startHeroTimer();
}

const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
if (heroPrev) heroPrev.addEventListener('click', () => { heroIdx = (heroIdx - 1 + heroSlides.length) % heroSlides.length; showHeroSlide(heroIdx); resetHeroTimer(); });
if (heroNext) heroNext.addEventListener('click', () => { nextHeroSlide(); resetHeroTimer(); });

startHeroTimer();

// ── Interior Slider ─────────────────────────
const intSlider = document.getElementById('intSlider');
const intSlides = intSlider ? Array.from(intSlider.querySelectorAll('.int-slide')) : [];
const intDotsWrap = document.getElementById('intDots');
let intIdx = 0;
let intTimer;

// Build dots
if (intSlides.length && intDotsWrap) {
  intSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Interior slide ' + (i + 1));
    dot.addEventListener('click', () => { showIntSlide(i); resetIntTimer(); });
    intDotsWrap.appendChild(dot);
  });
}

function showIntSlide(idx) {
  intSlides.forEach(s => s.classList.remove('active'));
  if (intSlides[idx]) intSlides[idx].classList.add('active');
  intIdx = idx;
  document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function resetIntTimer() {
  clearInterval(intTimer);
  intTimer = setInterval(() => { intIdx = (intIdx + 1) % intSlides.length; showIntSlide(intIdx); }, 4500);
}

const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
if (sliderPrev) sliderPrev.addEventListener('click', () => { intIdx = (intIdx - 1 + intSlides.length) % intSlides.length; showIntSlide(intIdx); resetIntTimer(); });
if (sliderNext) sliderNext.addEventListener('click', () => { intIdx = (intIdx + 1) % intSlides.length; showIntSlide(intIdx); resetIntTimer(); });

if (intSlides.length) { showIntSlide(0); resetIntTimer(); }

// ── Renders Card Carousel ─────────────────────
const rendersTrack = document.getElementById('rendersTrack');
const renderCards = rendersTrack ? Array.from(rendersTrack.querySelectorAll('.render-card')) : [];
const rendersDotsWrap = document.getElementById('rendersDots');
const rendersPrevBtn = document.getElementById('rendersPrev');
const rendersNextBtn = document.getElementById('rendersNext');

let rendersIdx = 0;
let rendersTimer;
const rendersVisible = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
const rendersTotal = () => Math.max(0, renderCards.length - rendersVisible());

function buildRendersDots() {
  if (!rendersDotsWrap) return;
  rendersDotsWrap.innerHTML = '';
  const pages = rendersTotal() + 1;
  for (let i = 0; i < pages; i++) {
    const d = document.createElement('button');
    d.className = 'renders-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { rendersIdx = Math.min(i, rendersTotal()); moveRendersTrack(); resetRendersTimer(); });
    rendersDotsWrap.appendChild(d);
  }
}

function moveRendersTrack() {
  if (!rendersTrack || !renderCards.length) return;
  const cardW = renderCards[0].offsetWidth + 19; // card width + gap (1.2rem ≈ 19px)
  rendersTrack.style.transform = `translateX(-${rendersIdx * cardW}px)`;
  document.querySelectorAll('.renders-dot').forEach((d, i) => d.classList.toggle('active', i === rendersIdx));
}

function resetRendersTimer() {
  clearInterval(rendersTimer);
  rendersTimer = setInterval(() => {
    rendersIdx = rendersIdx >= rendersTotal() ? 0 : rendersIdx + 1;
    moveRendersTrack();
  }, 4000);
}

if (rendersPrevBtn) rendersPrevBtn.addEventListener('click', () => { rendersIdx = Math.max(0, rendersIdx - 1); moveRendersTrack(); resetRendersTimer(); });
if (rendersNextBtn) rendersNextBtn.addEventListener('click', () => { rendersIdx = Math.min(rendersTotal(), rendersIdx + 1); moveRendersTrack(); resetRendersTimer(); });

window.addEventListener('resize', () => { rendersIdx = Math.min(rendersIdx, rendersTotal()); buildRendersDots(); moveRendersTrack(); });

if (renderCards.length) { buildRendersDots(); resetRendersTimer(); }

// ── Gallery Lightbox ──────────────────────────
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

const lightboxImages = Array.from(galleryItems).map(item => ({
  src: item.getAttribute('data-src') || item.querySelector('img').src,
  alt: item.querySelector('img').alt
}));
let lightboxCurrent = 0;

function openLightbox(idx) {
  lightboxCurrent = idx;
  lightboxImg.src = lightboxImages[idx].src;
  lightboxImg.alt = lightboxImages[idx].alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
  lightboxCurrent = (lightboxCurrent - 1 + lightboxImages.length) % lightboxImages.length;
  lightboxImg.src = lightboxImages[lightboxCurrent].src;
  lightboxImg.alt = lightboxImages[lightboxCurrent].alt;
});
if (lightboxNext) lightboxNext.addEventListener('click', () => {
  lightboxCurrent = (lightboxCurrent + 1) % lightboxImages.length;
  lightboxImg.src = lightboxImages[lightboxCurrent].src;
  lightboxImg.alt = lightboxImages[lightboxCurrent].alt;
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev && lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
});

// ── Intersection Observer for Fade-In ─────
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
fadeEls.forEach(el => observer.observe(el));

// ── Gallery & Amenity Stagger Animation ────
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.gallery-item, .amenity-card');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 80 + 50);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.gallery-grid, .amenities-grid').forEach(el => {
  staggerObserver.observe(el);
});

// ── Counter Animation for Stats ────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 25);
  });
}

const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(statsSection);
}

// ── Smooth scroll for nav links ─────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Parallax effect on hero ─────────────────
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  document.querySelectorAll('.hero-bg').forEach(heroBg => {
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  });
});

// ── Active nav link on scroll ───────────────
const pageSections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  pageSections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.getAttribute('id');
    }
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--gold-light)' : '';
  });
});

// ── AOS-style loc-point reveal ────────────
const locObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('[data-aos]');
      items.forEach(item => {
        const delay = parseInt(item.getAttribute('data-aos-delay') || '0');
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'none';
        }, delay);
      });
      locObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.location-points').forEach(el => {
  el.querySelectorAll('[data-aos]').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  locObserver.observe(el);
});

// ── Section title underline reveal ──────────
const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('title-revealed');
      titleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));

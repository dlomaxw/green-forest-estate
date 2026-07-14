/* ══════════════════════════════════════════
   FOREST GREEN ESTATES – SCRIPT.JS
   ══════════════════════════════════════════ */

// ── Preloader / Splash Screen ────────────────
(function() {
  const lockScroll = () => {
    if (document.body) {
      document.body.classList.add('preloading');
    } else {
      setTimeout(lockScroll, 5);
    }
  };
  lockScroll();

  window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      const hasVisited = sessionStorage.getItem('forestGreenVisited');
      if (hasVisited) {
        // Subsequent subpage loads: fast reveal
        preloader.style.transition = 'transform 0.4s cubic-bezier(0.85, 0, 0.15, 1), opacity 0.4s ease';
        const progress = preloader.querySelector('.preloader-progress');
        if (progress) progress.style.animationDuration = '0.3s';
        const logo = preloader.querySelector('.preloader-logo');
        if (logo) logo.style.animationDuration = '0.3s';
        
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('preloading');
        }, 300);
      } else {
        // First load of the session: elegant long reveal
        sessionStorage.setItem('forestGreenVisited', 'true');
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('preloading');
        }, 1600);
      }
    } else {
      if (document.body) {
        document.body.classList.remove('preloading');
      }
    }
  });
})();

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
    navToggle.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (navToggle) {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  });
});

// ── Hero Slideshow ─────────────────────────
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.getElementById('heroDots');
let heroIdx = 0;
let heroTimer;

// Build dots
if (heroDots && heroSlides.length > 1) {
  heroSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => showHeroSlide(i));
    heroDots.appendChild(dot);
  });
}

function showHeroSlide(idx) {
  if (heroSlides.length === 0) return;
  heroSlides.forEach(s => s.classList.remove('active'));
  const dots = document.querySelectorAll('.hero-dot');
  dots.forEach(d => d.classList.remove('active'));
  if (heroSlides[idx]) {
    heroSlides[idx].classList.add('active');
  }
  if (dots[idx]) dots[idx].classList.add('active');
  heroIdx = idx;
}

function nextHeroSlide() {
  if (heroSlides.length <= 1) return;
  heroIdx = (heroIdx + 1) % heroSlides.length;
  showHeroSlide(heroIdx);
}

function startHeroTimer() {
  if (heroSlides.length <= 1) return;
  heroTimer = setInterval(nextHeroSlide, 5500);
}
function resetHeroTimer() {
  if (heroSlides.length <= 1) return;
  clearInterval(heroTimer);
  startHeroTimer();
}

const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
if (heroPrev && heroSlides.length > 1) heroPrev.addEventListener('click', () => { heroIdx = (heroIdx - 1 + heroSlides.length) % heroSlides.length; showHeroSlide(heroIdx); resetHeroTimer(); });
if (heroNext && heroSlides.length > 1) heroNext.addEventListener('click', () => { nextHeroSlide(); resetHeroTimer(); });

if (heroSlides.length > 1) {
  startHeroTimer();
}

// ── Touch Swipe for Hero ────────────────────
(function() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection || heroSlides.length <= 1) return;
  let touchStartX = 0;
  heroSection.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroSection.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { heroIdx = (heroIdx + 1) % heroSlides.length; }
      else { heroIdx = (heroIdx - 1 + heroSlides.length) % heroSlides.length; }
      showHeroSlide(heroIdx); resetHeroTimer();
    }
  }, { passive: true });
})();

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

// ── Touch Swipe for Interior Slider ────────
(function() {
  const intWrap = document.querySelector('.int-slider-wrap');
  if (!intWrap) return;
  let touchStartX = 0;
  intWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  intWrap.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { intIdx = (intIdx + 1) % intSlides.length; }
      else { intIdx = (intIdx - 1 + intSlides.length) % intSlides.length; }
      showIntSlide(intIdx); resetIntTimer();
    }
  }, { passive: true });
})();

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

// ── Touch Swipe for Renders Carousel ───────
(function() {
  const rendersView = document.querySelector('.renders-viewport');
  if (!rendersView) return;
  let touchStartX = 0;
  rendersView.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  rendersView.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { rendersIdx = Math.min(rendersTotal(), rendersIdx + 1); }
      else { rendersIdx = Math.max(0, rendersIdx - 1); }
      moveRendersTrack(); resetRendersTimer();
    }
  }, { passive: true });
})();

// ── Unified Lightbox (Gallery + Renders) ─────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lightboxQueue = [];  // current image set
let lightboxCurrent = 0;
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(images, idx) {
  if (!lightbox || !lightboxImg) return;
  lightboxQueue = images;
  lightboxCurrent = idx;
  lightboxImg.src = images[idx].src;
  lightboxImg.alt = images[idx].alt;
  if (lightboxCaption) lightboxCaption.textContent = images[idx].alt || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  if (lightboxImg) lightboxImg.src = '';
  document.body.style.overflow = '';
}

function lightboxStep(dir) {
  if (!lightboxImg || !lightboxQueue.length) return;
  lightboxCurrent = (lightboxCurrent + dir + lightboxQueue.length) % lightboxQueue.length;
  lightboxImg.src = lightboxQueue[lightboxCurrent].src;
  lightboxImg.alt = lightboxQueue[lightboxCurrent].alt;
  if (lightboxCaption) lightboxCaption.textContent = lightboxQueue[lightboxCurrent].alt || '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
if (lightboxPrev) lightboxPrev.addEventListener('click', () => lightboxStep(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => lightboxStep(1));
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxStep(-1);
  if (e.key === 'ArrowRight') lightboxStep(1);
});

// ── Gallery items → lightbox ──────────────────────────────
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryImages = Array.from(galleryItems).map(item => ({
  src: item.getAttribute('data-src') || item.querySelector('img').src,
  alt: item.querySelector('img').alt
}));

galleryItems.forEach((item, i) => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => openLightbox(galleryImages, i));
});

// ── Render cards → lightbox ───────────────────────────────
const renderImgCards = document.querySelectorAll('.render-card');
const renderImages = Array.from(renderImgCards).map(card => {
  const img = card.querySelector('img');
  return {
    src: img ? img.getAttribute('src') : '',
    alt: img ? (img.alt || card.querySelector('.render-label')?.textContent || 'Render') : 'Render'
  };
});

renderImgCards.forEach((card, i) => {
  card.style.cursor = 'pointer';
  // stop propagation on the carousel prev/next arrows so they don't trigger lightbox
  card.addEventListener('click', (e) => {
    if (e.target.closest('.renders-arrow')) return;
    openLightbox(renderImages, i);
  });
});

// ── Highlight cards → lightbox ────────────────────────────
const highlightCards = document.querySelectorAll('.highlight-card');
const highlightImages = Array.from(highlightCards).map(card => {
  const img = card.querySelector('img');
  return {
    src: img ? img.getAttribute('src') : '',
    alt: img ? (img.alt || card.querySelector('h3')?.textContent || 'Highlight') : 'Highlight'
  };
});

highlightCards.forEach((card, i) => {
  const imgWrap = card.querySelector('.highlight-img-wrap');
  if (imgWrap) {
    imgWrap.style.cursor = 'pointer';
    imgWrap.addEventListener('click', () => openLightbox(highlightImages, i));
  }
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
  const href = link.getAttribute('href');
  if (href === '#') return;
  link.addEventListener('click', (e) => {
    try {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } catch (err) {
      // Ignore invalid query selector errors
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

// ── Hero & Tour Video Lightbox ──────────────────────
const playHeroVideoBtn = document.getElementById('playHeroVideoBtn');
const playTourVideoBtn = document.getElementById('playTourVideoBtn');
const videoModal = document.getElementById('videoModal');
const videoModalClose = document.getElementById('videoModalClose');
const videoModalPlayer = document.getElementById('videoModalPlayer');

if ((playHeroVideoBtn || playTourVideoBtn) && videoModal && videoModalClose && videoModalPlayer) {
  const openVideoModal = (e) => {
    e.preventDefault();
    videoModalPlayer.src = "https://www.youtube.com/embed/MU3au8kC8Yw?autoplay=1&rel=0";
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  if (playHeroVideoBtn) playHeroVideoBtn.addEventListener('click', openVideoModal);
  if (playTourVideoBtn) playTourVideoBtn.addEventListener('click', openVideoModal);

  const closeMyVideoModal = () => {
    videoModal.classList.remove('open');
    videoModalPlayer.src = "";
    document.body.style.overflow = '';
  };

  videoModalClose.addEventListener('click', closeMyVideoModal);
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeMyVideoModal();
  });
}

// ── dfcu Mortgage Tabs ───────────────────────
window.switchTab = function(event, tabId) {
  const tabsContainer = event.target.closest('.tabs-container');
  if (!tabsContainer) return;
  
  // Deactivate all tab buttons in this container
  tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Deactivate all tab panes in this container
  tabsContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  // Activate selected button and pane
  event.target.classList.add('active');
  const targetPane = document.getElementById(tabId);
  if (targetPane) {
    targetPane.classList.add('active');
  }
};

// ── Mortgage Calculator ──────────────────────
const priceSlider = document.getElementById('priceSlider');
const downSlider = document.getElementById('downSlider');
const tenureSlider = document.getElementById('tenureSlider');

const priceVal = document.getElementById('priceVal');
const downPctVal = document.getElementById('downPctVal');
const downAmtVal = document.getElementById('downAmtVal');
const tenureVal = document.getElementById('tenureVal');
const loanAmtVal = document.getElementById('loanAmtVal');
const monthlyPaymentVal = document.getElementById('monthlyPaymentVal');

if (priceSlider && downSlider && tenureSlider) {
  const calculateMortgage = () => {
    const price = parseFloat(priceSlider.value);
    const downPct = parseFloat(downSlider.value);
    const tenureYrs = parseFloat(tenureSlider.value);
    
    // Calculations
    const downAmt = price * (downPct / 100);
    const loanAmt = price - downAmt;
    
    // Interest Rate: 17% per annum
    const annualRate = 0.17;
    const monthlyRate = annualRate / 12;
    const totalMonths = tenureYrs * 12;
    
    let monthlyPayment = 0;
    if (loanAmt > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanAmt / totalMonths;
      } else {
        monthlyPayment = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
    }
    
    // Update displays
    if (priceVal) priceVal.textContent = price.toLocaleString('en-US');
    if (downPctVal) downPctVal.textContent = downPct;
    if (downAmtVal) downAmtVal.textContent = Math.round(downAmt).toLocaleString('en-US');
    if (tenureVal) tenureVal.textContent = tenureYrs;
    if (loanAmtVal) loanAmtVal.textContent = Math.round(loanAmt).toLocaleString('en-US');
    if (monthlyPaymentVal) monthlyPaymentVal.textContent = Math.round(monthlyPayment).toLocaleString('en-US');
  };

  priceSlider.addEventListener('input', calculateMortgage);
  downSlider.addEventListener('input', calculateMortgage);
  tenureSlider.addEventListener('input', calculateMortgage);
  
  // Initial calculation
  calculateMortgage();
}

// ── Timeline Scroll & Glow Animation ─────────
const timelineWrap = document.querySelector('.timeline-wrap');
const timelineProgress = document.getElementById('timelineProgress');
const timelineItems = document.querySelectorAll('.timeline-item');

if (timelineWrap && timelineProgress && timelineItems.length) {
  const animateTimeline = () => {
    const triggerBottom = window.innerHeight * 0.85;
    
    // Get timeline bounding box
    const rect = timelineWrap.getBoundingClientRect();
    const timelineHeight = rect.height;
    
    // Calculate how much the timeline has scrolled past the trigger point
    const scrolledPastTop = triggerBottom - rect.top;
    
    let pct = 0;
    if (scrolledPastTop > 0) {
      pct = Math.min(100, (scrolledPastTop / timelineHeight) * 100);
    }
    
    // Animate progress line height
    timelineProgress.style.height = `${pct}%`;
    
    // Check and activate each milestone card
    timelineItems.forEach((item, idx) => {
      const dot = item.querySelector('.timeline-dot');
      const dotRect = dot.getBoundingClientRect();
      
      // If dot has scrolled past the trigger point, activate card
      if (dotRect.top < triggerBottom) {
        item.classList.add('active');
      } else {
        // Only remove active if it's not the first one
        if (idx > 0) {
          item.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', animateTimeline);
  window.addEventListener('resize', animateTimeline);
  // Initial check
  animateTimeline();
}

// ── PWA Integration ─────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('[Service Worker] Registered successfully', reg.scope))
      .catch((err) => console.error('[Service Worker] Registration failed', err));
  });
}

// PWA Install Prompt Logic
let deferredPrompt;
let activeBannerType = null;
const PWA_DISMISS_KEY = 'pwa-prompt-dismissed-time';
const COOLDOWN_DAYS = 7;

function isDismissed() {
  const dismissedTime = localStorage.getItem(PWA_DISMISS_KEY);
  if (!dismissedTime) return false;
  const elapsed = Date.now() - parseInt(dismissedTime, 10);
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return elapsed < cooldownMs;
}

function dismissPrompt() {
  localStorage.setItem(PWA_DISMISS_KEY, Date.now().toString());
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 600);
  }
  const tooltip = document.getElementById('pwa-ios-tooltip');
  if (tooltip) {
    tooltip.classList.remove('show');
    setTimeout(() => tooltip.remove(), 600);
  }
  activeBannerType = null;
}

function showAndroidPromo() {
  if (isDismissed() || document.getElementById('pwa-install-banner')) return;
  
  activeBannerType = 'android-native';
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML = `
    <div class="pwa-banner-header">
      <img src="assets/images/favicon.png" alt="Forest Green Estates" class="pwa-banner-logo" />
      <div class="pwa-banner-info">
        <h4 class="pwa-banner-title">Forest Green Estates</h4>
        <p class="pwa-banner-text">Install our webapp on your device for offline access and a faster luxury experience.</p>
      </div>
    </div>
    <div class="pwa-banner-ctas">
      <button class="pwa-btn-dismiss" id="pwaCloseBtn">Later</button>
      <button class="pwa-btn-install" id="pwaInstallBtn">Install App</button>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add('show'), 100);

  document.getElementById('pwaCloseBtn').addEventListener('click', dismissPrompt);
  document.getElementById('pwaInstallBtn').addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem(PWA_DISMISS_KEY, Date.now().toString());
      }
      deferredPrompt = null;
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
      activeBannerType = null;
    });
  });
}

function showIosPromo() {
  if (isDismissed() || document.getElementById('pwa-ios-tooltip')) return;

  activeBannerType = 'ios-safari';
  const tooltip = document.createElement('div');
  tooltip.id = 'pwa-ios-tooltip';
  tooltip.innerHTML = `
    <div class="pwa-ios-header">
      <h4 class="pwa-ios-title">Add to Home Screen</h4>
      <button class="pwa-ios-close" id="pwaIosCloseBtn">&times;</button>
    </div>
    <div class="pwa-ios-body">
      Install the Forest Green Estates app on your iPhone: tap the Share button 
      <span class="pwa-ios-icon-helper"><svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="currentColor" stroke-width="1.5" style="display:inline-block;vertical-align:middle;width:12px;height:15px;margin-bottom:2px;"><path d="M8 12V2m0 0L5 5m3-3l3 3M2 8v9a1 1 0 001 1h10a1 1 0 001-1V8"/></svg></span> 
      in Safari, then select <strong>Add to Home Screen</strong> <span class="pwa-ios-icon-helper">+</span> from the menu.
    </div>
    <div class="pwa-ios-arrow-down"></div>
  `;
  document.body.appendChild(tooltip);

  setTimeout(() => tooltip.classList.add('show'), 100);

  document.getElementById('pwaIosCloseBtn').addEventListener('click', dismissPrompt);
}

function showGenericMobilePromo(type) {
  if (isDismissed() || document.getElementById('pwa-install-banner')) return;

  activeBannerType = type;
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  
  let instructionsText = '';
  if (type === 'ios-other') {
    instructionsText = 'Tap your browser share or menu button, then select <strong>Add to Home Screen</strong> to install the Forest Green Estates webapp.';
  } else {
    instructionsText = 'Tap your browser menu icon (usually <strong>⋮</strong> in the corner) and select <strong>Install</strong> or <strong>Add to Home Screen</strong>.';
  }

  banner.innerHTML = `
    <div class="pwa-banner-header">
      <img src="assets/images/favicon.png" alt="Forest Green Estates" class="pwa-banner-logo" />
      <div class="pwa-banner-info">
        <h4 class="pwa-banner-title">Forest Green Estates</h4>
        <p class="pwa-banner-text">${instructionsText}</p>
      </div>
    </div>
    <div class="pwa-banner-ctas">
      <button class="pwa-btn-dismiss" id="pwaCloseBtn" style="flex: 1;">Dismiss</button>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add('show'), 100);
  document.getElementById('pwaCloseBtn').addEventListener('click', dismissPrompt);
}

function upgradeToAndroidPromo() {
  const banner = document.getElementById('pwa-install-banner');
  if (!banner) return;

  activeBannerType = 'android-native';
  banner.innerHTML = `
    <div class="pwa-banner-header">
      <img src="assets/images/favicon.png" alt="Forest Green Estates" class="pwa-banner-logo" />
      <div class="pwa-banner-info">
        <h4 class="pwa-banner-title">Forest Green Estates</h4>
        <p class="pwa-banner-text">Install our webapp on your device for offline access and a faster luxury experience.</p>
      </div>
    </div>
    <div class="pwa-banner-ctas">
      <button class="pwa-btn-dismiss" id="pwaCloseBtn">Later</button>
      <button class="pwa-btn-install" id="pwaInstallBtn">Install App</button>
    </div>
  `;

  document.getElementById('pwaCloseBtn').addEventListener('click', dismissPrompt);
  document.getElementById('pwaInstallBtn').addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem(PWA_DISMISS_KEY, Date.now().toString());
      }
      deferredPrompt = null;
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
      activeBannerType = null;
    });
  });
}

function initPwaPrompts() {
  const isInStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  if (isInStandalone || localStorage.getItem('pwa-installed') || isDismissed()) {
    return;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = (window.innerWidth <= 1024) || /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/.test(userAgent);

  if (!isMobile) return;

  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('fxios');

  if (isIos) {
    if (isSafari) {
      showIosPromo();
    } else {
      showGenericMobilePromo('ios-other');
    }
  } else {
    if (deferredPrompt) {
      showAndroidPromo();
    } else {
      showGenericMobilePromo('fallback-android');
    }
  }
}

// Listen for PWA installation prompts
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (activeBannerType === 'fallback-android') {
    upgradeToAndroidPromo();
  }
});

// Run prompts init sequence after the preloader completes
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initPwaPrompts, 4500);
});

// ── Dynamic Content Configuration Loader ──────────────────────
async function loadDynamicContent() {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('API config offline');
    const config = await res.json();
    applyConfig(config);
  } catch (err) {
    // Try fallback content.json file
    fetch('assets/data/content.json')
      .then(res => res.json())
      .then(config => applyConfig(config))
      .catch(e => console.warn('Could not load content configuration:', e));
  }
}

function applyConfig(config) {
  if (!config) return;
  
  // Update starting price texts
  if (config.startingPrice) {
    document.querySelectorAll('[data-content-key="startingPrice"]').forEach(el => {
      el.textContent = config.startingPrice;
    });
  }
  
  // Update max price texts
  if (config.maxPrice) {
    document.querySelectorAll('[data-content-key="maxPrice"]').forEach(el => {
      el.textContent = config.maxPrice;
    });
  }
  
  // Update hero sub text
  if (config.heroSub) {
    document.querySelectorAll('[data-content-key="heroSub"]').forEach(el => {
      el.textContent = config.heroSub;
    });
  }
  
  // Update maps iframe srcs
  if (config.locationMapUrl) {
    document.querySelectorAll('[data-iframe-key="locationMapUrl"]').forEach(el => {
      el.src = config.locationMapUrl;
    });
  }
  
  // Update map direction links
  if (config.locationDirectionsUrl) {
    document.querySelectorAll('[data-link-key="locationDirectionsUrl"]').forEach(el => {
      el.href = config.locationDirectionsUrl;
    });
  }
}

// ── Register Interest Popup Modal Injection ──────────────────────
function initRegisterInterestModal() {
  if (sessionStorage.getItem('interestPopupDismissed')) {
    return;
  }
  
  // Inject modal markup
  const modalHTML = `
    <div id="interestModal" class="modal-overlay">
      <div class="modal-card">
        <button class="modal-close" id="closeModalBtn">&times;</button>
        <div class="modal-logo-wrap">
          <img src="assets/images/forest-green-logo-cropped.png" alt="Forest Green Estates Logo">
        </div>
        <h2 class="modal-title">Register Your Interest</h2>
        <p class="modal-subtitle">Luxury fully-furnished condominiums in Kampala. Leave your details to get pricing, brochures, and schedule site tours.</p>
        
        <form id="interestForm">
          <div class="form-field-group">
            <input type="text" id="modalName" required placeholder="Full Name *">
          </div>
          <div class="form-field-group">
            <input type="tel" id="modalPhone" required placeholder="Phone Number *">
          </div>
          <div class="form-field-group">
            <input type="email" id="modalEmail" placeholder="Email Address">
          </div>
          <div class="form-field-group">
            <select id="modalRooms">
              <option value="" disabled selected>Number of Rooms</option>
              <option value="1 BHK">1 BHK Apartment</option>
              <option value="2 BHK">2 BHK Apartment</option>
              <option value="3 BHK">3 BHK Apartment</option>
            </select>
          </div>
          <button type="submit" class="modal-submit-btn">Register My Interest</button>
        </form>
        
        <div class="modal-line-divider"></div>
        
        <div class="modal-quick-actions">
          <a href="tel:+256708970870" class="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Call Us</span>
          </a>
          <a href="mailto:sales@forestgreenestates.com" class="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>Email</span>
          </a>
          <a href="https://wa.me/256708970870" target="_blank" class="quick-action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);
  
  const modal = document.getElementById('interestModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('interestForm');
  
  // Timer trigger (3 seconds)
  setTimeout(() => {
    if (!sessionStorage.getItem('interestPopupDismissed') && modal) {
      modal.classList.add('open');
    }
  }, 3000);
  
  const dismissModal = () => {
    if (modal) {
      modal.classList.remove('open');
    }
    sessionStorage.setItem('interestPopupDismissed', 'true');
  };
  
  if (closeBtn) {
    closeBtn.addEventListener('click', dismissModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) dismissModal();
    });
  }
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const lead = {
        name: document.getElementById('modalName').value.trim(),
        phone: document.getElementById('modalPhone').value.trim(),
        email: document.getElementById('modalEmail').value.trim(),
        rooms: document.getElementById('modalRooms').value
      };
      
      let serverSaved = false;
      
      // 1. Try server POST
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
        if (res.ok) {
          serverSaved = true;
        }
      } catch (err) {
        console.warn('Backend offline, capturing lead locally.');
      }
      
      // 2. Always capture locally as fallback/mirror
      try {
        const stored = localStorage.getItem('forestGreenLeads');
        let leads = stored ? JSON.parse(stored) : [];
        lead.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        lead.timestamp = new Date().toISOString();
        leads.push(lead);
        localStorage.setItem('forestGreenLeads', JSON.stringify(leads));
      } catch (err) {
        console.error('Failed to save lead in browser storage:', err);
      }
      
      // Render Success inside the card
      const card = modal.querySelector('.modal-card');
      card.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="var(--gold)" stroke-width="2" style="margin-bottom: 1.5rem;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3 style="color: var(--green); margin-bottom: 0.75rem; font-family: var(--font-serif); font-size: 1.8rem; font-weight:500;">Thank You!</h3>
          <p style="color: var(--text-light); font-size: 0.95rem; line-height:1.6; margin-bottom: 1rem;">Your interest has been successfully registered.</p>
          <p style="color: var(--text-light); font-size: 0.88rem;">Our real estate consultant will contact you shortly.</p>
        </div>
      `;
      
      sessionStorage.setItem('interestPopupDismissed', 'true');
      setTimeout(dismissModal, 4000);
    });
  }
}

// Initialize sequences
window.addEventListener('DOMContentLoaded', () => {
  loadDynamicContent();
  initRegisterInterestModal();
});




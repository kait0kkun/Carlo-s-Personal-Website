/**
 * Carlo Bunayos — Personal Portfolio
 * Interactive behaviors, scroll animations, and form handling
 */

// ===== PAGE LOAD & ANIMATION SETUP =====
// Add js-loaded class to enable scroll reveal animations (progressive enhancement)
document.documentElement.classList.add('js-loaded');

console.log('Script loaded!');

const initApp = () => {
  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  // ===== ACTIVE NAV LINK =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  const handleScroll = () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);

    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }

    updateActiveNavLink();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== MOBILE NAVIGATION =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');

  const toggleMobileMenu = () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (navToggle) navToggle.addEventListener('click', toggleMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  // Helper: check if element is in viewport
  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) + 50 &&
      rect.bottom > -50
    );
  }

  // Immediately reveal elements already in viewport
  function revealVisibleElements() {
    revealElements.forEach(el => {
      if (isInViewport(el)) {
        el.classList.add('visible');
      }
    });
  }

  // Run on load to catch elements visible on page load
  revealVisibleElements();

  // Also listen to scroll for a manual fallback
  let scrollRevealTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollRevealTicking) {
      requestAnimationFrame(() => {
        revealVisibleElements();
        scrollRevealTicking = false;
      });
      scrollRevealTicking = true;
    }
  }, { passive: true });

  // Also use IntersectionObserver for smoother animated reveals
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '50px 0px 50px 0px'
    });

    revealElements.forEach((el, index) => {
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c =>
          c.classList.contains('reveal') || c.classList.contains('reveal-left') ||
          c.classList.contains('reveal-right') || c.classList.contains('reveal-scale')
        );
        const siblingIndex = siblings.indexOf(el);
        if (siblingIndex > 0 && !el.dataset.delay) {
          el.dataset.delay = siblingIndex * 120;
        }
      }
      if (!el.classList.contains('visible')) {
        revealObserver.observe(el);
      }
    });
  }

  // Ultimate safety net — reveal everything after 3 seconds
  setTimeout(() => {
    revealElements.forEach(el => el.classList.add('visible'));
  }, 3000);



  // ===== HIGHLIGHTS SCROLL STACK ANIMATION (GSAP) =====
  const initHighlightsScroll = () => {
    const section = document.querySelector('.highlights');
    const track = document.querySelector('.highlights-track');
    const cards = document.querySelectorAll('.highlight-card');
    const progressFill = document.getElementById('highlightsProgressFill');
    const progressNumber = document.getElementById('highlightsProgressNumber');

    if (!section || !track || cards.length === 0) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Set initial positions
    cards.forEach((card, i) => {
      if (i === 0) {
        gsap.set(card, { zIndex: cards.length, y: 0, scale: 1, opacity: 1 });
      } else {
        gsap.set(card, { zIndex: cards.length - i, y: 60 * i, scale: 1 - (i * 0.06), opacity: 1 - (i * 0.25) });
      }
    });

    // Create scroll animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${window.innerHeight * 3}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressFill) {
            gsap.set(progressFill, { scaleX: self.progress });
          }
          if (progressNumber) {
            const current = Math.min(Math.floor(self.progress * cards.length) + 1, cards.length);
            progressNumber.textContent = `0${current} / 0${cards.length}`;
          }
        }
      }
    });

    // Animate cards stacking
    cards.forEach((card, i) => {
      if (i === 0) return;

      const label = `card-${i}`;

      // Previous cards stack up and fade
      for (let j = 0; j < i; j++) {
        tl.to(cards[j], {
          y: -30 * (i - j),
          scale: 1 - (0.04 * (i - j)),
          opacity: 1 - (0.25 * (i - j)),
          zIndex: cards.length - j,
          duration: 1,
          ease: 'power2.out'
        }, label);
      }

      // Current card comes in
      tl.fromTo(card,
        { y: 60 * i, scale: 1 - (i * 0.06), opacity: 1 - (i * 0.25) },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          zIndex: cards.length + i,
          duration: 1,
          ease: 'power2.out'
        },
        label
      );
    });

    ScrollTrigger.refresh();
  };

initHighlightsScroll();


  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.firstName || !data.lastName || !data.email || !data.subject || !data.message) {
        showFormStatus('Please fill in all fields.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      try {
        await simulateSend(data);
        showFormStatus('✓ Message sent successfully! Carlo will get back to you soon.', 'success');
        contactForm.reset();
      } catch (error) {
        showFormStatus('Failed to send message. Please try again or email directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span><span class="btn-icon">→</span>';
      }
    });
  }

  function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;

    setTimeout(() => {
      formStatus.className = 'form-status';
    }, 5000);
  }

  function simulateSend(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form submitted (email integration removed):', data);
        resolve();
      }, 1000);
    });
  }

  // ===== PARALLAX SUBTLE EFFECT ON HERO =====
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const heroImageEl = document.querySelector('.hero-image-wrapper');

  if (hero && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroHeight = hero.offsetHeight;

      if (scrolled < heroHeight) {
        const opacity = 1 - (scrolled / heroHeight) * 0.6;
        const translateY = scrolled * 0.25;

        if (heroContent) {
          heroContent.style.transform = `translateY(${translateY}px)`;
          heroContent.style.opacity = opacity;
        }
        if (heroImageEl) {
          heroImageEl.style.transform = `translateY(${translateY * 0.4}px)`;
          heroImageEl.style.opacity = opacity;
        }
      }
    }, { passive: true });
  }

  // ===== KEYBOARD ACCESSIBILITY =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // ===== HORIZONTAL PARALLAX GALLERY =====
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryProgressBar = document.getElementById('galleryProgressBar');
  
  if (galleryTrack && galleryProgressBar) {
    // Horizontal scroll on mouse wheel in gallery area
    const scrollGallery = (e) => {
      const rect = galleryTrack.getBoundingClientRect();
      const isInGallery = e.clientY >= rect.top && e.clientY <= rect.bottom && 
                         e.clientX >= rect.left && e.clientX <= rect.right;
      
      if (isInGallery) {
        e.preventDefault();
        galleryTrack.scrollLeft += e.deltaY > 0 ? 250 : -250;
        updateGalleryProgress();
        applyParallax();
      }
    };
    
    document.addEventListener('wheel', scrollGallery, { passive: false });
    
    // Progress bar update
    const updateGalleryProgress = () => {
      const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth;
      const currentScroll = galleryTrack.scrollLeft;
      const progress = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
      galleryProgressBar.style.width = `${progress}%`;
    };
    
    // Scroll parallax effect on items
    const applyParallax = () => {
      const items = galleryTrack.querySelectorAll('.gallery-item');
      const centerOffset = galleryTrack.clientWidth / 2;
      
      items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = (itemCenter - centerOffset) / centerOffset;
        const clamped = Math.max(-1, Math.min(1, distance));
        
        const media = item.querySelector('.gallery-item-media');
        if (media) {
          const shift = clamped * -15;
          media.style.transform = `translateX(${shift}px) scale(${1 + Math.abs(clamped) * 0.1})`;
        }
      });
    };
    
    // Initialize - scroll to center on item 6 (index 5)
    updateGalleryProgress();
    applyParallax();
    
    // Scroll to center item 6 after load
    setTimeout(() => {
      const items = galleryTrack.querySelectorAll('.gallery-item');
      const item6 = items[5];
      if (item6) {
        const trackRect = galleryTrack.getBoundingClientRect();
        const itemRect = item6.getBoundingClientRect();
        const centerOffset = itemRect.left + itemRect.width / 2 - trackRect.left - trackRect.width / 2;
        galleryTrack.scrollLeft += centerOffset;
        updateGalleryProgress();
        applyParallax();
      }
    }, 100);
    
    galleryTrack.addEventListener('scroll', () => {
      updateGalleryProgress();
      applyParallax();
    }, { passive: true });
  }
};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // ===== FARM GALLERY DYNAMIC LOADING =====
  const farmGalleryGrid = document.getElementById('farmGalleryGrid');
  if (farmGalleryGrid) {
    const farmImages = [
      { src: 'assets/images/Agricultural Farm/Agri3.webp', label: 'Main Entrance', desc: 'Farm gateway and main entrance', badge: 'Featured', class: 'featured' },
      { src: 'assets/images/Agricultural Farm/Agri8.mp4', label: 'Farm Tour', desc: 'Drone aerial footage of entire farm', badge: 'Video', class: 'featured', type: 'video' }
    ];

    farmImages.forEach(item => {
      const card = document.createElement('a');
      card.href = 'gallery-farm.html';
      card.className = `farm-gallery-card ${item.class}`;
      
      if (item.type === 'video') {
        card.innerHTML = `
          <div class="farm-card-media">
            <video src="${item.src}" muted loop preload="metadata"></video>
            <div class="farm-video-play">
              <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <div class="farm-card-overlay">
              ${item.badge ? `<span class="farm-card-badge">${item.badge}</span>` : ''}
              <div class="farm-card-info">
                <h3>${item.label}</h3>
                <p>${item.desc}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="farm-card-media">
            <img src="${item.src}" alt="${item.label}" loading="lazy">
            <div class="farm-card-overlay">
              ${item.badge ? `<span class="farm-card-badge">${item.badge}</span>` : ''}
              <div class="farm-card-info">
                <h3>${item.label}</h3>
                <p>${item.desc}</p>
              </div>
            </div>
          </div>
        `;
      }
      farmGalleryGrid.appendChild(card);

      // Video hover play/pause
      if (item.type === 'video') {
        const video = card.querySelector('video');
        card.addEventListener('mouseenter', () => video.play());
        card.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }
    });

    // GSAP staggered animation for farm gallery
    gsap.from('.farm-gallery-card', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.2
    });
  }
  
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  console.log('Found tooltip elements:', tooltipElements.length);
  tooltipElements.forEach(el => {
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'auto';
    
    const showTooltip = (e) => {
      const text = e.target.getAttribute('data-tooltip') || el.getAttribute('data-tooltip');
      if (!text) return;
      
      let tooltip = document.getElementById('custom-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.style.cssText = `
          position: fixed;
          background: rgba(20,20,20,0.95);
          color: #fff;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.4;
          max-width: 300px;
          text-align: left;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
        `;
        document.body.appendChild(tooltip);
      }
      tooltip.textContent = text;
      tooltip.style.opacity = '0';
      tooltip.style.display = 'block';
      const rect = el.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
      tooltip.style.top = (rect.top - 10) + 'px';
      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
      });
    };
    
    const hideTooltip = () => {
      const tooltip = document.getElementById('custom-tooltip');
      if (tooltip) tooltip.style.opacity = '0';
    };
    
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('click', showTooltip);
  });

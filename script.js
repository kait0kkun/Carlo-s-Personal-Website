/**
 * Carlo Bunayos — Personal Portfolio
 * Interactive behaviors, scroll animations, and form handling
 */

// ===== PAGE LOAD & ANIMATION SETUP =====
// Add js-loaded class to enable scroll reveal animations (progressive enhancement)
document.documentElement.classList.add('js-loaded');

const initApp = () => {
  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

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

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      try {
        const targetVal = counter.dataset.target;
        if (!targetVal) return;
        
        const target = parseInt(targetVal) || 0;
        const duration = 2000;
        const suffix = target >= 50 ? '+' : '';
        
        // Failsafe population in case animation loops fail
        counter.textContent = target + suffix;

        let startTimestamp = null;
        
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * easeOut);

          counter.textContent = current + suffix;

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            counter.textContent = target + suffix;
          }
        };

        // Reset to 0 briefly to start animation
        counter.textContent = '0';
        window.requestAnimationFrame(step);
      } catch (err) {
        console.error("Counter animation error", err);
      }
    });
  }

  // Robustly trigger counters when user scrolls down the page
  window.addEventListener('scroll', () => {
    if (!countersAnimated && window.scrollY > 400 && counters.length > 0) {
      animateCounters();
    }
  }, { passive: true });

  // Ultimate fallback trigger after 4 seconds regardless of scroll
  setTimeout(() => {
    if (!countersAnimated && counters.length > 0) {
      animateCounters();
    }
  }, 4000);

  // ===== TESTIMONIALS SLIDER =====
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  let currentTestimonial = 0;
  let testimonialInterval;

  function showTestimonial(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    testimonialDots.forEach(dot => dot.classList.remove('active'));

    if (testimonialCards[index]) testimonialCards[index].classList.add('active');
    if (testimonialDots[index]) testimonialDots[index].classList.add('active');
    currentTestimonial = index;
  }

  function nextTestimonial() {
    const next = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(next);
  }

  function startTestimonialRotation() {
    testimonialInterval = setInterval(nextTestimonial, 5000);
  }

  function stopTestimonialRotation() {
    clearInterval(testimonialInterval);
  }

  testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      stopTestimonialRotation();
      showTestimonial(index);
      startTestimonialRotation();
    });
  });

  if (testimonialCards.length > 0) {
    startTestimonialRotation();
  }

  // ===== CONTACT FORM =====
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

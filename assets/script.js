/**
 * ZAHEER MALIK — EXECUTIVE PORTFOLIO INTERACTIONS
 * 60fps Scroll Reveals, Spotlight Cards, 3D Tilt, Number Counters & Magnetic CTAs
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. MINIMAL WELCOME / LOADING SPLASH SCREEN (AUTO-LAUNCHES IN ~2.3s)
  const welcomeScreen = document.getElementById('welcomeScreen');
  const progressFill = document.getElementById('welcomeProgressFill');
  const percentEl = document.getElementById('welcomePercent');

  if (welcomeScreen) {
    let hasEntered = false;
    const loadDuration = 2200;
    const startLoad = performance.now();

    function enterPortfolio() {
      if (hasEntered) return;
      hasEntered = true;
      welcomeScreen.classList.add('is-exiting');
      document.body.classList.remove('welcome-locked');
      setTimeout(() => {
        welcomeScreen.style.display = 'none';
      }, 850);
    }

    function stepLoader(now) {
      if (hasEntered) return;
      const elapsed = now - startLoad;
      const progress = Math.min(elapsed / loadDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const pct = Math.round(eased * 100);

      if (progressFill) progressFill.style.width = `${pct}%`;
      if (percentEl) percentEl.textContent = `${pct}%`;

      if (progress < 1) {
        requestAnimationFrame(stepLoader);
      } else {
        setTimeout(enterPortfolio, 220);
      }
    }

    requestAnimationFrame(stepLoader);
  }

  // 1. DYNAMIC FOOTER YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. SCROLL PROGRESS BAR & STICKY HEADER
  const scrollProgress = document.getElementById('scrollProgress');
  const siteHeader = document.getElementById('siteHeader');

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollProgress && scrollHeight > 0) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = `${progressPercent}%`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', scrollTop > 28);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. MOBILE NAVIGATION DRAWER
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.classList.toggle('active', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. ACTIVE NAVIGATION LINK (SCROLL SPY)
  const sections = document.querySelectorAll('main > section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-link');

  if ('IntersectionObserver' in window && sections.length && navItems.length) {
    const navObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navItems.forEach(item => {
              item.classList.toggle('active', item.getAttribute('href') === `#${currentId}`);
            });
          }
        });
      },
      {
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0
      }
    );

    sections.forEach(sec => navObserver.observe(sec));
  }

  // 5. ANIMATED NUMBER COUNTERS
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 1400;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  // 6. STAGGERED SCROLL REVEALS
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const counterEl = entry.target.querySelector('[data-count]');
            if (counterEl && !counterEl.dataset.animated) {
              counterEl.dataset.animated = 'true';
              animateCounter(counterEl);
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px'
      }
    );

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // 7. CUSTOM INTERACTIVE POINTER / CURSOR & AMBIENT GLOW (DESKTOP POINTERS)
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasFinePointer) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.opacity = '1';
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (cursorRing) {
        cursorRing.style.opacity = '1';
      }
      if (cursorGlow) {
        cursorGlow.style.opacity = '1';
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorRing) cursorRing.style.opacity = '0';
      if (cursorGlow) cursorGlow.style.opacity = '0';
    });

    window.addEventListener('mousedown', () => {
      if (cursorDot) cursorDot.classList.add('is-clicking');
      if (cursorRing) cursorRing.classList.add('is-clicking');
    });

    window.addEventListener('mouseup', () => {
      if (cursorDot) cursorDot.classList.remove('is-clicking');
      if (cursorRing) cursorRing.classList.remove('is-clicking');
    });

    // Hover states for interactive elements
    const interactiveSelectors = 'a, button, .project-card, .skill-card, .timeline-content, .credential, .portrait-frame';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorDot) cursorDot.classList.add('is-hovering');
        if (cursorRing) {
          cursorRing.classList.add('is-hovering');
          if (cursorLabel) {
            if (el.id === 'enterPortfolioBtn') {
              cursorLabel.textContent = 'ENTER';
              cursorRing.classList.add('has-label');
            } else if (el.classList.contains('project-link') || (el.tagName === 'A' && el.target === '_blank')) {
              cursorLabel.textContent = 'OPEN';
              cursorRing.classList.add('has-label');
            } else if (el.classList.contains('project-card')) {
              cursorLabel.textContent = 'VIEW';
              cursorRing.classList.add('has-label');
            } else {
              cursorLabel.textContent = '';
              cursorRing.classList.remove('has-label');
            }
          }
        }
      });

      el.addEventListener('mouseleave', () => {
        if (cursorDot) cursorDot.classList.remove('is-hovering');
        if (cursorRing) {
          cursorRing.classList.remove('is-hovering', 'has-label');
        }
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.24;
      ringY += (mouseY - ringY) * 0.24;
      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      if (cursorGlow && !reduceMotion) {
        glowX += (mouseX - glowX) * 0.14;
        glowY += (mouseY - glowY) * 0.14;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  } else {
    if (cursorGlow) cursorGlow.style.display = 'none';
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  // 8. SPOTLIGHT RADIAL HIGHLIGHT & 3D TILT INTERACTION
  if (hasFinePointer && !reduceMotion) {
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      }, { passive: true });
    });

    const tiltCards = document.querySelectorAll('.project-card, .skill-card, .portrait-frame');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -3.5;
        const rotateY = ((x - centerX) / centerX) * 3.5;

        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // 9. SUBTLE MAGNETIC BUTTON HOVER
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
        btn.style.transform = `translate(${dx}px, ${dy - 2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // 10. LIVE PAKISTAN STANDARD TIME (PKT UTC+5) CLOCK IN HERO
  const liveClockEl = document.getElementById('liveClock');
  if (liveClockEl) {
    function updateClock() {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        liveClockEl.textContent = formatter.format(new Date());
      } catch (err) {
        liveClockEl.textContent = new Date().toLocaleTimeString();
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 11. DYNAMIC SENIOR ENGINEERING SPECIALIZATION TICKER
  const roleTickerEl = document.getElementById('roleTickerText');
  if (roleTickerEl && !reduceMotion) {
    const roles = [
      'Production SaaS & Full-Stack Web Ecosystems',
      'Next.js, React, TypeScript & Node.js Architecture',
      'Python, Django, PostgreSQL & AI/ML Pipelines',
      'Enterprise ERP, POS & Cloud Infrastructure',
      'UI/UX Systems, Brand Identity & IT Lecturing'
    ];
    let roleIdx = 0;
    setInterval(() => {
      roleTickerEl.classList.add('is-switching');
      setTimeout(() => {
        roleIdx = (roleIdx + 1) % roles.length;
        roleTickerEl.textContent = roles[roleIdx];
        roleTickerEl.classList.remove('is-switching');
      }, 260);
    }, 3000);
  }

  // 12. INTERACTIVE PROJECT CATEGORY FILTER TABS
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('#projectGrid .project-card');

  if (filterTabs.length && projectCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filterVal = tab.getAttribute('data-filter') || 'all';

        filterTabs.forEach(t => {
          const isCurrent = t === tab;
          t.classList.toggle('active', isCurrent);
          t.setAttribute('aria-selected', String(isCurrent));
        });

        projectCards.forEach(card => {
          const categories = (card.getAttribute('data-category') || '').split(/\s+/);
          const matches = filterVal === 'all' || categories.includes(filterVal);

          if (matches) {
            card.classList.remove('is-filtered-out');
            card.classList.add('visible');
          } else {
            card.classList.add('is-filtered-out');
          }
        });
      });
    });
  }

  // 13. ONE-CLICK COPY EMAIL ADDRESS BUTTON
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyEmailText = document.getElementById('copyEmailText');
  const copyEmailIcon = document.getElementById('copyEmailIcon');

  if (copyEmailBtn && copyEmailText) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'zaheeruldin978@gmail.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
        copyEmailBtn.classList.add('is-copied');
        copyEmailText.textContent = 'Copied: zaheeruldin978@gmail.com';
        if (copyEmailIcon) copyEmailIcon.textContent = '✓';

        setTimeout(() => {
          copyEmailBtn.classList.remove('is-copied');
          copyEmailText.textContent = 'Copy Email Address';
          if (copyEmailIcon) copyEmailIcon.textContent = '⧉';
        }, 2600);
      } catch (e) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // 14. GRAPHIC DESIGN PORTFOLIO FILTER TABS & FULLSCREEN LIGHTBOX VIEWER (designs.html)
  const designFilterBtns = document.querySelectorAll('.design-filter-btn');
  const designCards = Array.from(document.querySelectorAll('#designGalleryGrid .design-card'));

  if (designFilterBtns.length && designCards.length) {
    designFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterVal = btn.getAttribute('data-filter') || 'all';

        designFilterBtns.forEach(b => {
          const isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          b.setAttribute('aria-selected', String(isCurrent));
        });

        designCards.forEach(card => {
          const cat = card.getAttribute('data-category') || '';
          const matches = filterVal === 'all' || cat === filterVal;
          if (matches) {
            card.classList.remove('is-filtered-out');
            card.classList.add('visible');
          } else {
            card.classList.add('is-filtered-out');
          }
        });
      });
    });
  }

  const lightbox = document.getElementById('designLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCat = document.getElementById('lightboxCat');
  const lightboxTools = document.getElementById('lightboxTools');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (lightbox && designCards.length) {
    let activeCardIndex = 0;

    function getVisibleCards() {
      return designCards.filter(c => !c.classList.contains('is-filtered-out'));
    }

    function openLightboxByCard(card) {
      const visible = getVisibleCards();
      activeCardIndex = Math.max(0, visible.indexOf(card));
      renderLightboxCard(visible[activeCardIndex] || card);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function renderLightboxCard(card) {
      if (!card) return;
      const src = card.getAttribute('data-src') || '';
      const title = card.getAttribute('data-title') || '';
      const cat = card.getAttribute('data-cat') || '';
      const tools = card.getAttribute('data-tools') || '';

      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = title;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCat) lightboxCat.textContent = cat;
      if (lightboxTools) lightboxTools.textContent = tools;
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function stepLightbox(dir) {
      const visible = getVisibleCards();
      if (!visible.length) return;
      activeCardIndex = (activeCardIndex + dir + visible.length) % visible.length;
      renderLightboxCard(visible[activeCardIndex]);
    }

    designCards.forEach(card => {
      card.addEventListener('click', () => openLightboxByCard(card));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => stepLightbox(1));

    window.addEventListener('keydown', e => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }
});

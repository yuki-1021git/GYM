// STATIC LP ONLY
// このファイルは静的プレビュー（index.html）専用です。
// WordPressテーマ側は gym76/js/carousel.js を編集してください。

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-motion');

  initSectionTitleUnderline();
  initSideBubbles();
  initReserveCtaReveal();
  initContactFormReveal();
  initFloatingCtaVisibility();

  const carousel = document.querySelector('.review-carousel');
  const viewport = document.querySelector('.review-viewport');
  const track = document.querySelector('.review-track');
  const prevBtn = document.querySelector('.review-nav-prev');
  const nextBtn = document.querySelector('.review-nav-next');

  if (!carousel || !viewport || !track || !prevBtn || !nextBtn) return;

  const originalCards = Array.from(track.querySelectorAll('.review-card'));
  if (originalCards.length === 0) return;

  let visibleCount = getVisibleCount();
  let currentIndex = visibleCount;
  let isAnimating = false;
  let autoTimer = null;
  const slideDelay = 3000;
  const transitionMs = 350;

  let startX = 0;
  let endX = 0;

  setup();

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function setup() {
    stopAutoSlide();

    // 既存のクローンを削除
    track.querySelectorAll('.is-clone').forEach(node => node.remove());

    visibleCount = getVisibleCount();

    const cards = Array.from(track.querySelectorAll('.review-card:not(.is-clone)'));

    // 前後に visibleCount 枚ずつクローン
    const headClones = cards.slice(0, visibleCount).map(card => cloneCard(card));
    const tailClones = cards.slice(-visibleCount).map(card => cloneCard(card));

    tailClones.forEach(clone => track.insertBefore(clone, track.firstChild));
    headClones.forEach(clone => track.appendChild(clone));

    currentIndex = visibleCount;
    updatePosition(false);
    startAutoSlide();
  }

  function cloneCard(card) {
    const clone = card.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }

  function getStepSize() {
    const cards = track.querySelectorAll('.review-card');
    if (!cards.length) return 0;

    const card = cards[0];
    const cardStyle = window.getComputedStyle(card);
    const trackStyle = window.getComputedStyle(track);

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || '0');
    const marginRight = parseFloat(cardStyle.marginRight || '0');

    return cardWidth + gap + marginRight;
  }

  function updatePosition(withTransition = true) {
    const step = getStepSize();
    track.style.transition = withTransition ? `transform ${transitionMs}ms ease` : 'none';
    track.style.transform = `translateX(-${currentIndex * step}px)`;
  }

  function goNext() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += 1;
    updatePosition(true);
  }

  function goPrev() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex -= 1;
    updatePosition(true);
  }

  function normalizeIndex() {
    const originalsCount = originalCards.length;

    if (currentIndex >= originalsCount + visibleCount) {
      currentIndex = visibleCount;
      updatePosition(false);
    } else if (currentIndex < visibleCount) {
      currentIndex = originalsCount + visibleCount - 1;
      updatePosition(false);
    }

    isAnimating = false;
  }

  function handleTransitionEnd(event) {
    if (event.propertyName !== 'transform') return;
    normalizeIndex();
  }

  function stopAutoSlide() {
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoTimer = setTimeout(() => {
      goNext();
      startAutoSlide();
    }, slideDelay);
  }

  nextBtn.addEventListener('click', () => {
    goNext();
    startAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    goPrev();
    startAutoSlide();
  });

  track.addEventListener('transitionend', handleTransitionEnd);

  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);

  carousel.addEventListener('touchstart', (e) => {
    stopAutoSlide();
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    const threshold = 50;

    if (diff < -threshold) {
      goNext();
    } else if (diff > threshold) {
      goPrev();
    }

    startAutoSlide();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  });

  window.addEventListener('resize', () => {
    const newVisibleCount = getVisibleCount();
    if (newVisibleCount !== visibleCount) {
      setup();
    } else {
      updatePosition(false);
    }
  });

  function initSectionTitleUnderline() {
    const titles = document.querySelectorAll('.section-title');
    if (!titles.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-line-visible');
        obs.unobserve(entry.target);
      });
    }, {
      root: null,
      threshold: 0.45,
      rootMargin: '0px 0px -8% 0px'
    });

    titles.forEach((title) => observer.observe(title));
  }

  function initSideBubbles() {
    const rails = document.querySelectorAll('.bubble-rail');
    if (!rails.length) return;

    const populate = () => {
      const bubbleCount = window.innerWidth <= 768 ? 6 : 10;

      rails.forEach((rail, railIndex) => {
        rail.replaceChildren();

        for (let i = 0; i < bubbleCount; i += 1) {
          const bubble = document.createElement('span');
          bubble.className = 'bubble';

          const size = randomBetween(18, window.innerWidth <= 768 ? 52 : 72);
          const duration = randomBetween(12, 22);
          const swayDuration = randomBetween(4.8, 8.4);
          const delay = randomBetween(-18, 0);
          const swayDelay = randomBetween(-8, 0);
          const startOffset = randomBetween(-8, 8);
          const midOffset = randomBetween(-16, 16);
          const endOffset = randomBetween(-12, 12);
          const sway = randomBetween(8, 22) * (railIndex === 0 ? 1 : -1);
          const opacity = randomBetween(0.35, 0.8);
          const top = randomBetween(-12, 100);
          const sideInset = railIndex === 0
            ? randomBetween(2, 40)
            : randomBetween(60, 98);

          bubble.style.width = `${size}px`;
          bubble.style.height = `${size}px`;
          bubble.style.top = `${top}vh`;
          bubble.style.left = `${sideInset}%`;
          bubble.style.setProperty('--bubble-duration', `${duration}s`);
          bubble.style.setProperty('--bubble-sway-duration', `${swayDuration}s`);
          bubble.style.setProperty('--bubble-delay', `${delay}s`);
          bubble.style.setProperty('--bubble-sway-delay', `${swayDelay}s`);
          bubble.style.setProperty('--bubble-x-start', `${startOffset}px`);
          bubble.style.setProperty('--bubble-x-mid', `${midOffset}px`);
          bubble.style.setProperty('--bubble-x-end', `${endOffset}px`);
          bubble.style.setProperty('--bubble-sway', `${sway}px`);
          bubble.style.setProperty('--bubble-opacity', opacity.toFixed(2));

          rail.appendChild(bubble);
        }
      });
    };

    populate();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(populate, 180);
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function initReserveCtaReveal() {
    const ctaStack = document.querySelector('.cta-stack');
    if (!ctaStack) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        ctaStack.classList.add('is-reveal');
        obs.unobserve(entry.target);
      });
    }, {
      root: null,
      threshold: 0.5,
      rootMargin: '0px 0px -8% 0px'
    });

    observer.observe(ctaStack);
  }

  function initContactFormReveal() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        contactForm.classList.add('is-reveal');
        obs.unobserve(entry.target);
      });
    }, {
      root: null,
      threshold: 0.3,
      rootMargin: '0px 0px -6% 0px'
    });

    observer.observe(contactForm);
  }

  function initFloatingCtaVisibility() {
    const floatingCta = document.querySelector('.floating-cta');
    if (!floatingCta) return;

    const contactSection = document.querySelector('#contact');
    const footer = document.querySelector('.site-footer');

    const onScroll = () => {
      const showStart = Math.max(240, window.innerHeight * 0.3);
      if (window.scrollY >= showStart) {
        floatingCta.classList.remove('is-hidden');
      } else {
        floatingCta.classList.add('is-hidden');
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const watchTargets = [contactSection, footer].filter(Boolean);
    if (!watchTargets.length) return;

    const visibilityMap = new Map();
    const sync = () => {
      const shouldHide = Array.from(visibilityMap.values()).some(Boolean);
      floatingCta.classList.toggle('is-docked-hidden', shouldHide);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visibilityMap.set(entry.target, entry.isIntersecting);
      });

      sync();
    }, {
      root: null,
      threshold: 0.18,
      rootMargin: '0px 0px -12% 0px'
    });

    watchTargets.forEach((target) => {
      visibilityMap.set(target, false);
      observer.observe(target);
    });
  }
});

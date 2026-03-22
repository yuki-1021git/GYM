document.addEventListener('DOMContentLoaded', () => {
  initSectionTitleUnderline();

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
});
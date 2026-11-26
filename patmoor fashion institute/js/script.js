document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const applyTheme = (isDark) => {
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    };

    applyTheme(document.documentElement.dataset.theme === 'dark');

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme !== 'dark';
      applyTheme(isDark);
      localStorage.setItem('patmoor-theme', isDark ? 'dark' : 'light');

      if (nav && toggle) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const year = document.querySelector('#year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');

    if (!slides.length || !dotsContainer) return;

    let activeIndex = 0;
    let rotationTimeout;
    const dots = slides.map((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show slide ${index + 1}`);
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.append(dot);
      return dot;
    });

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.hidden = !isActive;
        dots[slideIndex].setAttribute('aria-pressed', String(isActive));

        const video = slide.querySelector('video');
        if (!video) return;

        if (isActive) {
          const playback = video.play();
          if (playback) {
            playback.catch((error) => {
              if (error.name === 'NotAllowedError') {
                video.controls = true;
              } else {
                console.error('Unable to play the studio video.', error);
              }
            });
          }
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    };

    if (previousButton) {
      previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
    }

    const pauseRotation = () => window.clearTimeout(rotationTimeout);
    const scheduleRotation = () => {
      pauseRotation();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      rotationTimeout = window.setTimeout(() => {
        if (!slides[activeIndex].querySelector('video')) {
          showSlide(activeIndex + 1);
        }
        scheduleRotation();
      }, 7000);
    };

    carousel.addEventListener('mouseenter', pauseRotation);
    carousel.addEventListener('mouseleave', scheduleRotation);
    carousel.addEventListener('focusin', pauseRotation);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        scheduleRotation();
      }
    });

    showSlide(0);
    scheduleRotation();
  });

  const filterButtons = document.querySelectorAll('[data-filter]');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));

        galleryItems.forEach((item) => {
          const matches = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !matches);
        });
      });
    });
  }

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const closeButton = document.querySelector('.lightbox-close');

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
  };

  document.querySelectorAll('[data-lightbox]').forEach((image) => {
    image.addEventListener('click', () => {
      openLightbox(image.src, image.alt);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const phoneNumber = form.dataset.whatsappNumber || '233242536902';
      const formTitle = form.dataset.title || 'Patmoor enquiry';

      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value.toString().trim();
      });

      const lines = [
        `Hello Patmoor Fashions, I’m contacting you regarding: ${formTitle}.`,
        '',
        `Name: ${payload.name || 'Not provided'}`,
        `Phone: ${payload.phone || 'Not provided'}`
      ];

      if (payload.interest) lines.push(`Area of interest: ${payload.interest}`);
      if (payload.category) lines.push(`Enquiry category: ${payload.category}`);
      if (payload.message) lines.push('', `Message: ${payload.message}`);

      const text = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    });
  });
});

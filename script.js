// ===== Gimnasio Campestre Cristiano — script ===== 
    // ===== INTRO: zoom-in con velo y silueta del logo (vectorial) =====
    (function () {
      'use strict';

      // ---- Medidas del SVG original del escudo GCC (viewBox 0 0 1697.67 853.04) ----
      const LOGO_W = 1697.67, LOGO_H = 853.04;
      const LOGO_CX = LOGO_W / 2, LOGO_CY = LOGO_H / 2;
      const MARK_CX = 833.5, MARK_CY = 359.5; // centro del escudo con el león

      // ---- Perillas del efecto (mismos valores/velocidad que la referencia) ----
      const BASE_WIDTH    = () => Math.min(innerWidth * 0.62, 620);
      const ZOOM_END      = 90;
      const WHEEL_TO_END  = 1700;
      const TOUCH_TO_END  = 480;
      const RECENTER_AT   = 0.35;
      const REVEAL_START  = 0.25;
      const REVEAL_END    = 0.48;
      const TEXT_FADE_END = 0.18;
      const FADE_FROM     = 0.80;
      const SNAP_AT       = 0.88;
      const IDLE_MS       = 170;

      const intro    = document.getElementById('intro');
      const veil     = document.getElementById('veil');
      const holeUse  = document.getElementById('hole-use');
      const solidUse = document.getElementById('solid-use');
      const textUse  = document.getElementById('text-use');
      const hint     = document.getElementById('intro-hint');
      const home     = document.getElementById('home');

      let progress = 0, finished = false, idleTimer = null, lastY = null;

      const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      function applyProgress() {
        const vw = innerWidth, vh = innerHeight;

        const base  = BASE_WIDTH() / LOGO_W;
        const scale = base * Math.pow(ZOOM_END, progress);

        const k  = easeOut(clamp(progress / RECENTER_AT, 0, 1));
        const ax = LOGO_CX + (MARK_CX - LOGO_CX) * k;
        const ay = LOGO_CY + (MARK_CY - LOGO_CY) * k;

        const t = `translate(${vw / 2 - ax * scale} ${vh / 2 - ay * scale}) scale(${scale})`;
        holeUse.setAttribute('transform', t);
        solidUse.setAttribute('transform', t);
        textUse.setAttribute('transform', t);

        // El texto (wordmark) solo se desvanece. Nunca es ventana.
        const textFade = clamp(progress / TEXT_FADE_END, 0, 1);
        textUse.style.opacity = String(1 - textFade);

        // Apertura: el escudo sólido se desvanece mientras el hueco se abre.
        const open = clamp((progress - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);
        const grey = Math.round(255 * (1 - open));
        holeUse.setAttribute('fill', `rgb(${grey},${grey},${grey})`);
        solidUse.style.opacity = String(1 - open);

        // Al final el velo se disuelve, para que no queden bordes raros.
        const fade = clamp((progress - FADE_FROM) / (1 - FADE_FROM), 0, 1);
        veil.style.opacity = String(1 - fade);
        hint.style.opacity = progress > 0.04 ? '0' : '';
      }

      function finish() {
        if (finished) return;
        finished = true;
        intro.style.display = 'none';
        document.body.style.overflow = '';
        if (home) home.removeAttribute('aria-hidden');
      }

      function snapToEnd() {
        const from = progress, t0 = performance.now(), dur = 300;
        (function tick(now) {
          const t = Math.min((now - t0) / dur, 1);
          progress = from + (1 - from) * easeOut(t);
          applyProgress();
          if (t < 1) requestAnimationFrame(tick);
          else finish();
        })(performance.now());
      }

      function addDelta(fraction) {
        if (finished) return;
        progress = clamp(progress + fraction, 0, 1);
        applyProgress();
        if (progress >= 1) return finish();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (progress >= SNAP_AT) snapToEnd();
        }, IDLE_MS);
      }

      document.body.style.overflow = 'hidden';

      veil.addEventListener('wheel', e => {
        if (finished) return;
        e.preventDefault();
        addDelta(e.deltaY / WHEEL_TO_END);
      }, { passive: false });

      veil.addEventListener('touchstart', e => { lastY = e.touches[0].clientY; }, { passive: true });
      veil.addEventListener('touchmove', e => {
        if (finished || lastY === null) return;
        e.preventDefault();
        const y = e.touches[0].clientY;
        addDelta((lastY - y) / TOUCH_TO_END);
        lastY = y;
      }, { passive: false });
      veil.addEventListener('touchend', () => { lastY = null; });

      addEventListener('keydown', e => {
        if (finished) return;
        if (e.key === 'Escape') { progress = 1; applyProgress(); finish(); }
        if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); addDelta(0.08); }
      });
      addEventListener('resize', applyProgress);

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        progress = 1; applyProgress(); finish();
      } else {
        applyProgress();
      }
    })();

    const pages = document.querySelectorAll('.page');

    function goTo(name){
      pages.forEach(p => p.classList.remove('active'));
      const target = document.getElementById('page-' + name);
      if(target) target.classList.add('active');

      document.querySelectorAll('.main-nav a[data-nav], .drawer nav a[data-nav]').forEach(a => {
        a.classList.toggle('active', a.dataset.nav === name);
      });

      window.scrollTo({top:0, behavior:'instant'});
      closeMenu();
    }

    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        goTo(link.dataset.nav);
      });
    });

    const menuBtn = document.getElementById('menuBtn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const drawerClose = document.getElementById('drawerClose');

    function openMenu(){
      drawer.classList.add('open');
      overlay.classList.add('show');
      menuBtn.classList.add('open');
    }
    function closeMenu(){
      drawer.classList.remove('open');
      overlay.classList.remove('show');
      menuBtn.classList.remove('open');
    }
    menuBtn.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeMenu() : openMenu();
    });
    drawerClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // ===== Toggle "Más secciones" dentro del menú lateral =====
    const moreToggle = document.getElementById('moreSectionsToggle');
    const moreSubmenu = document.getElementById('moreSectionsSubmenu');
    if (moreToggle && moreSubmenu) {
      moreToggle.addEventListener('click', () => {
        moreToggle.classList.toggle('open');
        moreSubmenu.classList.toggle('open');
      });
    }

    // ===== Carrusel de Convenios (coverflow, avanza cada 3s) =====
    (function initConveniosCarousel(){
      const track = document.getElementById('conveniosCarousel');
      if (!track) return;
      const slides = Array.from(track.querySelectorAll('.convenio-slide'));
      const total = slides.length;
      let centerIndex = 0;

      function render(){
        slides.forEach((slide, i) => {
          slide.classList.remove('is-center','is-left','is-right','is-hidden');
          const offset = (i - centerIndex + total) % total;
          if (offset === 0) slide.classList.add('is-center');
          else if (offset === 1) slide.classList.add('is-right');
          else if (offset === total - 1) slide.classList.add('is-left');
          else slide.classList.add('is-hidden');
        });
      }

      function advance(){
        centerIndex = (centerIndex + 1) % total;
        render();
      }

      render();
      setInterval(advance, 3000);
    })();

    // ===== Header: se encoge al hacer scroll =====
    (function initShrinkingHeader(){
      const header = document.querySelector('header');
      if (!header) return;
      const THRESHOLD = 40; // px de scroll antes de encoger

      function updateHeader(){
        if (window.scrollY > THRESHOLD) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      window.addEventListener('scroll', updateHeader, { passive: true });
      updateHeader();
    })();
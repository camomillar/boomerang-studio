// Pixel starfield background
(() => {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Far → near: smaller, dimmer, slower
  const LAYERS = [
    { density: 0.00012, size: 1, speed: 0.04, alpha: 0.35, parallax: 0.02 },
    { density: 0.00006, size: 2, speed: 0.09, alpha: 0.55, parallax: 0.05 },
    { density: 0.00002, size: 3, speed: 0.16, alpha: 0.85, parallax: 0.09 },
  ];

  let w, h, dpr, stars = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    LAYERS.forEach(layer => {
      const count = Math.round(w * h * layer.density);
      for (let i = 0; i < count; i++) {
        stars.push({
          layer,
          x: Math.random() * w,
          y: Math.random() * h,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.5 + Math.random() * 1.5,
        });
      }
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const scroll = window.scrollY;

    for (const s of stars) {
      const { size, speed, alpha, parallax } = s.layer;

      if (!reduceMotion) {
        s.x -= speed;          // drift left…
        s.y += speed * 0.35;   // …and slightly down
        if (s.x < -size) s.x += w + size;
        if (s.y > h) s.y -= h;
      }

      // Scroll parallax, wrapped so the field never runs out
      let y = (s.y - scroll * parallax) % h;
      if (y < 0) y += h;

      const flicker = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(t * 0.001 * s.twinkle + s.phase);
      ctx.globalAlpha = alpha * flicker;
      ctx.fillStyle = '#fff';
      // Snap to whole pixels so stars stay crisp squares
      ctx.fillRect(Math.round(s.x), Math.round(y), size, size);
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    draw(t);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduceMotion) {
    draw(0);
    window.addEventListener('scroll', () => draw(0), { passive: true });
  } else {
    requestAnimationFrame(loop);
  }
})();

// Ticker: repeat the items until one group is wider than the screen,
// then duplicate the group so translating by -50% loops with no gap.
(() => {
  const track = document.getElementById('tickerTrack');
  const group = track.querySelector('.ticker__group');
  const items = [...group.children].map(el => el.cloneNode(true));
  const SPEED = 40; // px per second

  function build() {
    group.replaceChildren(...items.map(el => el.cloneNode(true)));
    for (let i = 0; i < 20 && group.scrollWidth < window.innerWidth; i++) {
      items.forEach(el => group.appendChild(el.cloneNode(true)));
    }
    track.querySelectorAll('.ticker__group + .ticker__group').forEach(el => el.remove());
    track.appendChild(group.cloneNode(true));
    track.style.setProperty('--ticker-duration', `${group.scrollWidth / SPEED}s`);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });
  document.fonts.ready.then(build);
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.nav__links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Nav background once scrolled
const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Contact form: open the visitor's email app with the message pre-filled
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const field = id => this.querySelector('#' + id).value.trim();
  const name = field('name');
  const email = field('email');
  const message = field('message');
  const subject = `Hello from ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  window.location.href = `mailto:${this.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const success = document.getElementById('formSuccess');
  success.classList.add('visible');
  setTimeout(() => success.classList.remove('visible'), 6000);
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// At the very bottom the last section can't reach the middle of a tall screen,
// so highlight it explicitly
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#contact'));
  }
}, { passive: true });

// Game videos: play only while on screen; no autoplay for reduced motion
const videos = document.querySelectorAll('.game__video');
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  videos.forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
} else {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 });
  videos.forEach(v => videoObserver.observe(v));
}

// Fade-in on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Google Analytics 4 with cookie consent (UK GDPR): nothing loads until the visitor accepts,
// and only on the live domain so local testing isn't counted.
(() => {
  const GA_ID = 'G-3RX3QHB88C';
  const LIVE_HOST = 'boomeranggames.online';
  const KEY = 'analytics-consent';
  const banner = document.getElementById('consent');

  const getChoice = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const setChoice = v => { try { localStorage.setItem(KEY, v); } catch {} };

  let loaded = false;
  function loadAnalytics() {
    if (loaded || location.hostname !== LIVE_HOST) return;
    loaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }

  function stopAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    // remove GA cookies set earlier
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n.startsWith('_ga'))
      .forEach(n => {
        document.cookie = `${n}=; Max-Age=0; path=/`;
        document.cookie = `${n}=; Max-Age=0; path=/; domain=.${location.hostname}`;
      });
  }

  banner.addEventListener('click', e => {
    const choice = e.target.closest('[data-consent]')?.dataset.consent;
    if (!choice) return;
    setChoice(choice);
    banner.hidden = true;
    choice === 'granted' ? loadAnalytics() : stopAnalytics();
  });

  document.getElementById('cookieSettings').addEventListener('click', () => { banner.hidden = false; });

  const choice = getChoice();
  if (choice === 'granted') loadAnalytics();
  else if (!choice) banner.hidden = false;

  // Button / link click events (elements with data-event="...")
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-event]');
    if (el && loaded && window.gtag) {
      gtag('event', el.dataset.event, el.href ? { link_url: el.href } : {});
    }
  });
})();

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

// Contact form submit
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.classList.add('visible');
  this.reset();
  setTimeout(() => success.classList.remove('visible'), 5000);
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

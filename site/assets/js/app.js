import { translations } from './translations.js';

const languageSelect = document.querySelector('[data-language]');
const supported = Object.keys(translations);
const stored = localStorage.getItem('bph-language');
const browserLanguage = navigator.language || 'zh-TW';
const initialLanguage = stored || supported.find((code) => browserLanguage.toLowerCase().startsWith(code.toLowerCase().split('-')[0])) || 'zh-TW';

function applyLanguage(language) {
  const dictionary = translations[language] || translations['zh-TW'];
  document.documentElement.lang = language === 'zh-TW' ? 'zh-Hant' : language;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) node.textContent = dictionary[key];
  });
  languageSelect.value = language;
  localStorage.setItem('bph-language', language);
}

languageSelect.addEventListener('change', (event) => applyLanguage(event.target.value));
applyLanguage(initialLanguage);

const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

const nearbyNav = nav.querySelector('[href="#nearby"]');
if (nearbyNav) nearbyNav.href = './nearby.html';
const nearbySection = document.querySelector('#nearby');
if (nearbySection) {
  nearbySection.style.cursor = 'pointer';
  nearbySection.setAttribute('role', 'link');
  nearbySection.setAttribute('tabindex', '0');
  const openGuide = () => { window.location.href = './nearby.html'; };
  nearbySection.addEventListener('click', openGuide);
  nearbySection.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') openGuide();
  });
}

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

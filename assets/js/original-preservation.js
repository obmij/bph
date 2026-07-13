import './quick-services.js';

const PAGE_LINKS = new Map([
  ['', 'index.html'],
  ['home', 'index.html'],
  ['西門店', '西門店.html'],
  ['長春店', '長春店.html'],
  ['客房介紹_西門店', '客房介紹_西門店.html'],
  ['客房介紹_長春店', '客房介紹_長春店.html'],
  ['設施服務_西門店', '設施服務_西門店.html'],
  ['設施服務_長春店', '設施服務_長春店.html'],
  ['交通位置_西門店', '交通位置_西門店.html'],
  ['交通位置_長春店', '交通位置_長春店.html'],
  ['聯絡我們_西門店', '聯絡我們_西門店.html'],
  ['聯絡我們_長春店', '聯絡我們_長春店.html'],
  ['最新消息_西門店', '最新消息_西門店.html'],
  ['最新消息_長春店', '最新消息_長春店.html'],
  ['在地景點', '在地景點.html'],
  ['privacy', 'privacyG-9FSHBFBV0R.html'],
  ['20240101', '20240101.html'],
  ['20240102', '20240102.html'],
  ['20240103', '20240103.html'],
  ['my-post6f0d85f8', 'my-post6f0d85f8.html'],
  ['my-postbf07af70', 'my-postbf07af70.html'],
  ['my-postf4e9fce4', 'my-postf4e9fce4.html'],
]);

const MAPS = {
  ximen: {
    label: '西門棧',
    street: 'https://www.google.com/maps/search/?api=1&query=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E8%A5%BF%E9%96%80%E6%A3%A7%20%2B886-2-8978-3666',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E8%A5%BF%E9%96%80%E6%A3%A7%20%2B886-2-8978-3666',
  },
  changchun: {
    label: '長春棧',
    street: 'https://www.google.com/maps/search/?api=1&query=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E9%95%B7%E6%98%A5%E6%A3%A7%20%2B886-2-2518-0188',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E9%95%B7%E6%98%A5%E6%A3%A7%20%2B886-2-2518-0188',
  },
};

function localTarget(value) {
  if (!value || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:')) return null;
  let url;
  try {
    url = new URL(value, window.location.href);
  } catch {
    return null;
  }
  if (url.hostname && !['www.bph.com.tw', window.location.hostname].includes(url.hostname)) return null;
  const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
  const basename = decodedPath.split('/').pop() || '';
  const key = basename.replace(/\.html$/i, '');
  const target = PAGE_LINKS.get(key) || (basename.endsWith('.html') ? basename : null);
  return target ? `./${target}${url.search || ''}${url.hash || ''}` : null;
}

function localizeInternalLinks() {
  document.querySelectorAll('a').forEach((anchor) => {
    for (const attribute of ['href', 'runtime_url', 'data-runtime-url']) {
      const target = localTarget(anchor.getAttribute(attribute));
      if (target) anchor.setAttribute(attribute, target);
    }
  });

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    const target = localTarget(anchor.getAttribute('href'));
    if (!target) return;
    anchor.setAttribute('href', target);
  }, true);
}

function removeDesignCredit() {
  document.querySelectorAll('a[href*="inteamhg.com/webdesign"]').forEach((link) => {
    const paragraph = link.closest('p');
    if (paragraph) paragraph.remove();
    else link.remove();
  });
}

function setLogoHomeLink() {
  const candidates = document.querySelectorAll('header a, .dmHeader a, [id*="header"] a');
  for (const anchor of candidates) {
    if (anchor.querySelector('img') || /背包棧|BPH/i.test(anchor.textContent || '')) {
      anchor.setAttribute('href', './index.html');
      anchor.setAttribute('runtime_url', './index.html');
      break;
    }
  }
}

function removeBrandHomeItem() {
  document.querySelectorAll('a').forEach((anchor) => {
    if ((anchor.textContent || '').trim() === '品牌首頁') anchor.remove();
  });
}

function contactLocation() {
  const name = decodeURIComponent(window.location.pathname.split('/').pop() || '');
  if (name.includes('聯絡我們_西門店')) return 'ximen';
  if (name.includes('聯絡我們_長春店')) return 'changchun';
  return null;
}

function addContactMapButtons() {
  const key = contactLocation();
  if (!key || document.querySelector('[data-original-map-actions]')) return;
  const map = MAPS[key];
  const section = document.createElement('section');
  section.className = 'bph-original-map-actions';
  section.dataset.originalMapActions = '';
  section.innerHTML = `
    <div class="bph-original-map-actions__inner">
      <h2>${map.label}</h2>
      <div class="bph-original-map-actions__buttons">
        <a href="${map.street}" target="_blank" rel="noopener noreferrer">查看街景</a>
        <a href="${map.directions}" target="_blank" rel="noopener noreferrer">立即導航</a>
      </div>
    </div>`;
  const footer = document.querySelector('footer, .dmFooterContainer, #dmFooterContainer');
  if (footer?.parentNode) footer.parentNode.insertBefore(section, footer);
  else (document.querySelector('.dmBody') || document.body).appendChild(section);
}

function applyRequestedAdjustments() {
  localizeInternalLinks();
  removeDesignCredit();
  setLogoHomeLink();
  removeBrandHomeItem();
  addContactMapButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyRequestedAdjustments, { once: true });
} else {
  applyRequestedAdjustments();
}

const SERVICE_LABELS = {
  'zh-TW': {
    quick: '快捷服務',
    close: '關閉快捷服務',
    ximen: '西門棧',
    changchun: '長春棧',
    book: '快速訂房',
    call: '撥打電話',
    mapTitle: '門市位置',
    street: '查看街景',
    directions: '立即導航'
  },
  en: {
    quick: 'Quick services',
    close: 'Close quick services',
    ximen: 'Ximen',
    changchun: 'Changchun',
    book: 'Book now',
    call: 'Call',
    mapTitle: 'Locations',
    street: 'Street View',
    directions: 'Directions'
  },
  ja: {
    quick: 'クイックサービス',
    close: 'クイックサービスを閉じる',
    ximen: '西門店',
    changchun: '長春店',
    book: '今すぐ予約',
    call: '電話する',
    mapTitle: '所在地',
    street: 'ストリートビュー',
    directions: 'ナビを開始'
  },
  ko: {
    quick: '빠른 서비스',
    close: '빠른 서비스 닫기',
    ximen: '시먼점',
    changchun: '창춘점',
    book: '빠른 예약',
    call: '전화하기',
    mapTitle: '지점 위치',
    street: '거리뷰 보기',
    directions: '길찾기'
  },
  fr: {
    quick: 'Services rapides',
    close: 'Fermer les services rapides',
    ximen: 'Ximen',
    changchun: 'Changchun',
    book: 'Réserver',
    call: 'Appeler',
    mapTitle: 'Adresses',
    street: 'Voir la rue',
    directions: 'Itinéraire'
  },
  de: {
    quick: 'Schnellservice',
    close: 'Schnellservice schließen',
    ximen: 'Ximen',
    changchun: 'Changchun',
    book: 'Schnell buchen',
    call: 'Anrufen',
    mapTitle: 'Standorte',
    street: 'Street View',
    directions: 'Navigation'
  },
  es: {
    quick: 'Servicios rápidos',
    close: 'Cerrar servicios rápidos',
    ximen: 'Ximen',
    changchun: 'Changchun',
    book: 'Reservar ahora',
    call: 'Llamar',
    mapTitle: 'Ubicaciones',
    street: 'Ver la calle',
    directions: 'Cómo llegar'
  }
};

const LOCATIONS = {
  ximen: {
    booking: 'https://res.windsurfercrs.com/ibe/index.aspx?propertyID=17484&nono=1&lang=zh-tw&adults=2',
    phoneHref: 'tel:+886289783666',
    phoneText: '+886 2 8978 3666',
    street: 'https://www.google.com/maps/search/?api=1&query=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E8%A5%BF%E9%96%80%E6%A3%A7%20%2B886-2-8978-3666',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E8%A5%BF%E9%96%80%E6%A3%A7%20%2B886-2-8978-3666'
  },
  changchun: {
    booking: 'https://res.windsurfercrs.com/ibe/index.aspx?propertyID=17483&nono=1&lang=zh-tw&adults=2',
    phoneHref: 'tel:+886225180188',
    phoneText: '+886 2 2518 0188',
    street: 'https://www.google.com/maps/search/?api=1&query=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E9%95%B7%E6%98%A5%E6%A3%A7%20%2B886-2-2518-0188',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=%E8%83%8C%E5%8C%85%E6%A3%A7%E6%97%85%E5%BA%97%20%E9%95%B7%E6%98%A5%E6%A3%A7%20%2B886-2-2518-0188'
  }
};

function currentLanguage() {
  const selected = document.querySelector('[data-language]')?.value;
  const stored = localStorage.getItem('bph-language');
  const language = stored || selected || document.documentElement.lang || 'zh-TW';
  if (SERVICE_LABELS[language]) return language;
  if (language.toLowerCase().startsWith('zh')) return 'zh-TW';
  return Object.keys(SERVICE_LABELS).find((code) => language.toLowerCase().startsWith(code.toLowerCase())) || 'en';
}

function labels() {
  return SERVICE_LABELS[currentLanguage()] || SERVICE_LABELS['zh-TW'];
}

function locationCard(key, dictionary) {
  const location = LOCATIONS[key];
  return `
    <section class="quick-location quick-location-${key}">
      <h2>${dictionary[key]}</h2>
      <div class="quick-location-actions">
        <a class="quick-action quick-book" href="${location.booking}" target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">↗</span><span data-quick="book">${dictionary.book}</span>
        </a>
        <a class="quick-action quick-call" href="${location.phoneHref}">
          <span aria-hidden="true">☎</span><span>${location.phoneText}</span>
        </a>
      </div>
    </section>`;
}

function createQuickBar() {
  if (document.querySelector('[data-quick-services]')) return;
  const dictionary = labels();
  const aside = document.createElement('aside');
  aside.className = 'quick-services';
  aside.dataset.quickServices = '';
  aside.innerHTML = `
    <button class="quick-services-toggle" type="button" aria-expanded="false" aria-controls="quick-services-panel">
      <span class="quick-services-icon" aria-hidden="true">✦</span>
      <span data-quick="quick">${dictionary.quick}</span>
    </button>
    <div id="quick-services-panel" class="quick-services-panel" hidden>
      <div class="quick-services-heading">
        <strong data-quick="quick">${dictionary.quick}</strong>
        <button class="quick-services-close" type="button" aria-label="${dictionary.close}">×</button>
      </div>
      ${locationCard('ximen', dictionary)}
      ${locationCard('changchun', dictionary)}
    </div>`;

  document.body.appendChild(aside);
  document.body.classList.add('has-quick-services');

  const toggle = aside.querySelector('.quick-services-toggle');
  const close = aside.querySelector('.quick-services-close');
  const panel = aside.querySelector('.quick-services-panel');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    aside.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!aside.contains(event.target)) setOpen(false);
  });
}

function mapButtons(key, dictionary) {
  const location = LOCATIONS[key];
  const row = document.createElement('article');
  row.className = `map-service-row map-service-${key}`;
  row.innerHTML = `
    <h3 data-map-location="${key}">${dictionary[key]}</h3>
    <div class="map-service-buttons">
      <a class="button map-street" href="${location.street}" target="_blank" rel="noopener noreferrer" data-map-action="street">${dictionary.street}</a>
      <a class="button map-directions" href="${location.directions}" target="_blank" rel="noopener noreferrer" data-map-action="directions">${dictionary.directions}</a>
    </div>`;
  return row;
}

function enhanceContactSection() {
  if (document.querySelector('[data-map-services]')) return;
  const dictionary = labels();
  const pageLocation = document.body.dataset.location;
  let target = null;

  if (pageLocation) {
    target = document.querySelector('#contact');
  } else if (document.querySelector('[data-k="locationTitle"]')) {
    target = document.querySelector('[data-k="locationTitle"]')?.closest('.content-card');
  } else {
    target = document.querySelector('#contact');
  }

  if (!target) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'map-services';
  wrapper.dataset.mapServices = '';

  if (!pageLocation) {
    const title = document.createElement('h3');
    title.className = 'map-services-title';
    title.dataset.mapTitle = '';
    title.textContent = dictionary.mapTitle;
    wrapper.appendChild(title);
  }

  if (pageLocation === 'ximen' || pageLocation === 'changchun') {
    wrapper.appendChild(mapButtons(pageLocation, dictionary));
  } else {
    wrapper.appendChild(mapButtons('ximen', dictionary));
    wrapper.appendChild(mapButtons('changchun', dictionary));
  }

  target.appendChild(wrapper);
}

function refreshLanguage() {
  const dictionary = labels();
  document.querySelectorAll('[data-quick="quick"]').forEach((node) => { node.textContent = dictionary.quick; });
  document.querySelectorAll('[data-quick="book"]').forEach((node) => { node.textContent = dictionary.book; });
  const close = document.querySelector('.quick-services-close');
  if (close) close.setAttribute('aria-label', dictionary.close);
  const mapTitle = document.querySelector('[data-map-title]');
  if (mapTitle) mapTitle.textContent = dictionary.mapTitle;
  document.querySelectorAll('[data-map-location]').forEach((node) => {
    node.textContent = dictionary[node.dataset.mapLocation];
  });
  document.querySelectorAll('[data-map-action="street"]').forEach((node) => { node.textContent = dictionary.street; });
  document.querySelectorAll('[data-map-action="directions"]').forEach((node) => { node.textContent = dictionary.directions; });
}

function ensureStylesheet() {
  if (document.querySelector('link[data-quick-services-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './assets/css/quick-services.css';
  link.dataset.quickServicesStyle = '';
  document.head.appendChild(link);
}

ensureStylesheet();
createQuickBar();
enhanceContactSection();

const languageSelect = document.querySelector('[data-language]');
if (languageSelect) {
  languageSelect.addEventListener('change', () => requestAnimationFrame(refreshLanguage));
}
requestAnimationFrame(refreshLanguage);

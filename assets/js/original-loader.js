const filename = decodeURIComponent(window.location.pathname.split('/').pop() || '') || 'index.html';
const sourceUrl = new URL(`./www.bph.com.tw/${encodeURIComponent(filename)}`, window.location.href);

async function loadOriginalPage() {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Unable to load original page: ${response.status}`);
  let html = await response.text();
  html = html.replaceAll('../', './');
  if (!html.includes('original-preservation.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="./assets/css/quick-services.css"><link rel="stylesheet" href="./assets/css/original-preservation.css"></head>');
  }
  if (!html.includes('original-preservation.js')) {
    html = html.replace('</body>', '<script type="module" src="./assets/js/original-preservation.js"></script></body>');
  }
  document.open();
  document.write(html);
  document.close();
}

loadOriginalPage().catch((error) => {
  document.body.innerHTML = `<main style="font-family:sans-serif;padding:40px"><h1>BPH</h1><p>${error.message}</p><p><a href="./www.bph.com.tw/index.html">開啟原始網站</a></p></main>`;
});

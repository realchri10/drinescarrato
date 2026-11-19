// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Menu a tendina (Galleria)
document.querySelectorAll('.nav-dropdown').forEach(dd => {
  const btn = dd.querySelector('.nav-drop-toggle');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!dd.contains(e.target)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  dd.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  });
});

// Galleria immagini: visualizzazione a schermo intero
const lb = document.querySelector('.lightbox');
if (lb) {
  const items = [...document.querySelectorAll('.gallery-item')];
  const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  let i = 0;
  const show = (n) => {
    i = (n + items.length) % items.length;
    img.src = items[i].href; img.alt = items[i].querySelector('img').alt;
    cap.textContent = items[i].dataset.caption || '';
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; items[i].focus(); };
  items.forEach((a, n) => a.addEventListener('click', (e) => {
    e.preventDefault(); show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus();
  }));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
}

// Video di Instagram: caricati solo dopo il consenso del visitatore
const CONSENT_KEY = 'consenso-instagram';
const consent = {
  get() { try { return localStorage.getItem(CONSENT_KEY) === 'si'; } catch { return false; } },
  set(v) { try { v ? localStorage.setItem(CONSENT_KEY, 'si') : localStorage.removeItem(CONSENT_KEY); } catch {} }
};
let igScript;
function loadInstagram() {
  if (window.instgrm) { window.instgrm.Embeds.process(); return; }
  if (igScript) return;
  igScript = document.createElement('script');
  igScript.src = 'https://www.instagram.com/embed.js';
  igScript.async = true;
  igScript.onload = () => window.instgrm && window.instgrm.Embeds.process();
  document.body.appendChild(igScript);
}
function showReel(box) {
  if (box.dataset.loaded) return;
  box.dataset.loaded = '1';
  const url = 'https://www.instagram.com/reel/' + box.dataset.reel + '/';
  box.innerHTML = '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '" data-instgrm-version="14">' +
    '<a href="' + url + '" target="_blank" rel="noopener" class="reel-loading">Caricamento del video…</a></blockquote>';
}
const reels = document.querySelectorAll('.reel[data-reel]');
if (reels.length) {
  const bar = document.querySelector('.reel-consent-bar');
  const loadAll = () => { reels.forEach(showReel); loadInstagram(); if (bar) bar.hidden = true; };
  if (consent.get()) {
    loadAll();
  } else {
    if (bar) bar.hidden = false;
    reels.forEach(box => box.querySelector('.reel-load').addEventListener('click', () => {
      consent.set(true);
      loadAll();
    }));
    const all = document.querySelector('.reel-load-all');
    if (all) all.addEventListener('click', () => { consent.set(true); loadAll(); });
  }
}

// Pagina cookie: stato e revoca del consenso
const consentBox = document.querySelector('.consent-status');
if (consentBox) {
  const txt = consentBox.querySelector('.consent-text');
  const btn = consentBox.querySelector('.consent-revoke');
  const render = () => {
    const on = consent.get();
    txt.textContent = on
      ? 'Hai acconsentito al caricamento dei video di Instagram su questo dispositivo.'
      : 'Non hai acconsentito al caricamento dei video di Instagram: i video non vengono caricati finché non clicchi su uno di essi.';
    btn.hidden = !on;
  };
  btn.addEventListener('click', () => { consent.set(false); render(); });
  render();
}

// Anno nel footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Modulo contatti
const form = document.getElementById('contact-form');
if (form) {
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const action = form.getAttribute('action');

    // Nessun servizio configurato: apre il client di posta
    if (!action) {
      const to = form.dataset.mailto;
      const subject = encodeURIComponent('Richiesta dal sito – ' + data.get('nome'));
      const body = encodeURIComponent(
        'Nome: ' + data.get('nome') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('messaggio')
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      return;
    }

    // Invio tramite servizio esterno (es. Formspree)
    status.textContent = 'Invio in corso…';
    try {
      const res = await fetch(action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = 'Grazie! La tua richiesta è stata inviata.';
    } catch {
      status.textContent = 'Si è verificato un errore. Riprova o scrivici via email.';
    }
  });
}

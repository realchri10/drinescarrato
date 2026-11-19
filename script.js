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

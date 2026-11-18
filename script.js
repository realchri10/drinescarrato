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

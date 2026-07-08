/* ==========================================================================
   Portfolio — Aledji Ar-Rachad
   Interactions : menu mobile, navbar, animations au scroll, compteurs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    menuBtn.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Fermer le menu quand on clique sur un lien
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  /* ---------- Accordéon des compétences (catégories déroulantes) ---------- */
  document.querySelectorAll('.skill-head').forEach(head => {
    head.addEventListener('click', () => {
      const isOpen = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Navbar + barre de progression + retour haut ---------- */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progress-bar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    backToTop.classList.toggle('visible', window.scrollY > 500);
    // barre de progression de lecture
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const progress = scrollable > 0 ? h.scrollTop / scrollable : 0;
    progressBar.style.transform = 'scaleX(' + progress + ')';
  };

  /* ---------- Bouton retour en haut ---------- */
  const backToTop = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Animations d'apparition au scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom')
    .forEach(el => revealObserver.observe(el));

  /* ---------- Lien actif dans la navbar (scroll-spy) ----------
     Uniquement sur une page à ancres (#). En mode multipage, la classe
     "active" est déjà posée dans le HTML de chaque page → on ne touche à rien. */
  const links = document.querySelectorAll('.nav-link');
  const usesHashNav = [...links].some(l => (l.getAttribute('href') || '').startsWith('#'));
  if (usesHashNav) {
    const sections = document.querySelectorAll('main section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  /* ---------- Compteurs animés (statistiques du hero) ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easing "easeOutCubic" pour un effet doux
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ---------- Terminal interactif ---------- */
  initTerminal();

  /* ---------- Formulaire de contact ---------- */
  initContactForm();

  /* ---------- Année du footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});

/* ==========================================================================
   Terminal interactif
   ========================================================================== */
function initTerminal() {
  const body = document.getElementById('terminal-body');
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  if (!body || !output || !input) return;

  const history = [];
  let histIndex = -1;
  let awaitingPassword = false;
  const SUDO_PASSWORD = '12ak_H4ck';           // mot de passe du sudo (voir message)
  const termReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // miroir du texte tapé (pour le curseur bloc animé) — masque le mot de passe
  const typed = document.getElementById('term-typed');
  const renderTyped = () => {
    if (typed) typed.textContent = awaitingPassword ? '•'.repeat(input.value.length) : input.value;
  };
  input.addEventListener('input', renderTyped);

  const print = (html) => {
    const div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML = html;
    output.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };

  const commands = {
    help() {
      return [
        '<span class="term-yellow">Commandes disponibles :</span>',
        '  <span class="term-green">whoami</span>      Qui suis-je',
        '  <span class="term-green">about</span>       À propos de moi',
        '  <span class="term-green">skills</span>      Mes domaines de compétences',
        '  <span class="term-green">projects</span>    Mes projets phares',
        '  <span class="term-green">experience</span>  Mon parcours',
        '  <span class="term-green">contact</span>     Comment me joindre',
        '  <span class="term-green">social</span>      Mes liens (LinkedIn, GitHub, Credly)',
        '  <span class="term-green">certs</span>       Mes certifications',
        '  <span class="term-green">date</span>        Date et heure',
        '  <span class="term-green">banner</span>      Ma bannière ASCII',
        '  <span class="term-green">matrix</span>      Effet Matrix (stylé)',
        '  <span class="term-green">sudo</span>        Passe en mode root (mot de passe requis)',
        '  <span class="term-green">clear</span>       Nettoyer l\'écran'
      ].join('\n');
    },
    whoami() {
      return 'aledji <span class="term-muted">(alias <span class="term-cyan">12ak_H4ck</span>)</span> — <span class="term-cyan">Analyste SOC</span> / <span class="term-cyan">Administrateur Système &amp; Réseau</span> / <span class="term-purple">CTF Player</span>';
    },
    about() {
      return 'Étudiant en <span class="term-cyan">Licence SRI à l\'ESIG</span> (Lomé, Togo).\nPassionné de Blue Team, d\'automatisation SOC et de réseau. Offensif ET défensif. 100% open-source.';
    },
    skills() {
      return [
        '<span class="term-yellow">Domaines :</span>',
        '  • <span class="term-green">Blue Team</span>   : Wazuh, Splunk, Suricata, Zeek, TheHive, Cortex, MISP',
        '  • <span class="term-green">Réseau</span>      : GNS3, Cisco, VLAN, OSPF, HSRP, pfSense, FortiGate',
        '  • <span class="term-green">Supervision</span> : Prometheus, Grafana, Zabbix, Nagios, Graylog',
        '  • <span class="term-green">Dev/Auto</span>    : Python, Flask, bots Telegram, MQL5',
        '<span class="term-muted">→ Va voir la section "Compétences" pour tout le détail.</span>'
      ].join('\n');
    },
    projects() {
      return [
        '<span class="term-yellow">Projets phares :</span>',
        '  1. Plateforme SOC automatisée (réponse &lt; 30s) — Splunk, TheHive, MISP',
        '  2. Architecture de détection autonome (5 couches)',
        '  3. Infrastructure sécurisée pfSense + AD + Graylog',
        '  4. Infrastructure multi-sites Cisco (OSPF, HSRP)',
        '  5. Simulation GNS3 + FortiGate',
        '<span class="term-muted">→ Section "Projets" : clique pour dérouler + voir les posts LinkedIn.</span>'
      ].join('\n');
    },
    experience() {
      return 'En cours — <span class="term-cyan">Licence SRI, ESIG</span>\nJuillet 2025 — <span class="term-cyan">Stagiaire, ASLER CONNECT</span> (réseau, Wi-Fi, vidéosurveillance)';
    },
    contact() {
      return 'Email : <span class="term-cyan">aledjiarrachad1@gmail.com</span>\n<span class="term-muted">&gt; Ou utilise le formulaire de la page Contact.</span>';
    },
    social() {
      return [
        'LinkedIn : <a class="term-link" href="https://www.linkedin.com/in/ar-rachad-aledji" target="_blank" rel="noopener">ar-rachad-aledji</a>',
        'GitHub   : <a class="term-link" href="https://github.com/Rachkpt" target="_blank" rel="noopener">Rachkpt</a>',
        'Credly   : <a class="term-link" href="https://www.credly.com/users/aledji-ar-rachad" target="_blank" rel="noopener">aledji-ar-rachad</a>'
      ].join('\n');
    },
    certs() {
      return 'Mes certifications sont sur Credly :\n<a class="term-link" href="https://www.credly.com/users/aledji-ar-rachad" target="_blank" rel="noopener">credly.com/users/aledji-ar-rachad</a>';
    },
    date() { return new Date().toString(); },
    banner() {
      return '<span class="term-green">' +
        '    _    _          _  _ _ \n' +
        '   / \\  | | ___  __| |(_|_)\n' +
        '  / _ \\ | |/ _ \\/ _` || | |\n' +
        ' / ___ \\| |  __/ (_| || | |\n' +
        '/_/   \\_\\_|\\___|\\__,_|/ |_|\n' +
        '                    |__/   ' +
        '</span>\n<span class="term-muted">12ak_H4ck — SOC &amp; Réseau</span>';
    },
    sudo() {
      awaitingPassword = true;
      input.type = 'password';
      input.placeholder = 'mot de passe…';
      return '<span class="term-yellow">[sudo] mot de passe pour visitor :</span> <span class="term-muted">(indice : mon pseudo)</span>';
    },
    matrix() {
      runMatrix(6000);
      return '<span class="term-green">Wake up, Neo... (Matrix pendant ~6 s)</span>';
    },
    ls() {
      return '<span class="term-cyan">about.txt  skills/  projects/  cv.pdf  contact.sh</span>';
    },
    echo(args) { return args.join(' '); },
    clear() { output.innerHTML = ''; return null; }
  };

  // Vérification du mot de passe sudo
  function checkPassword(pw) {
    input.type = 'text';
    input.placeholder = 'help';
    awaitingPassword = false;
    print('<span class="term-muted">••••••••</span>');
    if (pw === SUDO_PASSWORD) {
      // secousse "boom" de l'écran du terminal
      body.classList.add('boom');
      setTimeout(() => body.classList.remove('boom'), 600);

      print('<span class="term-green">[+] Accès root accordé. Bienvenue, maître.</span>');
      print('<span class="term-red" style="font-size:1.1em;font-weight:700">&gt;&gt;&gt;   B O O M  !   &lt;&lt;&lt;</span>');
      print(
        '<span class="term-boom-box">' +
        '<span class="term-yellow">[*] CONTACT SECRET DÉBLOQUÉ</span>\n' +
        '    Email    : <a class="term-link" href="mailto:aledjiarrachad1@gmail.com">aledjiarrachad1@gmail.com</a>\n' +
        '    WhatsApp : <a class="term-link" href="https://wa.me/22893153850" target="_blank" rel="noopener">+228 93 15 38 50</a>' +
        '</span>'
      );
      print('<span class="term-muted">Astuce : clique sur le numéro pour m\'écrire directement sur WhatsApp.</span>');
    } else {
      print('<span class="term-red">[!] Mot de passe incorrect.</span> <span class="term-muted">Tentative journalisée.</span>');
    }
  }

  // Animation "Matrix" (pluie de caractères) superposée au terminal
  function runMatrix(duration) {
    const term = body.closest('.terminal');
    if (!term || termReduceMotion) return;
    const old = term.querySelector('.matrix-canvas');
    if (old) old.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    canvas.width = term.clientWidth;
    canvas.height = term.clientHeight;
    term.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const chars = 'アイウエオカキクケコ0123456789ABCDEF@#$%&*<>/'.split('');
    const fontSize = 14;
    const cols = Math.max(1, Math.floor(canvas.width / fontSize));
    const drops = new Array(cols).fill(0).map(() => Math.random() * -20);
    const start = performance.now();

    (function draw(now) {
      ctx.fillStyle = 'rgba(11, 16, 32, 0.10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3fb950';
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      if (now - start < duration) {
        requestAnimationFrame(draw);
      } else {
        canvas.style.transition = 'opacity 0.6s ease';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.remove(), 600);
      }
    })(start);
  }

  const aliases = { '?': 'help', 'man': 'help', 'ping': 'social', 'cv': 'contact', 'neo': 'matrix', 'root': 'sudo' };

  function run(raw) {
    const line = raw.trim();
    print('<span class="term-green">visitor@portfolio</span><span class="term-cyan">:~$</span> <span class="term-cmd-echo">' + escapeHtml(line) + '</span>');
    if (!line) return;
    history.push(line); histIndex = history.length;

    const parts = line.split(/\s+/);
    let cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (aliases[cmd]) cmd = aliases[cmd];

    if (commands[cmd]) {
      const res = commands[cmd](args);
      if (res !== null && res !== undefined) print(res);
    } else {
      print('<span class="term-red">commande introuvable :</span> ' + escapeHtml(cmd) +
            '\n<span class="term-muted">tape</span> <span class="term-green">help</span> <span class="term-muted">pour voir la liste.</span>');
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // message de bienvenue
  print('<span class="term-green">Bienvenue sur le terminal d\'Aledji — alias <span class="term-cyan">12ak_H4ck</span>.</span>');
  print('<span class="term-muted">Tape</span> <span class="term-green">help</span> <span class="term-muted">et appuie sur Entrée.</span>');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (awaitingPassword) {           // saisie du mot de passe sudo
        checkPassword(input.value);
        input.value = '';
        renderTyped();
        return;
      }
      run(input.value);
      input.value = '';
      renderTyped();
    } else if (e.key === 'ArrowUp' && !awaitingPassword) {
      if (histIndex > 0) { histIndex--; input.value = history[histIndex]; }
      renderTyped();
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && !awaitingPassword) {
      if (histIndex < history.length - 1) { histIndex++; input.value = history[histIndex]; }
      else { histIndex = history.length; input.value = ''; }
      renderTyped();
      e.preventDefault();
    }
  });

  // cliquer n'importe où dans le terminal met le focus sur l'entrée
  body.addEventListener('click', () => input.focus());
}

/* ==========================================================================
   Formulaire de contact (FormSubmit AJAX + repli envoi classique)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const btn = document.getElementById('contact-submit');
  const EMAIL = 'aledjiarrachad1@gmail.com';

  // Endpoint AJAX FormSubmit : envoi direct dans la boîte mail, sans ouvrir le client du visiteur.
  const ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-spam : si le honeypot est rempli, c'est un bot → on ignore silencieusement.
    const honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    const data = new FormData(form);
    const name = (data.get('name') || '').toString();

    btn.classList.add('is-sending');
    setStatus('Envoi en cours…', '');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });
      const json = await res.json().catch(() => ({}));
      // FormSubmit renvoie success = "true" (chaîne) ou true (booléen)
      if (json.success === true || json.success === 'true') {
        form.reset();
        setStatus('Merci ' + name + ' ! Ton message a bien été envoyé. Je te réponds vite.', 'ok');
        btn.classList.remove('is-sending');
        return;
      }
      // Réponse inattendue (souvent : email pas encore activé la 1re fois)
      // → on bascule sur l'envoi classique qui gère l'activation proprement.
      setStatus('Finalisation de l\'envoi…', '');
      form.submit();
    } catch (err) {
      // fetch impossible (test en local file://, hors-ligne, service bloqué)
      // → envoi classique du formulaire (fonctionne une fois le site en ligne).
      setStatus('Finalisation de l\'envoi…', '');
      form.submit();
    }
  });

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form-status' + (type ? ' ' + type : '');
  }
}

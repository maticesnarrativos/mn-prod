document.addEventListener('DOMContentLoaded', () => {
  // helper to wait for element presence (safe if HTML is dynamic)
  function waitForEl(selector) {
    return new Promise(resolve => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const obs = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Decode HTML entities safely
  function decodeEntities(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

   // Remove control characters (avoid control-char regex to satisfy linter)
  function removeControlChars(s) {
    if (typeof s !== 'string' || s.length === 0) return '';
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      // keep printable ASCII and above, skip 0-31 and 127
      if (code >= 32 && code !== 127) out += s.charAt(i);
    }
    return out;
  }

  // Remove HTML tags, trim, collapse spaces and strip disallowed chars
  function sanitizeName(raw) {
    if (typeof raw !== 'string') return '';
    const noTags = raw.replace(/<\/?[^>]+(>|$)/g, '');
    const decoded = decodeEntities(noTags);
    const cleaned = removeControlChars(decoded).replace(/\s+/g, ' ').trim();
    // Compatible whitelist: letters (basic + accented Latin range), numbers, spaces, hyphen, apostrophe
    return cleaned.replace(/[^A-Za-z0-9\s\-\u00C0-\u017F']/g, '').trim();
  }

  function sanitizeSeed(raw) {
    if (typeof raw !== 'string') return '';
    // remove tags
    const noTags = raw.replace(/<\/?[^>]+(>|$)/g, '');
    // decode entities
    const decoded = decodeEntities(noTags);
    // remove control chars, collapse whitespace, trim
    let cleaned = removeControlChars(decoded).replace(/\s+/g, ' ').trim();
    // keep only safe characters and limit length
    cleaned = cleaned.replace(/[^A-Za-z0-9\-_ ]/g, '').slice(0, 100);
    return cleaned;
  }

  function parseNames(text) {
    if (!text) return [];
    const parts = text.split(/[\n\r,;|\t]+/);
    const names = parts.map(p => sanitizeName(p)).filter(n => n.length >= 2);
    return names;
  }

  // --- seeded RNG helpers ---
  function hashStringToSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // --- end seeded RNG helpers ---

  // UI updater
  function updateUI(names, els) {
    els.processedNames = names;
    els.listEl.innerHTML = '';
    names.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n;
      els.listEl.appendChild(li);
    });
    els.countEl.textContent = `Nombres procesados: ${names.length}`;
    els.resultEl.textContent = '';
    els.pickBtn.disabled = names.length === 0;
  }

  // file reader
  async function handleFile(file) {
    if (!file) return [];
    const text = await file.text();
    return parseNames(text);
  }

  // wire up when elements are available
  Promise.all([
    waitForEl('#draw-file'),
    waitForEl('#draw-text'),
    waitForEl('#draw-seed'),
    waitForEl('#draw-parse'),
    waitForEl('#draw-clear'),
    waitForEl('#draw-pick'),
    waitForEl('#draw-list'),
    waitForEl('#draw-count'),
    waitForEl('#draw-result')
  ]).then(([
    fileInput, textArea, seedInput, parseBtn, clearBtn, pickBtn, listEl, countEl, resultEl
  ]) => {
    const els = { fileInput, textArea, seedInput, parseBtn, clearBtn, pickBtn, listEl, countEl, resultEl, processedNames: [] };

    // file change: parse file immediately
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (!['txt','csv'].includes(ext)) {
        alert('Formato no soportado. Usa .txt o .csv');
        fileInput.value = '';
        return;
      }
      const names = await handleFile(f);
      updateUI(names, els);
    });

    // Procesar Lista button: prefer file if present, otherwise textarea
    parseBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (fileInput.files && fileInput.files[0]) {
        const names = await handleFile(fileInput.files[0]);
        updateUI(names, els);
        return;
      }
      const text = textArea.value || '';
      const names = parseNames(text);
      updateUI(names, els);
    });

    // Limpiar button
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.value = '';
      textArea.value = '';
      seedInput.value = '';
      updateUI([], els);
    });

    // Pick winner
    pickBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const names = els.processedNames || [];
      if (!names.length) return;
      const rawSeed = (els.seedInput && els.seedInput.value) || '';
      const seedRaw = sanitizeSeed(rawSeed);
      let idx;
      if (seedRaw) {
        // numeric seed uses value as-is, otherwise hash string to uint32
        const seedNum = (/^\d+$/.test(seedRaw)) ? (parseInt(seedRaw, 10) >>> 0) : hashStringToSeed(seedRaw);
        const rng = mulberry32(seedNum);
        idx = Math.floor(rng() * names.length);
      } else {
        idx = Math.floor(Math.random() * names.length);
      }

     const winner = names[idx];
      const title = `🎉 Ganador (#${idx + 1} de ${names.length})`;
      const seedLine = seedRaw ? `semilla utilizada: "${seedRaw}"` : '';
      showWinnerModal({ titleText: title, winnerText: winner, seedText: seedLine });
    });

  // ---- modal + confetti helper ----
  function showWinnerModal({ titleText, winnerText, seedText }) {
    const modal = document.getElementById('draw-winner-modal');
    if (!modal) return;
    const textEl = document.getElementById('modal-winner-text');
    const seedEl = document.getElementById('modal-winner-seed');
    const titleEl = document.getElementById('modal-winner-title');
    const confettiRoot = modal.querySelector('.confetti');
    titleEl.textContent = titleText || 'Ganador';
    textEl.textContent = winnerText;
    seedEl.textContent = seedText || '';

    // create confetti pieces
    confettiRoot.innerHTML = '';
    const colors = ['#ff6b6b','#ffd166','#6bcB77','#4d96ff','#c084fc','#ff9f43'];
    const pieces = 50;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    // radius large enough to reach edges
    const maxRadius = Math.sqrt(vw * vw + vh * vh) * 0.7;

    for (let i = 0; i < pieces; i++) {
      const p = document.createElement('span');
      p.className = 'piece';

      // random angle and radius for spread (center burst)
      const angle = Math.random() * Math.PI * 2;
      const radius = (0.4 + Math.random() * 0.9) * maxRadius; // 0.4-1.3 * maxRadius
      const dx = Math.round(Math.cos(angle) * radius); // px
      const dy = Math.round(Math.sin(angle) * radius); // px

      // timings
      const fallDelay = (Math.random() * 0.35).toFixed(2) + 's';
      const fallDur = (1.6 + Math.random() * 1.6).toFixed(2) + 's';
      const spinDelay = (Math.random() * 0.25).toFixed(2) + 's';
      const spinDur = (0.8 + Math.random() * 1.4).toFixed(2) + 's';

      // size & color
      const w = 6 + Math.round(Math.random() * 12);
      const h = 10 + Math.round(Math.random() * 10);

      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.setProperty('--dur', fallDur);
      p.style.setProperty('--delay', fallDelay);
      p.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');

      p.style.left = '50%';
      p.style.top = '50%';
      p.style.width = w + 'px';
      p.style.height = h + 'px';

      // inner shard for rotation
      const shard = document.createElement('i');
      shard.className = 'shard';
      shard.style.background = colors[i % colors.length];
      shard.style.display = 'block';
      shard.style.width = '100%';
      shard.style.height = '100%';
      shard.style.borderRadius = '2px';
      shard.style.setProperty('--spinDur', spinDur);
      shard.style.setProperty('--spinDelay', spinDelay);
      shard.style.setProperty('--spinEnd', (Math.random() * 720 - 360).toFixed(0) + 'deg');

      p.appendChild(shard);
      confettiRoot.appendChild(p);
    }

    // show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // auto remove confetti after animation
    setTimeout(() => {
      if (confettiRoot) confettiRoot.innerHTML = '';
    }, 3800);

    // close handlers
    function close() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKey);
      modal.removeEventListener('click', onClick);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    function onClick(e) { if (e.target.classList.contains('draw-winner-backdrop') || e.target.classList.contains('draw-winner-close')) close(); }
    document.addEventListener('keydown', onKey);
    modal.addEventListener('click', onClick);
  }
  // ---- end modal helper ----
    // small UX: allow Enter in textarea to process (with Ctrl/Meta to allow newline)
    /* textArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) return; // allow new line
      if (e.key === 'Enter') {
        e.preventDefault();
        parseBtn.click();
      }
    }); */
  }).catch(err => {
    // If something unexpected happened, log for debugging
    console.error('draw.js init error:', err);
  });
});
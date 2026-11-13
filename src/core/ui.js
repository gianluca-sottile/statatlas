/* StatAtlas · core/ui.js — componenti, codice R, esportazioni, drawer */
var SA = window.SA || (window.SA = {});

SA.ui = (function () {
  /* el('div.cls#id', {attr}, children...) */
  function el(spec, attrs) {
    var m = spec.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i), tag = m[1] || 'div';
    var e = document.createElement(tag);
    (m[2].match(/[.#][\w-]+/g) || []).forEach(function (t) {
      if (t[0] === '.') e.classList.add(t.slice(1)); else e.id = t.slice(1);
    });
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    (function add(list) {
      list.forEach(function (c) {
        if (c == null || c === false) return;
        if (Array.isArray(c)) add(c);
        else e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
      });
    })(kids);
    return e;
  }

  var ICONS = {
    play: '<path d="M5 3l8 5-8 5z" fill="currentColor"/>',
    pause: '<path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor"/>',
    step: '<path d="M3 3l7 5-7 5zM11 3h2v10h-2z" fill="currentColor"/>',
    reset: '<path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5V5h2.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    fast: '<path d="M2 3l6 5-6 5zM8 3l6 5-6 5z" fill="currentColor"/>',
    copy: '<rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H10" stroke="currentColor" fill="none" stroke-width="1.4"/>',
    download: '<path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M3 13h10" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round"/>',
    book: '<path d="M2 3.5C4 2.5 6 2.5 8 4c2-1.5 4-1.5 6-.5V13c-2-1-4-1-6 .5C6 12 4 12 2 13z" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 4v9.5" stroke="currentColor" stroke-width="1.4"/>',
    sun: '<circle cx="8" cy="8" r="3" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    moon: '<path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/>',
    menu: '<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    close: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };
  function icon(name) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name]; return s;
  }
  function button(label, opts) {
    opts = opts || {};
    var b = el('button.btn' + (opts.cls ? '.' + opts.cls.split(' ').join('.') : ''),
      { type: 'button', title: opts.title || null, 'aria-label': opts.aria || null, onclick: opts.onclick || null });
    if (opts.icon) b.appendChild(icon(opts.icon));
    if (label) b.appendChild(document.createTextNode(label));
    return b;
  }

  function toast(msg) {
    var t = document.querySelector('.toast') || document.body.appendChild(el('div.toast', { role: 'status' }));
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function download(name, content, type) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function copy(text) {
    var done = function () { toast('Codice copiato'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done);
    else {
      var ta = el('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done();
    }
  }

  /* Evidenziazione R minimale */
  function highlightR(src) {
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var re = /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?L?)\b|\b(function|if|else|for|in|while|return|break|next|TRUE|FALSE|NULL|NA|Inf|library)\b|([A-Za-z_.][\w.]*)(?=\()/g;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : m[4] ? 'k' : 'f';
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  function codeBlock(getCode, filename) {
    var pre = el('pre', { tabindex: '0', 'aria-label': 'Codice R' });
    var box = el('div.code',
      el('div.code-bar', el('span', 'R · tidyverse'),
        el('div.toolbar',
          button('Copia', { icon: 'copy', cls: 'btn-ghost', onclick: function () { copy(getCode()); } }),
          button('Scarica .R', { icon: 'download', cls: 'btn-ghost', onclick: function () { download(filename, getCode()); } }))),
      pre);
    box.refresh = function () { pre.innerHTML = highlightR(getCode()); };
    box.refresh();
    return box;
  }

  /* Esporta uno o più SVG in un PNG unico, con intestazione */
  function exportPNG(svgs, filename, header) {
    var t = SA.theme(), scale = 2, W = 0, H = 0, pad = 24, headH = header ? 54 : 0;
    var dims = svgs.map(function (s) { var vb = s.viewBox.baseVal; W = Math.max(W, vb.width); H += vb.height + 12; return vb; });
    var cv = document.createElement('canvas');
    cv.width = (W + 2 * pad) * scale; cv.height = (H + headH + 2 * pad) * scale;
    var ctx = cv.getContext('2d'); ctx.scale(scale, scale);
    ctx.fillStyle = t.card || '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (header) {
      ctx.fillStyle = t.ink; ctx.font = '600 17px ' + t.serif; ctx.fillText(header[0], pad, pad + 14);
      ctx.fillStyle = t.ink_3; ctx.font = '12px ' + t.sans; ctx.fillText(header[1] || '', pad, pad + 34);
    }
    var y = pad + headH, i = 0;
    (function next() {
      if (i >= svgs.length) { cv.toBlob(function (b) { download(filename, b); toast('Figura esportata'); }); return; }
      var s = svgs[i], vb = dims[i], img = new Image();
      var xml = new XMLSerializer().serializeToString(s);
      img.onload = function () { ctx.drawImage(img, pad, y, vb.width, vb.height); y += vb.height + 12; i++; next(); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    })();
  }

  function csv(rows) {
    return rows.map(function (r) {
      return r.map(function (v) { return typeof v === 'number' ? (isFinite(v) ? +v.toPrecision(15) : String(v)) : '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n') + '\n';
  }

  /* Drawer "Approfondisci" con due livelli */
  var drawer, drawerBody, drawerTitle, backdrop, lastFocus, levels, currentLevel = 'base';
  function initDrawer() {
    drawerTitle = el('h2', { id: 'drawer-title', style: 'margin:0;font-size:1.2rem' });
    levels = el('div.seg.seg-tabs', { role: 'group', 'aria-label': 'Sezione' },
      [['base', 'Essenziale'], ['adv', 'Avanzato'], ['ex', 'Esercizi'], ['ref', 'Bibliografia']].map(function (l, i) {
        return el('button', { type: 'button', 'data-level': l[0], 'aria-pressed': String(!i) }, l[1]);
      }));
    levels.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      currentLevel = b.dataset.level; renderLevel();
    });
    drawerBody = el('div.drawer-body');
    drawer = el('aside.drawer', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'drawer-title', 'aria-hidden': 'true' },
      el('div.drawer-head', el('div', { style: 'display:flex;justify-content:space-between;align-items:flex-start;gap:12px' },
        el('div', el('div.step-label', 'Approfondisci'), drawerTitle),
        button('', { icon: 'close', cls: 'btn-ghost btn-icon', aria: 'Chiudi', onclick: closeDrawer })), levels),
      drawerBody);
    backdrop = el('div.drawer-backdrop', { onclick: closeDrawer });
    document.body.append(drawer, backdrop);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  }
  var content = null;
  /* Contenuti estesi da SA.content[lab corrente]: si aggiungono a quelli propri del laboratorio */
  function extended(level) {
    var c = SA.content && SA.content[SA.currentLab], box = el('div');
    if (level === 'base') {
      if (c) box.appendChild(el('div.objectives', el('div.step-label', 'Obiettivi di apprendimento'), el('ul', c.obiettivi.map(function (o) { return el('li', o); }))));
      box.appendChild(content.base());
      if (c) box.append(el('div.prose', { html: '<h3>Un esempio svolto</h3><div class="box ex">' + c.esempio + '</div>' }),
        el('div.prose', el('h3', 'Errori frequenti'), el('ul.errlist', c.errori.map(function (e) { return el('li', { html: e }); }))));
    } else if (level === 'adv') {
      box.appendChild(content.adv());
      if (c) box.appendChild(el('div.prose', { html: '<h3 class="sep">Per andare oltre</h3>' + c.avanzato }));
    } else if (level === 'ex') {
      if (!c) return el('p.muted', 'Esercizi in preparazione.');
      box.appendChild(el('p.muted', 'Prova a risolvere ciascun esercizio prima di aprire la soluzione. Molti si verificano direttamente nel laboratorio.'));
      c.esercizi.forEach(function (q, i) {
        box.appendChild(el('div.exercise', el('div.ex-num', String(i + 1)), el('div', el('p', { html: q[0] }),
          el('details', el('summary', 'Mostra la soluzione'), el('p', { html: q[1] })))));
      });
    } else {
      if (!c) return el('p.muted', 'Bibliografia in preparazione.');
      box.append(el('p.muted', 'Testi e articoli per approfondire i temi del laboratorio.'), el('ol.refs', c.riferimenti.map(function (r) { return el('li', r); })));
    }
    return box;
  }
  /* Formato delle schede: riquadri con intestazione (def, thm, ex, nota), formule composte e numerate,
   * indice interno quando la scheda ha almeno quattro sezioni. */
  var BOX = { def: 'Definizione', thm: 'Risultato', ex: 'Esempio', nota: 'Nota' };
  function decorate(box) {
    box.querySelectorAll('.box').forEach(function (b) {
      if (b.querySelector(':scope > .box-t')) return;
      var kind = Object.keys(BOX).filter(function (k) { return b.classList.contains(k); })[0];
      var t = b.getAttribute('data-title') || (kind ? BOX[kind] : null); if (t) b.insertBefore(el('span.box-t', t), b.firstChild);
    });
    if (SA.math) SA.math.typeset(box);
    var hs = box.querySelectorAll('h3');
    if (hs.length >= 4) {
      var toc = el('nav.sheet-toc', { 'aria-label': 'Indice della scheda' }, el('span.box-t', 'In questa scheda'), el('ol', Array.prototype.map.call(hs, function (h) {
        return el('li', el('button', { type: 'button', onclick: function () { h.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, h.textContent));
      })));
      var first = box.querySelector('.objectives'); if (first) first.parentNode.insertBefore(toc, first.nextSibling); else box.insertBefore(toc, box.firstChild);
    }
    return box;
  }
  function renderLevel() {
    levels.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.level === currentLevel)); });
    drawerBody.innerHTML = '';
    drawerBody.appendChild(decorate(extended(currentLevel)));
    drawerBody.scrollTop = 0;
  }
  function openDrawer(title, c, level) {
    if (!drawer) initDrawer();
    content = c; currentLevel = level || currentLevel;
    drawerTitle.textContent = title; renderLevel();
    lastFocus = document.activeElement;
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); backdrop.classList.add('show');
    drawer.querySelector('.drawer-head button[data-level="' + currentLevel + '"]').focus();
  }
  function closeDrawer() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); backdrop.classList.remove('show');
    if (lastFocus) lastFocus.focus();
  }

  function badge(status) {
    var map = { exact: ['st-exact', 'esatto'], asym: ['st-asym', 'asintotico'], approx: ['st-approx', 'approssimato'], mc: ['st-mc', 'Monte Carlo'], none: ['', ''] };
    var b = map[status] || map.none;
    return el('span.badge.' + (b[0] || 'x'), b[1]);
  }

  /* Sezione numerata dell'anatomia del laboratorio */
  function step(num, label, title) {
    var body = el('div.step-body', el('div.step-label', label), title ? el('h2', title) : null);
    var sec = el('section.step', el('div.step-num', { 'aria-hidden': 'true' }, num), body);
    sec.body = body; return sec;
  }

  /* Motore di animazione condiviso: avvia/pausa, passo, completa, ricomincia, velocità.
   * o.step() → false a esperimento concluso; o.render(full); o.reset(); o.done(); o.progress() ∈ [0,1] */
  var SPEEDS = [{ label: 'Lenta', per: 1, every: 8 }, { label: 'Media', per: 1, every: 2 },
    { label: 'Veloce', per: 4, every: 1 }, { label: 'Turbo', per: 30, every: 1 }]; // aggiornamenti frequenti e regolari: animazione fluida
  function runner(o) {
    var r = { running: false, frame: 0, speed: o.speed == null ? 1 : o.speed, raf: null };
    var speeds = o.speeds || SPEEDS, bar = el('i');
    r.playBtn = button(' Avvia', { icon: 'play', cls: 'btn-primary', onclick: function () { r.set(!r.running); } });
    function label() {
      r.playBtn.innerHTML = ''; r.playBtn.appendChild(icon(r.running ? 'pause' : 'play'));
      r.playBtn.appendChild(document.createTextNode(r.running ? ' Pausa' : o.done() ? ' Riavvia' : o.progress() > 0 ? ' Riprendi' : ' Avvia'));
      r.playBtn.setAttribute('aria-pressed', String(r.running));
      bar.style.width = (100 * o.progress()) + '%';
    }
    function loop() {
      r.raf = null; if (!r.running) return;
      var sp = speeds[r.speed]; r.frame++;
      if (r.frame % sp.every === 0) {
        for (var i = 0; i < sp.per; i++) if (o.step() === false) break;
        o.render(false); bar.style.width = (100 * o.progress()) + '%';
      }
      if (o.done()) { r.set(false); return; }
      r.raf = requestAnimationFrame(loop);
    }
    r.set = function (on) {
      if (r.task) return;
      if (on && o.done()) { o.reset(); o.render(true); } // simulazione finita: «Riavvia» ricomincia con lo stesso seed
      r.running = !!on && !o.done();
      if (r.running && !r.raf) r.raf = requestAnimationFrame(loop);
      if (!r.running) o.render(true);
      label();
    };
    r.stepOnce = function () { if (r.task) return; r.running = false; o.step(); o.render(true); label(); };
    /* Completa: sincrono per i lab leggeri; con o.coop a fette di ~30 ms (UI-01), annullabile, con avanzamento.
     * Durante il lavoro playBtn ha data-busy = "1" (usato anche dagli smoke test). */
    function endBusy() { r.task = null; r.playBtn.removeAttribute('data-busy'); r.playBtn.disabled = false; }
    r.finish = function () {
      r.running = false;
      if (!o.coop) { var guard = 0; while (!o.done() && o.step() !== false && guard++ < 1e6); o.render(true); label(); return; }
      if (r.task) return;
      var tk = r.task = { alive: true }; r.playBtn.setAttribute('data-busy', '1'); r.playBtn.disabled = true;
      (function slice() {
        if (!tk.alive) return;
        var t0 = Date.now(), more = true;
        while (Date.now() - t0 < 30) if (o.done() || o.step() === false) { more = false; break; }
        if (more && !o.done()) { o.render(false); bar.style.width = (100 * o.progress()) + '%'; setTimeout(slice, 0); }
        else { endBusy(); o.render(true); label(); }
      })();
    };
    r.restart = function () { r.stop(); o.reset(); o.render(true); label(); };
    r.stop = function () { r.running = false; if (r.raf) cancelAnimationFrame(r.raf); r.raf = null; if (r.task) { r.task.alive = false; endBusy(); } };
    r.refresh = label;
    r.key = function (e) {
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') { e.preventDefault(); r.set(!r.running); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); r.stepOnce(); }
    };
    r.controls = function (stepTitle) {
      var spOut = el('output', speeds[r.speed].label);
      var spIn = el('input', { type: 'range', min: 0, max: speeds.length - 1, step: 1, value: r.speed, 'aria-label': 'Velocità',
        oninput: function () { r.speed = +this.value; spOut.textContent = speeds[r.speed].label; } });
      return [
        el('label.field', el('div.field-row', el('span', 'Velocità'), spOut), spIn),
        el('div.transport', r.playBtn,
          button('', { icon: 'step', cls: 'btn-icon', aria: stepTitle || 'Un passo', title: (stepTitle || 'Un passo') + ' (→)', onclick: r.stepOnce }),
          button('', { icon: 'fast', cls: 'btn-icon', aria: 'Completa l’esperimento', title: 'Completa l’esperimento', onclick: r.finish }),
          button('', { icon: 'reset', cls: 'btn-icon', aria: 'Ricomincia', title: 'Ricomincia con lo stesso seed', onclick: r.restart })),
        el('div.progress', { 'aria-hidden': 'true' }, bar),
        el('p.muted', { style: 'margin:0;font-size:.78rem' }, 'Tastiera: spazio avvia/pausa, → un passo.')];
    };
    return r;
  }

  /* Lavoro pesante a blocchi, cooperativo e annullabile (UI-01): esegue work(i) per i = 0…total−1
   * a fette di ~12 ms, chiama onProgress(i, total) e onDone(); restituisce {cancel()}. */
  function chunked(total, work, onProgress, onDone) {
    var i = 0, alive = true;
    function slice() {
      if (!alive) return;
      var t0 = Date.now();
      while (i < total && Date.now() - t0 < 12) work(i++);
      if (onProgress) onProgress(i, total);
      if (i < total) setTimeout(slice, 0); else if (onDone) onDone();
    }
    setTimeout(slice, 0);
    return { cancel: function () { alive = false; } };
  }

  /* Campo con slider e valore */
  function slider(label, o) {
    var out = el('output', o.format ? o.format(o.value) : String(o.value));
    var inp = el('input', { type: 'range', min: o.min, max: o.max, step: o.step, value: o.value, 'aria-label': label,
      oninput: function () { out.textContent = o.format ? o.format(+this.value) : this.value; if (o.oninput) o.oninput(+this.value); },
      onchange: function () { if (o.onchange) o.onchange(+this.value); } });
    var f = el('label.field', el('div.field-row', el('span', label), out), inp);
    f.input = inp; f.output = out; return f;
  }

  return { el: el, icon: icon, runner: runner, slider: slider, chunked: chunked, button: button, toast: toast, download: download, copy: copy, codeBlock: codeBlock,
    exportPNG: exportPNG, csv: csv, openDrawer: openDrawer, closeDrawer: closeDrawer, badge: badge, step: step, highlightR: highlightR };
})();

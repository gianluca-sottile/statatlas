/* StatAtlas · core/app.js — catalogo, navigazione, tema */
var SA = window.SA || (window.SA = {});

SA.catalog = [
  { part: 'I', title: 'Probabilità', labs: [
    { id: 'distribuzioni', num: '01', title: 'Distribuzioni e relazioni', blurb: 'Diciassette leggi, densità e funzione di ripartizione, simulazione per inversione e mappa dei legami.', status: 'ready' },
    { id: 'bivariata', num: '02', title: 'Variabili bivariate', blurb: 'Nuvola con marginali, densità 3D, condizionate e il limite della correlazione.', status: 'ready' },
    { id: 'simulazione', num: '03', title: 'Metodi di simulazione', blurb: 'Dalla uniforme a qualunque legge per inversione; integrali stimati con il caso.', status: 'ready' } ] },
  { part: 'II', title: 'Campionamento', labs: [
    { id: 'lgn-tcl', num: '04', title: 'Grandi numeri e limite centrale', blurb: 'Traiettorie della media e distribuzione delle medie standardizzate, fino al controesempio di Cauchy.', status: 'ready' },
    { id: 'adattamento', num: '05', title: 'Adattamento di un modello', blurb: 'Istogramma, QQ plot con banda esatta, test X² con classi corrette e p-value Monte Carlo.', status: 'ready' } ] },
  { part: 'III', title: 'Inferenza', labs: [
    { id: 'stimatori', num: '06', title: 'Media, mediana e massima verosimiglianza', blurb: 'Tre stimatori della posizione sugli stessi campioni: efficienza e robustezza.', status: 'ready' },
    { id: 'fisher', num: '07', title: 'Verosimiglianza e informazione di Fisher', blurb: 'Dieci modelli: log-verosimiglianza, score, curvatura, Cramér–Rao, Wald e rapporto di verosimiglianza.', status: 'ready' },
    { id: 'intervalli', num: '08', title: 'Intervalli di confidenza', blurb: 'Copertura nominale, esatta e osservata: Z, t, Wald, Wilson, Garwood, pivot χ².', status: 'ready' },
    { id: 'test', num: '09', title: 'Test e potenza', blurb: 'Errore di primo tipo, potenza e numerosità campionaria nel test Z.', status: 'ready' } ] },
  { part: 'IV', title: 'Modelli', labs: [
    { id: 'regressione', num: '10', title: 'Regressione interattiva', blurb: 'Punti trascinabili, leverage e distanza di Cook, banda per la media e intervallo di previsione.', status: 'ready' },
    { id: 'regressione-lp', num: '11', title: 'Regressione L1, L2, Lp', blurb: 'Tre criteri sugli stessi dati: efficienza, code pesanti e valori anomali.', status: 'ready' },
    { id: 'glm', num: '12', title: 'Modelli lineari generalizzati', blurb: 'Logistica e Poisson: IRLS, distribuzione delle stime, distorsione e separazione.', status: 'ready' },
    { id: 'arma', num: '13', title: 'Serie temporali ARMA', blurb: 'Generazione progressiva, ACF e PACF teoriche ed empiriche, radici e stazionarietà.', status: 'ready' } ] },
  { part: 'V', title: 'Regressione moderna', labs: [
    { id: 'quantilica', num: '14', title: 'Regressione quantilica', blurb: 'Rette per ogni quantile, perdita asimmetrica, soluzione esatta, punti trascinabili.', status: 'ready' },
    { id: 'penalizzata', num: '15', title: 'Ridge, lasso ed elastic net', blurb: 'Lo spazio delle soluzioni, i percorsi di regolarizzazione e il compromesso distorsione–varianza.', status: 'ready' } ] }
];
SA.labs = {};
SA.registerLab = function (id, def) { SA.labs[id] = def; };

(function () {
  var el, current = null, main, sidebar;
  var STATUS = { ready: ['tag-ready', 'Disponibile'], migrate: ['', 'In migrazione'], new: ['tag-new', 'Nuovo · in arrivo'] };

  function find(id) {
    for (var i = 0; i < SA.catalog.length; i++) for (var j = 0; j < SA.catalog[i].labs.length; j++)
      if (SA.catalog[i].labs[j].id === id) return { part: SA.catalog[i], lab: SA.catalog[i].labs[j] };
    return null;
  }
  SA.findLab = find;

  function buildSidebar() {
    var nav = el('nav', { 'aria-label': 'Laboratori' });
    SA.catalog.forEach(function (p) {
      nav.appendChild(el('div.nav-part', p.part + ' · ' + p.title));
      nav.appendChild(el('ul.nav-list', p.labs.map(function (l) {
        var ready = l.status === 'ready';
        return el('li', el('a.nav-link' + (ready ? '.is-ready' : '.is-soon'), { href: '#/' + l.id, 'data-id': l.id, title: ready ? null : STATUS[l.status][1] },
          el('span.num', l.num), el('span', l.title), el('span.dot', { 'aria-hidden': 'true' })));
      })));
    });
    var themeBtn = SA.ui.button('Tema', { icon: 'moon', cls: 'btn-ghost', onclick: toggleTheme, aria: 'Cambia tema chiaro/scuro' });
    var lang = el('button.btn.btn-ghost', { type: 'button', disabled: true, title: 'Versione inglese in preparazione' }, 'IT · EN');
    sidebar.append(
      el('a.brand', { href: '#/', html: SA.art.logo(38) + '<span class="brand-mark">Stat<span>Atlas</span></span>' }),
      el('p.brand-tag', 'Laboratori di probabilità e inferenza'),
      nav, el('div.sidebar-foot', themeBtn, lang));
  }

  function toggleTheme() {
    var root = document.documentElement, cur = root.getAttribute('data-theme');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sa-theme', next); } catch (e) {}
    if (current && current.redraw) current.redraw();
  }

  var PART_DESC = {
    I: ['partI', 'Il linguaggio delle leggi di probabilità: densità, ripartizione, dipendenza tra variabili, e come un computer genera dati da qualunque legge.'],
    II: ['partII', 'Che cosa succede quando si raccolgono molti dati: la media si stabilizza, la sua incertezza prende la forma di una campana, e un modello si può mettere alla prova.'],
    III: ['partIII', 'Dai dati ai parametri: stimatori e loro efficienza, verosimiglianza, intervalli di confidenza e test, con le garanzie che offrono e i loro limiti.'],
    IV: ['partIV', 'Modelli che legano una risposta a dei predittori o al proprio passato: regressione lineare, robusta e generalizzata, serie temporali.'],
    V: ['partV', 'Oltre la media e oltre i minimi quadrati: quantili condizionati e stime penalizzate per modelli con molti predittori.']
  };
  var STEPS = [['Domanda', 'Un problema concreto, con una previsione facoltativa'], ['Esperimento', 'Dati generati sotto i tuoi occhi, passo dopo passo'],
    ['Teoria e simulazione', 'Esatto, asintotico o Monte Carlo: sempre dichiarato'], ['Interpretazione', 'Che cosa significa, quando vale, dove si rompe'],
    ['Approfondisci', 'Teoria, esercizi e bibliografia'], ['Codice R', 'Lo stesso esperimento, con gli stessi numeri']];
  function home() {
    var page = el('div.page.page-home');
    page.appendChild(el('header.hero.hero-home',
      el('div.hero-text',
        el('div.kicker', 'Atlante interattivo di probabilità e statistica'),
        el('h1', 'Vedere la statistica ', el('em', 'mentre accade')),
        el('p.lede', 'Quindici laboratori per studenti universitari. Ognuno parte da una domanda, ti chiede una previsione, genera i dati sotto i tuoi occhi e confronta ciò che osservi con ciò che la teoria garantisce. Lo script R riproduce esattamente lo stesso esperimento.'),
        el('div.hero-actions', el('a.btn.btn-primary', { href: '#/distribuzioni' }, 'Inizia dal laboratorio 01'), el('a.btn', { href: '#/', onclick: function (e) { e.preventDefault(); document.getElementById('parti').scrollIntoView({ behavior: 'smooth' }); } }, 'Sfoglia l’atlante'))),
      el('div.hero-art', { html: '<div class="hero-logo">' + SA.art.logo(132) + '</div>' + ['distribuzioni', 'intervalli', 'regressione', 'lgn-tcl'].map(function (k, i) { return '<div class="mosaic m' + i + '">' + SA.art.get(k) + '</div>'; }).join('') })));
    page.appendChild(el('section.how', el('div.step-label', 'Come funziona un laboratorio'),
      el('ol.how-steps', STEPS.map(function (s, i) { return el('li', el('span.how-num', String(i + 1)), el('strong', s[0]), el('span', s[1])); }))));
    // le quattro parti come tessere: un clic apre una finestra con i laboratori della parte
    var parts = el('div.parts.part-tiles', { id: 'parti' });
    SA.catalog.forEach(function (p) {
      var d = PART_DESC[p.part];
      parts.appendChild(el('button.part-tile', { type: 'button', 'aria-haspopup': 'dialog', onclick: function () { openPart(p); } },
        el('div.part-art', { html: SA.art.get(d[0]), 'aria-hidden': 'true' }),
        el('div.part-text', el('div.part-roman', p.part), el('h2', p.title), el('p', d[1]),
          el('div.part-foot', el('span.muted', p.labs.length + ' laboratori · ' + p.labs.map(function (l) { return l.num; }).join(' · ')), el('span.card-go', 'Apri →')))));
    });
    page.appendChild(parts);
    page.appendChild(footer());
    return page;
  }

  /* Finestra di una parte, con le schede dei suoi laboratori */
  var modal = null, modalBack = null, modalLast = null;
  function closePart() {
    if (!modal) return;
    modal.remove(); modalBack.remove(); modal = null; document.body.style.overflow = '';
    document.removeEventListener('keydown', escPart);
    if (modalLast) modalLast.focus();
  }
  function escPart(e) { if (e.key === 'Escape') closePart(); }
  function openPart(p) {
    closePart(); modalLast = document.activeElement;
    var d = PART_DESC[p.part];
    modalBack = el('div.modal-back', { onclick: closePart });
    modal = el('div.modal', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
      el('div.modal-head',
        el('div.modal-art', { html: SA.art.get(d[0]), 'aria-hidden': 'true' }),
        el('div', el('div.kicker', 'Parte ' + p.part), el('h2', { id: 'modal-title' }, p.title), el('p.muted', d[1])),
        SA.ui.button('', { icon: 'close', cls: 'btn-ghost btn-icon modal-close', aria: 'Chiudi', onclick: closePart })),
      el('div.cards', p.labs.map(function (l) {
        var ready = l.status === 'ready', st = STATUS[l.status];
        var inner = [el('div.card-art', { html: SA.art.get(l.id), 'aria-hidden': 'true' }),
          el('div.card-body', el('span.num', 'Laboratorio ' + l.num), el('h3', l.title), el('p', l.blurb), ready ? el('span.card-go', 'Apri il laboratorio →') : el('span.tag' + (st[0] ? '.' + st[0] : ''), st[1]))];
        return ready ? el('a.card', { href: '#/' + l.id, onclick: closePart }, inner) : el('div.card.is-soon', inner);
      })));
    document.body.append(modalBack, modal); document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', escPart);
    modal.querySelector('.modal-close').focus();
  }

  function soon(info) {
    var st = STATUS[info.lab.status];
    return el('div.page', el('header.hero',
      el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
      el('h1', info.lab.title), el('p.lede', info.lab.blurb),
      el('p', el('span.tag' + (st[0] ? '.' + st[0] : ''), st[1])),
      el('p.muted', info.lab.status === 'migrate'
        ? 'Questo laboratorio esiste nella versione 0.8 e verrà trasferito nel nuovo formato nelle prossime fasi.'
        : 'Laboratorio nuovo, previsto nella roadmap.'),
      el('a.btn', { href: '#/' }, 'Torna all’indice')), footer());
  }

  function footer() {
    return el('footer.foot',
      el('p', 'StatAtlas · progetto didattico di Gianluca Sottile. Alcuni laboratori traggono ispirazione dalle idee di Simul2000 di Marcello Chiodi (Università di Palermo); codice e testi sono originali.'),
      el('p', 'Numeri casuali generati con il Mersenne-Twister di R: con lo stesso seed, R ≥ 4.1 riproduce gli stessi campioni.'));
  }

  /* Arricchisce ogni laboratorio con copertina, obiettivi, “che cosa stiamo valutando” e guida alla tabella */
  function enhanceLab(page, id) {
    var c = SA.content && SA.content[id], head = page.querySelector('.lab-head');
    if (head) {
      var text = head.firstElementChild, btn = head.querySelector(':scope > .btn');
      if (c) text.appendChild(el('ul.chips', { 'aria-label': 'Obiettivi' }, c.obiettivi.map(function (o) { return el('li', o); })));
      if (btn) text.appendChild(el('div.head-actions', btn));
      var info = SA.findLab(id);
      head.appendChild(el('figure.lab-cover', { html: SA.art.get(id) + '<figcaption>Tavola ' + info.lab.num + ' · ' + info.part.title + '</figcaption>', 'aria-hidden': 'true' }));
    }
    // la previsione diventa un riquadro facoltativo dentro la domanda; i passi si rinumerano
    var steps = page.querySelectorAll('section.step');
    if (steps.length > 1 && /previsione/i.test(steps[1].querySelector('.step-label').textContent)) {
      var det = el('details.predict', el('summary', el('span', 'Prima di guardare: che cosa ti aspetti?'), el('span.predict-tag', 'facoltativo')));
      Array.prototype.slice.call(steps[1].querySelector('.step-body').children, 1).forEach(function (n) { det.appendChild(n); });
      steps[0].querySelector('.step-body').appendChild(det);
      steps[1].remove();
      page.querySelectorAll('section.step').forEach(function (s, i) { s.querySelector('.step-num').textContent = String(i + 1); });
    }
    if (!c) return;
    var grid = page.querySelector('.lab-grid');
    if (grid) grid.parentNode.insertBefore(el('div.focus-box',
      el('div.focus-title', el('span.focus-icon', { 'aria-hidden': 'true' }, '◎'), 'Che cosa stiamo valutando'),
      el('dl.focus-grid', c.valutiamo.map(function (v) { return el('div', el('dt', v[0]), el('dd', v[1])); }))), grid);
    var tbl = page.querySelector('.tbl-wrap');
    if (tbl) tbl.parentNode.insertBefore(el('div.table-guide', el('strong', 'Come leggere la tabella. '), c.tabella), tbl);
  }

  function route() {
    var id = (location.hash.replace(/^#\/?/, '').split('/')[0]) || '';
    if (current && current.unmount) current.unmount();
    current = null;
    main.innerHTML = '';
    sidebar.querySelectorAll('.nav-link').forEach(function (a) {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var info = id && find(id);
    if (!info) { main.appendChild(home()); document.title = 'StatAtlas'; }
    else if (SA.labs[id]) {
      var page = el('div.page'); main.appendChild(page);
      SA.currentLab = id;
      current = SA.labs[id]; current.mount(page, info); enhanceLab(page, id); page.appendChild(footer());
      document.title = info.lab.title + ' · StatAtlas';
    } else { main.appendChild(soon(info)); document.title = info.lab.title + ' · StatAtlas'; }
    sidebar.classList.remove('open');
    window.scrollTo(0, 0);
    var h = main.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  SA.start = function () {
    el = SA.ui.el;
    try { var th = localStorage.getItem('sa-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    sidebar = document.getElementById('sidebar'); main = document.getElementById('main');
    buildSidebar();
    var tb = document.getElementById('topBrand'); if (tb) tb.insertAdjacentHTML('afterbegin', SA.art.logo(30));
    document.getElementById('menuBtn').appendChild(SA.ui.icon('menu'));
    document.getElementById('menuBtn').addEventListener('click', function () { sidebar.classList.toggle('open'); });
    window.addEventListener('hashchange', route);
    route();
  };
})();

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
    { id: 'penalizzata', num: '15', title: 'Ridge, lasso ed elastic net', blurb: 'Lo spazio delle soluzioni, i percorsi di regolarizzazione e il compromesso distorsione–varianza.', status: 'ready' },
    { id: 'spline', num: '16', title: 'Regressione non parametrica e spline', blurb: 'Polinomi, spline, P-spline e kernel: complessità, gradi di libertà effettivi e validazione incrociata.', status: 'ready' },
    { id: 'segmentata', num: '17', title: 'Regressione segmentata e breakpoint', blurb: 'Una pendenza che cambia: profilo RSS(ψ), breakpoint non identificato, test bootstrap del cambiamento.', status: 'ready' } ] },
  { part: 'VI', title: 'Apprendimento supervisionato', labs: [
    { id: 'validazione', num: '18', title: 'Validazione e overfitting', blurb: 'Training, test e validazione incrociata: scegliere la complessità senza ingannarsi sull’errore di previsione.', status: 'ready' },
    { id: 'knn', num: '19', title: 'k vicini più prossimi', blurb: 'Classificare con i vicini: frontiere di decisione, errore di Bayes, scelta di k e il peso delle unità di misura.', status: 'ready' },
    { id: 'alberi', num: '20', title: 'Alberi, bagging e random forest', blurb: 'Un albero è instabile; molti alberi resi diversi votano meglio: bootstrap, out-of-bag e scelta casuale delle variabili.', status: 'ready' },
    { id: 'boost', num: '21', title: 'Gradient boosting', blurb: 'Alberi sequenziali sui pseudo-residui: funzione vera, perdita quadratica o logistica, shrinkage e early stopping.', status: 'ready' },
    { id: 'reti-neurali', num: '22', title: 'Reti neurali e backpropagation', blurb: 'Una rete piccola vista per intero: pesi, passaggio in avanti, gradiente, learning rate, sovradattamento e inizializzazioni.', status: 'ready' } ] },
  { part: 'VII', title: 'Riduzione dimensionale e clustering', labs: [
    { id: 'pca', num: '23', title: 'Componenti principali', blurb: 'Gli assi di massima varianza: autovalori, varianza spiegata, ricostruzione, segni e stabilità degli assi.', status: 'ready' },
    { id: 'clustering', num: '24', title: 'k-means e clustering gerarchico', blurb: 'Lloyd passo dopo passo, minimi locali e più avvii, dendrogrammi e legami, gruppi trovati contro gruppi veri.', status: 'ready' },
    { id: 'dbscan', num: '25', title: 'DBSCAN e confronto tra metodi', blurb: 'Gruppi come regioni dense: core, bordo e rumore, scelta di ε, lune e cerchi contro k-means e Ward.', status: 'ready' } ] },
  { part: 'VIII', title: 'Statistica spaziale', labs: [
    { id: 'moran', num: '26', title: 'Autocorrelazione spaziale e Moran', blurb: 'Una mappa non è solo colore: pesi spaziali, Moran scatterplot e test permutazionale con dati simulati.', status: 'ready' },
    { id: 'lisa', num: '27', title: 'Autocorrelazione locale, hotspot e MAUP', blurb: 'Dai quadranti LISA ai test locali per permutazione: correzioni multiple, hotspot e aggregazione territoriale.', status: 'ready' },
    { id: 'processi-puntuali', num: '28', title: 'Processi puntuali spaziali', blurb: 'Poisson omogeneo e non omogeneo, Thomas, inibizione: K e L di Ripley, envelope CSR, test Monte Carlo globale.', status: 'ready' },
    { id: 'variogrammi', num: '29', title: 'Variogrammi e campi aleatori spaziali', blurb: 'Campo gaussiano, nugget, range e anisotropia: coppie di sensori, stima empirica e Monte Carlo su siti fissi.', status: 'ready' },
    { id: 'kriging', num: '30', title: 'Kriging e disegno dei sensori', blurb: 'Posiziona sensori su un campo nascosto, confronta simple/ordinary kriging e IDW, previsione, varianza e calibrazione Monte Carlo.', status: 'ready' },
    { id: 'regressione-spaziale', num: '31', title: 'Regressione spaziale e validazione geografica', blurb: 'OLS, SAR e SEM: verosimiglianze, effetti diretti e indiretti, random contro spatial block CV.', status: 'ready' } ] }
];
SA.labs = {};
SA.registerLab = function (id, def) { SA.labs[id] = def; };

(function () {
  var el, current = null, main, sidebar, menuBtn, menuBackdrop;
  var STATUS = { ready: ['tag-ready', 'Disponibile'], migrate: ['', 'In migrazione'], new: ['tag-new', 'Nuovo · in arrivo'] };

  function find(id) {
    for (var i = 0; i < SA.catalog.length; i++) for (var j = 0; j < SA.catalog[i].labs.length; j++)
      if (SA.catalog[i].labs[j].id === id) return { part: SA.catalog[i], lab: SA.catalog[i].labs[j] };
    return null;
  }
  SA.findLab = find;

  function buildSidebar() {
    sidebar.innerHTML = '';
    var nav = el('nav', { 'aria-label': SA.i18n.tr('Laboratori') });
    nav.appendChild(el('div.nav-part', SA.i18n.isEnglish() ? 'TEACHING' : 'DIDATTICA'));
    nav.appendChild(el('a.nav-link.teacher-nav', {href:'#/teachers'}, SA.i18n.isEnglish() ? 'StatAtlas for Teachers' : 'StatAtlas per docenti'));
    SA.catalog.forEach(function (p) {
      nav.appendChild(el('div.nav-part', p.part + ' · ' + p.title));
      nav.appendChild(el('ul.nav-list', p.labs.map(function (l) {
        var ready = l.status === 'ready';
        return el('li', el('a.nav-link' + (ready ? '.is-ready' : '.is-soon'), { href: '#/' + l.id, 'data-id': l.id, title: ready ? null : STATUS[l.status][1] },
          el('span.num', l.num), el('span', l.title), el('span.dot', { 'aria-hidden': 'true' })));
      })));
    });
    var search = el('input.ux-sidebar-search', { type: 'search',
      'aria-label': SA.i18n.isEnglish() ? 'Find a laboratory' : 'Cerca un laboratorio',
      placeholder: SA.i18n.isEnglish() ? 'Search 31 laboratories…' : 'Cerca tra 31 laboratori…' });
    search.addEventListener('input', function () {
      var query = search.value.trim().toLocaleLowerCase();
      nav.querySelectorAll('ul.nav-list').forEach(function (list) {
        var shown = 0;
        list.querySelectorAll('li').forEach(function (item) {
          var match = !query || item.textContent.toLocaleLowerCase().includes(query);
          item.hidden = !match; if (match) shown++;
        });
        list.hidden = !shown;
        if (list.previousElementSibling && list.previousElementSibling.classList.contains('nav-part'))
          list.previousElementSibling.hidden = !shown;
      });
    });
    var themeBtn = SA.ui.button(SA.i18n.tr('Tema'), { icon: 'moon', cls: 'btn-ghost', onclick: toggleTheme, aria: SA.i18n.tr('Cambia tema chiaro/scuro') });
    var en = SA.i18n.isEnglish();
    var lang = el('button.btn.btn-ghost.lang-toggle', {
      type: 'button', 'aria-label': en ? 'Switch to Italian' : 'Switch to English',
      'aria-pressed': String(en), 'lang': en ? 'en' : 'it',
      title: en ? 'Show the complete Italian source content' : 'Show English navigation and scientific companion guides',
      onclick: function () {
        if (!SA.i18n.setLanguage(en ? 'it' : 'en', SA.catalog)) return;
        closeMenu(false);
        buildSidebar();
        route();
        updateMenuAccessibility();
      }
    }, en ? 'EN · IT' : 'IT · EN');
    sidebar.append(
      SA.ui.button(SA.i18n.tr('Chiudi indice'), { icon: 'close', cls: 'btn-ghost sidebar-close', aria: SA.i18n.tr('Chiudi indice dei laboratori'), onclick: function () { closeMenu(true); } }),
      el('a.brand', { href: '#/', html: SA.art.logo(38) + '<span class="brand-mark">Stat<span>Atlas</span></span>' }),
      el('p.brand-tag', SA.i18n.tr('Laboratori di probabilità e inferenza')),
      search, nav, el('div.sidebar-foot', themeBtn, lang));
    SA.i18n.localizeSurface(sidebar);
  }

  /* Menu responsivo: lo sfondo viene bloccato, il focus resta raggiungibile e l'indice si chiude
   * su scelta di una lezione, tocco fuori, Esc o ritorno alla vista desktop. */
  function compactLayout() {
    return window.matchMedia && window.matchMedia('(max-width: 1180px)').matches;
  }
  function updateMenuAccessibility() {
    var open = sidebar.classList.contains('open') && compactLayout();
    if (compactLayout() && !open) sidebar.setAttribute('inert', '');
    else sidebar.removeAttribute('inert');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', SA.i18n.tr(open ? 'Chiudi indice dei laboratori' : 'Apri indice dei laboratori'));
    }
    if (menuBackdrop) menuBackdrop.hidden = !open;
    document.body.classList.toggle('mobile-menu-open', open);
  }
  function closeMenu(restore) {
    var wasOpen = sidebar.classList.contains('open');
    sidebar.classList.remove('open');
    updateMenuAccessibility();
    if (wasOpen && restore && menuBtn && menuBtn.getClientRects().length) menuBtn.focus();
  }
  function toggleMenu() {
    if (sidebar.classList.contains('open')) { closeMenu(true); return; }
    if (!compactLayout()) return;
    sidebar.classList.add('open');
    updateMenuAccessibility();
    var close = sidebar.querySelector('.sidebar-close');
    if (close) close.focus();
  }
  function mobileMenuKeydown(ev) {
    if (!sidebar.classList.contains('open')) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeMenu(true); return; }
    if (ev.key !== 'Tab') return;
    var focusable = Array.prototype.filter.call(sidebar.querySelectorAll('a[href], button:not([disabled])'), function (x) { return x.getClientRects().length; });
    if (!focusable.length) return;
    if (ev.shiftKey && document.activeElement === focusable[0]) { ev.preventDefault(); focusable[focusable.length - 1].focus(); }
    else if (!ev.shiftKey && document.activeElement === focusable[focusable.length - 1]) { ev.preventDefault(); focusable[0].focus(); }
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
    V: ['partV', 'Oltre la media e oltre la retta: quantili condizionati, stime penalizzate con molti predittori e curve stimate dai dati.'],
    VI: ['partVI', 'Prevedere bene su dati nuovi: validazione, vicini, alberi ed ensemble, gradient boosting e reti neurali.'],
    VII: ['partVII', 'Dati senza una risposta da prevedere: trovare poche direzioni che riassumono molte variabili, e gruppi di osservazioni simili.'],
    VIII: ['partVIII', 'Osservazioni localizzate nello spazio: come cambiano l’inferenza, la previsione e la nozione di vicinanza.'],
  };
  var STEPS = [['Domanda', 'Un problema concreto, con una previsione facoltativa'], ['Esperimento', 'Dati generati sotto i tuoi occhi, passo dopo passo'],
    ['Teoria e simulazione', 'Esatto, asintotico o Monte Carlo: sempre dichiarato'], ['Interpretazione', 'Che cosa significa, quando vale, dove si rompe'],
    ['Approfondisci', 'Teoria, esercizi e bibliografia'], ['Corso R', 'Lezioni collegate e scheda studente'], ['Codice R', 'Script riproducibili con verifiche numeriche documentate']];
  function labCountText() {
    var n = SA.catalog.reduce(function (a, p) { return a + p.labs.length; }, 0);
    var W = { 16: 'Sedici', 17: 'Diciassette', 18: 'Diciotto', 19: 'Diciannove', 20: 'Venti', 21: 'Ventuno', 22: 'Ventidue', 23: 'Ventitré', 24: 'Ventiquattro', 25: 'Venticinque', 26: 'Ventisei', 27: 'Ventisette', 28: 'Ventotto', 29: 'Ventinove', 30: 'Trenta', 31: 'Trentuno' };
    return SA.i18n.isEnglish() ? n + ' laboratories' : (W[n] || String(n)) + ' laboratori';
  }
  function home() {
    var page = el('div.page.page-home');
    var english = SA.i18n.isEnglish();
    page.appendChild(el('header.hero.hero-home',
      el('div.hero-text',
        el('div.kicker', SA.i18n.tr('Atlante interattivo di probabilità e statistica')),
        el('h1', english ? 'See statistics ' : 'Vedere la statistica ', el('em', english ? 'as it happens' : 'mentre accade')),
        el('p.lede', english ? labCountText() + ', from probability to spatial statistics and statistical learning. Each experiment starts with a question and can be reproduced using the supplied R script. The laboratory interfaces and detailed Italian lessons retain their original language; an English scientific companion is available inside every lab.' : labCountText() + ', dalla probabilità alla statistica spaziale e all’apprendimento statistico. Ognuno parte da una domanda, genera i dati sotto i tuoi occhi e confronta ciò che osservi con ciò che la teoria garantisce. Ogni esperimento si ripete in R con lo script fornito.'),
        el('div.hero-actions', el('button.btn.btn-primary', { type: 'button', 'aria-haspopup': 'dialog', onclick: openMap }, SA.i18n.tr('Sfoglia l’atlante: la mappa dei laboratori')), el('a.btn.btn-ghost', { href: 'https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/' + (english ? 'en/' : 'it/'), target: '_blank', rel: 'noopener noreferrer' }, SA.i18n.tr('Studia anche con R ↗')))),
      el('div.hero-art', { html: '<div class="hero-logo">' + SA.art.logo(132) + '</div>' + ['distribuzioni', 'intervalli', 'regressione', 'lgn-tcl'].map(function (k, i) { return '<div class="mosaic m' + i + '">' + SA.art.get(k) + '</div>'; }).join('') })));
    page.appendChild(el('section.how', el('div.step-label', 'Come funziona un laboratorio'),
      el('ol.how-steps', STEPS.map(function (s, i) { return el('li', el('span.how-num', String(i + 1)), el('strong', s[0]), el('span', s[1])); }))));
    // come leggere l'atlante: natura dei risultati e livelli di riproducibilità in R
    var B = SA.ui.badge, lv = function (code, title, text) { return el('li', el('span.rlevel', code), el('div', el('strong', title), el('span', text))); };
    page.appendChild(el('section.legend-home', { id: 'come-leggere' },
      el('div.legend-col', el('div.step-label', 'Come leggere i risultati'), el('p', 'Ogni valore teorico dichiara la propria natura, per non confondere ciò che vale sempre con ciò che vale al limite.'),
        el('ul.legend-list', el('li', B('exact'), el('span', 'vale per ogni numerosità, senza approssimazioni')), el('li', B('asym'), el('span', 'vale al crescere di n: per n piccolo può essere impreciso')),
          el('li', B('approx'), el('span', 'formula o calcolo numerico approssimato, con l’errore indicato')), el('li', B('mc'), el('span', 'stima ottenuta dalla simulazione, con il suo errore casuale')))),
      el('div.legend-col', el('div.step-label', 'Che cosa riproduce lo script R'), el('p', 'Il generatore di numeri casuali di R è ricostruito nel browser. Ogni script dichiara fin dove arriva la corrispondenza.'),
        el('ul.legend-list.levels', lv('R0', 'Stessi dati', 'stesso seed, stessi campioni, stesse suddivisioni'), lv('R1', 'Stesse misure', 'stesse stime ed errori, a meno dell’arrotondamento'),
          lv('R2', 'Stesso algoritmo', 'stessi passi e stesse regole nei casi di parità'), lv('R3', 'Confronto di metodo', 'pacchetti che seguono regole diverse: risultati vicini, non identici')))));
    // le parti come tessere: un clic apre una finestra con i laboratori della parte
    var parts = el('div.parts.part-tiles', { id: 'parti' });
    SA.catalog.forEach(function (p) {
      var d = PART_DESC[p.part];
      var desc = english ? SA.english.parts[p.part][1] : d[1];
      parts.appendChild(el('button.part-tile', { type: 'button', 'aria-haspopup': 'dialog', onclick: function () { openPart(p); } },
        el('div.part-art', { html: SA.art.get(d[0]), 'aria-hidden': 'true' }),
        el('div.part-text', el('div.part-roman', p.part), el('h2', p.title), el('p', desc),
          el('div.part-foot', el('span.muted', p.labs.length + (english ? ' labs · ' : ' laboratori · ') + p.labs.map(function (l) { return l.num; }).join(' · ')), el('span.card-go', 'Apri →')))));
    });
    // UX: show the actual atlas before secondary explanations, without dropping content.
    page.insertBefore(parts, page.querySelector('section.how'));
    var homeHelp = el('details.ux-home-help', el('summary', english ? 'How StatAtlas works · methods and reproducibility' : 'Come funziona StatAtlas · metodi e riproducibilità'));
    homeHelp.append(page.querySelector('section.how'), page.querySelector('section.legend-home'));
    page.appendChild(homeHelp);
    page.appendChild(footer());
    SA.i18n.localizeSurface(page);
    return page;
  }

  /* Mappa dell'atlante: laboratori come nodi, legami concettuali come archi */
  var LINKS = [
    ['distribuzioni', 'bivariata', 'dalle leggi univariate alla legge congiunta'], ['distribuzioni', 'simulazione', 'ogni legge si genera per inversione della ripartizione'],
    ['simulazione', 'lgn-tcl', 'simulare molti campioni per osservare la media'], ['distribuzioni', 'lgn-tcl', 'momenti e code decidono LGN e TCL (il caso Cauchy)'],
    ['lgn-tcl', 'adattamento', 'convergenza della ripartizione empirica e test di adattamento'], ['distribuzioni', 'adattamento', 'banda DKW e distanza di Kolmogorov'],
    ['lgn-tcl', 'stimatori', 'la distribuzione campionaria di uno stimatore'], ['stimatori', 'fisher', 'dall’efficienza al limite di Cramér–Rao'],
    ['fisher', 'intervalli', 'intervalli di Wald e del rapporto di verosimiglianza'], ['lgn-tcl', 'intervalli', 'il TCL giustifica gli intervalli asintotici'],
    ['intervalli', 'test', 'dualità tra intervalli e test'], ['fisher', 'test', 'test score, di Wald e del rapporto di verosimiglianza'],
    ['bivariata', 'regressione', 'la regressione come media condizionata'], ['regressione', 'regressione-lp', 'cambiare la funzione di perdita'],
    ['stimatori', 'regressione-lp', 'media contro mediana: efficienza e robustezza'], ['fisher', 'glm', 'verosimiglianza e scoring di Fisher (IRLS)'],
    ['regressione', 'glm', 'dal modello lineare al legame'], ['bivariata', 'arma', 'la dipendenza nel tempo: autocorrelazione'],
    ['regressione-lp', 'quantilica', 'L1 è la regressione del quantile 0,5'], ['regressione', 'penalizzata', 'penalizzare i minimi quadrati'],
    ['regressione', 'spline', 'dalla retta alla curva'], ['penalizzata', 'spline', 'la penalità sulla rugosità (P-spline)'], ['adattamento', 'spline', 'scegliere la complessità guardando i dati'],
    ['spline', 'segmentata', 'una spline lineare con un solo nodo, di posizione ignota'], ['regressione', 'segmentata', 'il modello lineare con un termine (x − ψ)₊'], ['test', 'segmentata', 'testare un parametro che esiste solo sotto l’alternativa'],
    ['penalizzata', 'validazione', 'scegliere λ con la validazione incrociata'], ['spline', 'validazione', 'dalla LOOCV in forma chiusa al protocollo training/test'], ['regressione', 'validazione', 'errore di training contro errore di previsione'],
    ['validazione', 'knn', 'scegliere k con la validazione leave-one-out'], ['glm', 'knn', 'dalla regressione logistica a una stima locale di P(Y = 1 | x)'], ['bivariata', 'knn', 'classi come normali bivariate: la regola di Bayes'],
    ['knn', 'alberi', 'dalle regioni dei vicini ai rettangoli degli alberi'], ['validazione', 'alberi', 'l’errore out-of-bag come validazione gratuita'], ['simulazione', 'alberi', 'il bootstrap: ricampionare per simulare nuovi dati'],
    ['alberi', 'boost', 'dall’aggregazione in parallelo all’ottimizzazione sequenziale'], ['validazione', 'boost', 'selezione del numero di alberi tramite validazione'], ['boost', 'reti-neurali', 'ottimizzazione di una funzione di perdita per passi successivi'],
    ['bivariata', 'pca', 'la covarianza e i suoi assi: ellissi di concentrazione'], ['regressione', 'pca', 'proiezioni ortogonali e minimi quadrati'], ['penalizzata', 'pca', 'ridge restringe di più le direzioni a bassa varianza'],
    ['pca', 'clustering', 'distanze euclidee e scelta della scala'], ['knn', 'clustering', 'vicinanza senza etichette'], ['bivariata', 'clustering', 'miscugli di normali come popolazioni generatrici'],
    ['clustering', 'dbscan', 'dai centri alla densità: gruppi di forma qualunque'], ['knn', 'dbscan', 'intorni di raggio ε e k-distanze'],
    ['bivariata', 'moran', 'dalla dipendenza tra variabili alla dipendenza tra territori'], ['arma', 'moran', 'correlazione: dal tempo allo spazio'], ['simulazione', 'moran', 'permutazione spaziale come modello nullo'],
    ['moran', 'lisa', 'dalla dipendenza globale ai pattern locali e ai test multipli'], ['test', 'lisa', 'molti test simultanei: p-value grezzi e correzione FDR'], ['clustering', 'lisa', 'hotspot spaziali e gruppi statistici non sono sinonimi'],
    ['kriging', 'regressione-spaziale', 'dalla previsione spaziale alla modellazione territoriale'], ['moran', 'regressione-spaziale', 'dalla dipendenza territoriale alla regressione'], ['validazione', 'regressione-spaziale', 'cross-validation e trasferimento geografico'], ['variogrammi', 'kriging', 'dal variogramma alla previsione spaziale'], ['validazione', 'kriging', 'errore predittivo e calibrazione fuori campione'], ['spline', 'kriging', 'interpolazione e dipendenza tra osservazioni'], ['arma', 'variogrammi', 'covarianza e dipendenza: dal tempo alla distanza spaziale'], ['processi-puntuali', 'variogrammi', 'eventi puntuali e campi continui'],
    ['simulazione', 'processi-puntuali', 'processo di Poisson e simulazione Monte Carlo'], ['lisa', 'processi-puntuali', 'dagli hotspot areali alle configurazioni di eventi puntuali'], ['dbscan', 'processi-puntuali', 'cluster algoritmici e aggregazione di un processo puntuale'],
    ['validazione', 'reti-neurali', 'validazione e arresto anticipato'], ['knn', 'reti-neurali', 'frontiere non lineari apprese dai dati'], ['glm', 'reti-neurali', 'l’uscita è una regressione logistica su variabili costruite'], ['penalizzata', 'reti-neurali', 'la penalità L2 sui pesi (weight decay)']
  ];
  function openMap() {
    closePart(); modalLast = document.activeElement;
    // Fino a cinque parti una riga, da sei a otto 4 colonne; oltre, griglia 3 x 3.
    var P = SA.plot, t = SA.theme(), W = 1050, np = SA.catalog.length, cols = np >= 9 ? 3 : (np > 5 ? 4 : np), rows = Math.ceil(np / cols), RH = rows > 1 ? 345 : 560, H = RH * rows;
    var colW = W / cols, NW = Math.min(168, colW - 12), pos = {}, cx = function (ci) { return colW * (ci % cols + 0.5); }, top = function (ci) { return RH * Math.floor(ci / cols); };
    SA.catalog.forEach(function (p, ci) { var n = p.labs.length; p.labs.forEach(function (l, li) { pos[l.id] = { x: cx(ci), y: top(ci) + 90 + (RH - 110) * (li + 0.5) / Math.max(n, rows > 1 ? 4 : 1), lab: l, part: p }; }); });
    var caption = el('div.feedback', { role: 'status', style: 'max-width:none;margin-top:12px' }, 'Passa sopra un laboratorio per vedere i suoi legami; clicca per aprirlo.');
    var box = el('div.atlas-map');
    var svg = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Mappa dei legami tra i laboratori', 'font-family': t.sans }, box);
    SA.catalog.forEach(function (p, ci) {
      P.svg('rect', { x: colW * (ci % cols) + 6, y: top(ci) + 8, width: colW - 12, height: RH - 16, rx: 12, fill: (ci + Math.floor(ci / cols)) % 2 ? t.paper_2 : t.card, stroke: t.rule }, svg);
      P.text(svg, cx(ci), top(ci) + 40, p.part, { 'text-anchor': 'middle', fill: t.accent, 'font-family': t.serif, 'font-size': 26, 'font-weight': 700 });
      P.text(svg, cx(ci), top(ci) + 62, p.title, { 'text-anchor': 'middle', fill: t.ink_2, 'font-size': p.title.length > 24 ? 11.5 : 13 });
    });
    var edges = LINKS.map(function (e) {
      var a = pos[e[0]], b = pos[e[1]], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - (a.x === b.x ? 0 : 0), bend = a.x === b.x ? 60 : 0;
      var path = P.svg('path', { d: 'M' + a.x + ',' + a.y + 'Q' + (mx + bend) + ',' + my + ' ' + b.x + ',' + b.y, fill: 'none', stroke: t.rule_2, 'stroke-width': 1.6 }, svg);
      return { from: e[0], to: e[1], text: e[2], path: path };
    });
    var nodes = {};
    Object.keys(pos).forEach(function (id) {
      var q = pos[id], g = P.svg('g', { tabindex: 0, role: 'link', 'aria-label': (SA.i18n.isEnglish() ? 'Laboratory ' : 'Laboratorio ') + q.lab.num + ': ' + q.lab.title, style: 'cursor:pointer' }, svg);
      P.svg('rect', { x: q.x - NW / 2, y: q.y - 24, width: NW, height: 48, rx: 10, fill: t.card, stroke: t.rule_2, 'stroke-width': 1.4 }, g);
      P.text(g, q.x - NW / 2 + 10, q.y - 4, q.lab.num, { fill: t.accent, 'font-family': t.serif, 'font-size': 15, 'font-weight': 700 });
      var words = q.lab.title.split(' '), l1 = '', l2 = '';
      words.forEach(function (w) { if ((l1 + ' ' + w).trim().length <= 17 && !l2) l1 = (l1 + ' ' + w).trim(); else l2 = (l2 + ' ' + w).trim(); });
      if (l2.length > 19) l2 = l2.slice(0, 18) + '…';
      P.text(g, q.x - NW / 2 + 36, q.y - 4, l1, { fill: t.ink, 'font-size': 12.5, 'font-weight': 600 });
      if (l2) P.text(g, q.x - NW / 2 + 36, q.y + 12, l2, { fill: t.ink, 'font-size': 12.5, 'font-weight': 600 });
      nodes[id] = g;
      var on = function () {
        edges.forEach(function (e) { var hit = e.from === id || e.to === id; e.path.setAttribute('stroke', hit ? t.accent : t.rule); e.path.setAttribute('stroke-width', hit ? 2.6 : 1); e.path.setAttribute('stroke-opacity', hit ? 1 : 0.5); });
        Object.keys(nodes).forEach(function (k) { var linked = k === id || edges.some(function (e) { return (e.from === id && e.to === k) || (e.to === id && e.from === k); }); nodes[k].setAttribute('opacity', linked ? 1 : 0.35); });
        var mine = edges.filter(function (e) { return e.from === id || e.to === id; });
        caption.innerHTML = '';
        caption.append(el('strong', q.lab.num + ' · ' + q.lab.title + '. '), q.lab.blurb, el('ul', { style: 'margin:6px 0 0;padding-left:18px' }, mine.map(function (e) {
          var other = pos[e.from === id ? e.to : e.from].lab; return el('li', (e.from === id ? 'porta a ' : 'viene da ') + other.num + ' ' + other.title + ': ' + e.text);
        })));
      };
      var off = function () { edges.forEach(function (e) { e.path.setAttribute('stroke', t.rule_2); e.path.setAttribute('stroke-width', 1.6); e.path.setAttribute('stroke-opacity', 1); }); Object.keys(nodes).forEach(function (k) { nodes[k].setAttribute('opacity', 1); }); };
      var go = function () { closePart(); location.hash = '#/' + id; };
      g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('mouseleave', off);
      g.addEventListener('click', go); g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
    });
    modalBack = el('div.modal-back', { onclick: closePart });
    modal = el('div.modal.modal-wide', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
      el('div.modal-head.modal-head-plain', el('div', el('div.kicker', 'Sfoglia l’atlante'), el('h2', { id: 'modal-title' }, 'Come si collegano i laboratori'),
        el('p.muted', 'Ogni colonna è una parte; ogni freccia un concetto che un laboratorio prepara per un altro. Non serve seguire l’ordine: parti da ciò che ti incuriosisce.')),
        SA.ui.button('', { icon: 'close', cls: 'btn-ghost btn-icon modal-close', aria: 'Chiudi', onclick: closePart })),
      box, caption);
    document.body.append(modalBack, modal); document.body.style.overflow = 'hidden';
    SA.i18n.localizeSurface(modal);
    document.addEventListener('keydown', escPart);
    modal.querySelector('.modal-close').focus();
  }

  /* Finestra di una parte, con le schede dei suoi laboratori */
  var modal = null, modalBack = null, modalLast = null;
  function closePart() {
    if (!modal) return;
    modal.remove(); modalBack.remove(); modal = null; document.body.style.overflow = '';
    document.removeEventListener('keydown', escPart);
    if (modalLast) modalLast.focus();
  }
  function escPart(e) {
    if (e.key === 'Escape') { e.preventDefault(); closePart(); return; }
    if (e.key !== 'Tab' || !modal) return;
    var focusable = Array.prototype.filter.call(modal.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled])'), function (n) { return n.getClientRects().length; });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openPart(p) {
    closePart(); modalLast = document.activeElement;
    var d = PART_DESC[p.part];
    modalBack = el('div.modal-back', { onclick: closePart });
    modal = el('div.modal', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
      el('div.modal-head',
        el('div.modal-art', { html: SA.art.get(d[0]), 'aria-hidden': 'true' }),
        el('div', el('div.kicker', (SA.i18n.isEnglish() ? 'Part ' : 'Parte ') + p.part), el('h2', { id: 'modal-title' }, p.title), el('p.muted', SA.i18n.isEnglish() ? SA.english.parts[p.part][1] : d[1])),
        SA.ui.button('', { icon: 'close', cls: 'btn-ghost btn-icon modal-close', aria: 'Chiudi', onclick: closePart })),
      el('div.cards', p.labs.map(function (l) {
        var ready = l.status === 'ready', st = STATUS[l.status];
        var inner = [el('div.card-art', { html: SA.art.get(l.id), 'aria-hidden': 'true' }),
          el('div.card-body', el('span.num', (SA.i18n.isEnglish() ? 'Lab ' : 'Laboratorio ') + l.num), el('h3', l.title), el('p', l.blurb), ready ? el('span.card-go', 'Apri il laboratorio →') : el('span.tag' + (st[0] ? '.' + st[0] : ''), st[1]), l.verifyR ? el('span.tag.tag-new', { style: 'margin-top:6px;align-self:flex-start' }, 'Anteprima · script R da verificare') : null)];
        return ready ? el('a.card', { href: '#/' + l.id, onclick: closePart }, inner) : el('div.card.is-soon', inner);
      })));
    document.body.append(modalBack, modal); document.body.style.overflow = 'hidden';
    SA.i18n.localizeSurface(modal);
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
    var en = SA.i18n.isEnglish();
    var owner = el('a', {href:'https://gianlucasottile.rbind.io/', target:'_blank', rel:'noopener noreferrer'}, 'Gianluca Sottile');
    var ownerEmail = el('a', {href:'mailto:Gianluca.sottile@unipa.it', 'aria-label':en?'Email Gianluca Sottile':'Scrivi a Gianluca Sottile'}, 'email');
    var source = el('a', {href:'https://marcellochiodi.github.io/simul2000/', target:'_blank', rel:'noopener noreferrer'}, 'Simul2000');
    var colleague = el('a', {href:'mailto:Marcello.chiodi@unipa.it', 'aria-label':en?'Email Marcello Chiodi':'Scrivi a Marcello Chiodi'}, 'Marcello Chiodi');
    if(en) return el('footer.foot',
      el('p','StatAtlas · a teaching project by ',owner,' (',ownerEmail,'). Some experiments are inspired by ',source,' by ',colleague,'; this application’s code and texts are original.'),
      el('p','Random numbers reproduce R’s Mersenne Twister where documented. Full R/JavaScript numerical equivalence is established only for the verified cases; see the validation matrix.'));
    return el('footer.foot',
      el('p','StatAtlas · progetto didattico di ',owner,' (',ownerEmail,'). Alcuni laboratori traggono ispirazione dalle idee di ',source,' di ',colleague,' (Università di Palermo); codice e testi sono originali.'),
      el('p','Numeri casuali generati con il Mersenne-Twister di R. La riproducibilità dei campioni e la concordanza con R sono documentate per ciascun laboratorio; i confronti R ancora da completare sono segnalati esplicitamente.'));
  }

  /* Arricchisce ogni laboratorio con copertina, obiettivi, “che cosa stiamo valutando” e guida alla tabella */
  /* ingrandimento dei pannelli: il riquadro viene spostato in una finestra sopra la pagina (aggiornamenti dal vivo
   * compresi) e rimesso al suo posto alla chiusura: Esc, clic fuori, pulsante ✕ o cambio di pagina. */
  var zoom = null;
  function closeZoom() {
    if (!zoom) return;
    var z = zoom; zoom = null;
    z.ph.parentNode.replaceChild(z.fig, z.ph); z.fig.classList.remove('fig-in-modal');
    z.btn.textContent = '⤢'; z.btn.setAttribute('aria-label', SA.i18n.tr('Ingrandisci il grafico')); z.btn.title = SA.i18n.tr('Ingrandisci il grafico');
    z.overlay.remove(); document.documentElement.classList.remove('zoom-open');
    var cur = SA.currentLab && SA.labs[SA.currentLab]; if (cur && cur.redraw) cur.redraw();
    z.btn.focus();
  }
  function openZoom(fig, btn) {
    closeZoom();
    var ph = el('div.fig-placeholder', { style: 'height:' + fig.offsetHeight + 'px' });
    var box = el('div.fig-modal-box', { role: 'dialog', 'aria-modal': 'true', 'aria-label': (fig.querySelector('h3') || {}).textContent || 'Grafico ingrandito' });
    var overlay = el('div.fig-modal', box);
    var close = SA.ui.button(SA.i18n.tr('Chiudi grafico'), { icon: 'close', cls: 'fig-modal-close', aria: SA.i18n.tr('Chiudi il grafico ingrandito'), onclick: closeZoom });
    box.appendChild(close);
    overlay.addEventListener('click', function (ev) { if (ev.target === overlay) closeZoom(); });
    fig.parentNode.replaceChild(ph, fig); box.appendChild(fig); fig.classList.add('fig-in-modal');
    document.body.appendChild(overlay); document.documentElement.classList.add('zoom-open');
    btn.textContent = '✕'; btn.setAttribute('aria-label', SA.i18n.isEnglish() ? 'Close enlarged chart' : 'Chiudi l’ingrandimento'); btn.title = SA.i18n.tr('Chiudi (Esc)');
    zoom = { fig: fig, ph: ph, overlay: overlay, btn: btn };
    var cur = SA.currentLab && SA.labs[SA.currentLab]; if (cur && cur.redraw) cur.redraw();
    if (window.matchMedia && window.matchMedia('(max-width: 640px)').matches) close.focus(); else btn.focus();
  }
  function zoomable(page) {
    page.querySelectorAll('.fig').forEach(function (f, i) {
      if (f.querySelector(':scope > .fig-zoom-btn')) return;
      var b = el('button.fig-zoom-btn', { type: 'button', title: 'Ingrandisci il grafico', 'aria-label': 'Ingrandisci il grafico' }, '⤢');
      b.addEventListener('click', function () { if (zoom && zoom.fig === f) closeZoom(); else openZoom(f, b); });
      f.insertBefore(b, f.firstChild);
      if (i === 0) f.appendChild(el('p.fig-mobile-tip', 'Su smartphone: tocca ⤢ per ingrandire e scorrere il grafico.'));
    });
  }
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && zoom) { ev.stopPropagation(); closeZoom(); } }, true);
  window.addEventListener('hashchange', closeZoom);
  /* Navigazione rapida SOLO su smartphone. Scorre ai contenuti esistenti e non avvia
   * né duplica le simulazioni; conserva un'unica sorgente di stato per i runner. */
  function addMobileLabNav(page) {
    // Lab 01-25: historical chart/transport layout. Lab 26-31: one
    // continuous spatial studio with its own map, controls and statistics.
    // Links are derived from existing elements: no duplicate map or runner.
    var spatial = page.querySelector('.spatial-studio');
    var entries = spatial ? [
      ['Parametri', spatial.querySelector('.spatial-studio-panel')],
      ['Mappa', spatial.querySelector('.spatial-studio-map')],
      ['Risultati', spatial.querySelector('.spatial-studio-stats')],
      ['Inizio', page.querySelector('.lab-head')]
    ] : [
      ['Parametri', page.querySelector('.lab-grid .controls')],
      ['Grafici', page.querySelector('.lab-grid .figure') || page.querySelector('.fig')],
      ['Risultati', page.querySelector('.tbl-wrap')],
      ['Inizio', page.querySelector('.lab-head')]
    ];
    entries = entries.filter(function (pair) { return !!pair[1]; });
    if (entries.length < 2) return;
    var nav = el('nav.lab-mobile-nav', { 'aria-label': SA.i18n.tr('Vai alle sezioni del laboratorio') });
    entries.forEach(function (pair) {
      var b = el('button', { type: 'button', 'aria-label': 'Vai a ' + pair[0].toLowerCase(),
        onclick: function () {
          var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          pair[1].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        } }, pair[0]);
      if (SA.i18n.isEnglish()) b.textContent = SA.i18n.tr(pair[0]);
      nav.appendChild(b);
    });
    page.appendChild(nav);
  }

  function enhanceLab(page, id) {
    zoomable(page); if (SA.math) SA.math.typeset(page);
    var c = SA.content && SA.content[id], head = page.querySelector('.lab-head'), englishMode=SA.i18n.isEnglish();
    if (head) {
      var text = head.firstElementChild, btn = head.querySelector(':scope > .btn');
      if (c) text.appendChild(el('ul.chips', { 'aria-label': 'Obiettivi' }, (englishMode ? [SA.english.labs[id].question, SA.english.labs[id].experiment, SA.english.labs[id].essential] : c.obiettivi).map(function (o) { return el('li', o); })));
      if (SA.findLab(id).lab.verifyR) text.appendChild(el('div.callout.warn', { style: 'max-width:70ch' }, el('strong', 'Anteprima. '), 'Laboratorio nuovo: lo script R non è ancora stato verificato in un’installazione reale di R. I risultati del browser sono testati; quelli dello script vanno confermati.'));
      if (btn) text.appendChild(el('div.head-actions', btn));
      var info = SA.findLab(id);
      head.appendChild(el('figure.lab-cover', { html: SA.art.get(id) + '<figcaption>Tavola ' + info.lab.num + ' · ' + info.part.title + '</figcaption>', 'aria-hidden': 'true' }));
    }
    // Macrofase B: un percorso per laboratorio, senza modificare simulazioni o stato numerico.
    if (SA.courseBridge) SA.courseBridge.mount(page, id, SA.findLab(id));
    // la previsione diventa un riquadro facoltativo dentro la domanda; i passi si rinumerano
    var steps = page.querySelectorAll('section.step');
    if (steps.length > 1 && /previsione/i.test(steps[1].querySelector('.step-label').textContent)) {
      var det = el('details.predict', el('summary', el('span', 'Prima di guardare: che cosa ti aspetti?'), el('span.predict-tag', 'facoltativo')));
      Array.prototype.slice.call(steps[1].querySelector('.step-body').children, 1).forEach(function (n) { det.appendChild(n); });
      steps[0].querySelector('.step-body').appendChild(det);
      steps[1].remove();
      page.querySelectorAll('section.step').forEach(function (s, i) { s.querySelector('.step-num').textContent = String(i + 1); });
    }
    // Guida didattica condivisa: una sola componente, contenuto specifico per laboratorio.
    // Sostituisce le guide locali precedenti senza toccare controlli o algoritmi.
    var d = SA.pedagogy && SA.pedagogy[id];
    if (d && d.guida && d.guida.length) {
      var experiment = Array.prototype.find.call(page.querySelectorAll('section.step'), function (section) {
        var lab = section.querySelector('.step-label');
        return lab && /esperimento/i.test(lab.textContent);
      });
      if (experiment) {
        experiment.querySelectorAll('.moran-guide').forEach(function (old) { old.remove(); });
        var body = experiment.querySelector('.step-body');
        var how = el('details.lab-howto', { open: !window.matchMedia || !window.matchMedia('(max-width: 760px)').matches, 'data-lab-guide': id },
          el('summary', el('span.lab-howto-title', 'Come usare il laboratorio'), el('span.lab-howto-meta', englishMode ? '4 steps · select to close' : d.guida.length + ' mosse · clic per chiudere')),
          el('div.lab-howto-body',
            el('p.lab-howto-intro', englishMode ? 'Inspect the data and graphics before adjusting controls to test your prediction.' : 'Esplora prima il campione e i grafici, quindi usa i controlli per verificare la tua previsione.'),
            el('ol.lab-howto-list', (englishMode ? SA.i18n.englishGuide(id) : d.guida).map(function (item) { return el('li', item); }))));
        var title = body.querySelector(':scope > h2');
        body.insertBefore(how, title ? title.nextSibling : body.children[1] || null);
      }
    }
    if (!c) return;
    var grid = page.querySelector('.lab-grid');
    if (grid) grid.parentNode.insertBefore(el('div.focus-box',
      el('div.focus-title', el('span.focus-icon', { 'aria-hidden': 'true' }, '◎'), 'Che cosa stiamo valutando'),
      el('dl.focus-grid', (englishMode ? [['Research focus',SA.english.labs[id].question],['Suggested experiment',SA.english.labs[id].experiment],['Methodological scope',SA.english.labs[id].limit]] : c.valutiamo).map(function (v) { return el('div', el('dt', v[0]), el('dd', v[1])); }))), grid);
    var tbl = page.querySelector('.tbl-wrap');
    if (tbl) {
      tbl.parentNode.insertBefore(el('div.table-guide', el('strong', englishMode ? 'How to read the table. ' : 'Come leggere la tabella. '), englishMode ? SA.english.labs[id].essential : c.tabella), tbl);
      tbl.parentNode.insertBefore(el('p.table-scroll-hint', 'Scorri orizzontalmente la tabella per vedere tutte le colonne.'), tbl);
    }
  }

  function route() {
    closeMenu(false);
    SA.ui.closeDrawer();
    if (SA.mobileTransport) SA.mobileTransport.teardown();
    if (SA.workbench) SA.workbench.teardown();
    var id = (location.hash.replace(/^#\/?/, '').split('/')[0]) || '';
    if (current && current.unmount) current.unmount();
    current = null;
    main.innerHTML = '';
    if (SA.ui) SA.ui.activeRunner = null;
    sidebar.querySelectorAll('.nav-link').forEach(function (a) {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var info = id && find(id);
    if (id === 'teachers' && SA.teachers) {
      SA.currentLab = null; var teacherPage = el('div.teacher-page'); main.appendChild(teacherPage); SA.teachers.builder(teacherPage); teacherPage.appendChild(footer()); document.title = 'StatAtlas for Teachers';
    } else if (!info) { SA.currentLab = null; main.appendChild(home()); document.title = 'StatAtlas'; }
    else if (SA.labs[id]) {
      var page = el('div.page'); main.appendChild(page);
      SA.currentLab = id;
      current = SA.labs[id]; current.mount(page, info); enhanceLab(page, id);
      if (SA.challenges) SA.challenges.mount(page, id);
      addMobileLabNav(page); page.appendChild(footer());
      if (SA.i18n.isEnglish()) {
        var guide = SA.i18n.companion(id);
        var head = page.querySelector('.lab-head');
        if (guide && head) head.insertAdjacentElement('afterend', guide);
        SA.i18n.replaceLabProse(page, id);
        SA.i18n.localizeSurface(page);
        // Interactive result panels are redrawn by their laboratories. Translate
        // newly generated display labels on the next user action, without
        // touching RNG, numerical values, form values or scientific state.
        page.addEventListener('click', function () {
          requestAnimationFrame(function () { if (page.isConnected) SA.i18n.localizeCurrent(page); });
        });
        page.addEventListener('change', function () {
          requestAnimationFrame(function () { if (page.isConnected) SA.i18n.localizeCurrent(page); });
        });
      }
      if (SA.experiments) SA.experiments.mount(page,id);
      if (SA.teachers && !document.getElementById('teacherStudent')) {
        var teach = SA.ui.el('button.btn.btn-ghost',{type:'button',onclick:function(){
          try { SA.teachers.addCurrent(); } catch(err) { SA.ui.toast(err.message); }
        }}, SA.i18n.isEnglish() ? 'Add experiment to teaching path' : 'Aggiungi esperimento al percorso docente');
        var expPanel=page.querySelector('.experiment-panel');
        if (expPanel) { teach.classList.add('ux-teacher-add'); expPanel.appendChild(teach); }
      }
      if (SA.workbench) SA.workbench.mount(page,id);
      if (SA.mobileTransport) SA.mobileTransport.mount(page,id);
      if (SA.i18n.isEnglish()) { SA.i18n.localizeSurface(page); SA.i18n.watchLive(page); }
      document.title = info.lab.title + ' · StatAtlas';
    } else { main.appendChild(soon(info)); document.title = info.lab.title + ' · StatAtlas'; }
    window.scrollTo(0, 0);
    var h = main.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  SA.start = function () {
    el = SA.ui.el;
    SA.i18n.init();
    SA.i18n.applyCatalog(SA.catalog);
    try { var th = localStorage.getItem('sa-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    sidebar = document.getElementById('sidebar'); main = document.getElementById('main');
    buildSidebar();
    var tb = document.getElementById('topBrand'); if (tb) tb.insertAdjacentHTML('afterbegin', SA.art.logo(30));
    menuBtn = document.getElementById('menuBtn');
    menuBtn.appendChild(SA.ui.icon('menu'));
    menuBtn.setAttribute('aria-controls', 'sidebar');
    menuBtn.addEventListener('click', toggleMenu);
    menuBackdrop = el('div.nav-backdrop', { 'aria-hidden': 'true', onclick: function () { closeMenu(true); } });
    menuBackdrop.hidden = true; document.body.appendChild(menuBackdrop);
    window.addEventListener('resize', function () { if (!compactLayout()) sidebar.classList.remove('open'); updateMenuAccessibility(); });
    document.addEventListener('keydown', mobileMenuKeydown);
    updateMenuAccessibility();
    window.addEventListener('hashchange', route);
    route();
  };
})();

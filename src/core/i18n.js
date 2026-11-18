/* StatAtlas language infrastructure — offline, explicit translations only.
 * DO NOT use machine-looking word substitutions for scientific text.
 * Italian lab source remains authoritative until each passage is reviewed.
 */
(function () {
  'use strict';
  var SA = window.SA || (window.SA = {});
  var locale = 'it';
  var original = null;
  var strings = {
    'Vai al contenuto':'Skip to main content',
    'Laboratori di probabilità e inferenza':'Probability and statistical inference labs',
    'Chiudi indice':'Close laboratory index',
    'Chiudi indice dei laboratori':'Close laboratory index',
    'Apri indice dei laboratori':'Open laboratory index',
    'Laboratori':'Laboratories',
    'Tema':'Theme',
    'Cambia tema chiaro/scuro':'Toggle light and dark theme',
    'Atlante interattivo di probabilità e statistica':'Interactive atlas of probability and statistics',
    'Vedere la statistica':'See statistics',
    'mentre accade':'as it happens',
    'Sfoglia l’atlante: la mappa dei laboratori':'Explore the atlas: the laboratory map',
    'Studia anche con R ↗':'Learn with R ↗',
    'Come funziona un laboratorio':'How a laboratory works',
    'Domanda':'Question',
    'Esperimento':'Experiment',
    'Teoria e simulazione':'Theory and simulation',
    'Interpretazione':'Interpretation',
    'Approfondisci':'Explore further',
    'Corso R':'R course',
    'Codice R':'R code',
    'Un problema concreto, con una previsione facoltativa':'A concrete question, with an optional prediction',
    'Dati generati sotto i tuoi occhi, passo dopo passo':'Watch data being generated, one step at a time',
    'Esatto, asintotico o Monte Carlo: sempre dichiarato':'Exact, asymptotic or Monte Carlo: always identified',
    'Che cosa significa, quando vale, dove si rompe':'What it means, when it applies and when it fails',
    'Teoria, esercizi e bibliografia':'Theory, exercises and references',
    'Lezioni collegate e scheda studente':'Related lessons and student worksheet',
    'Script riproducibili con verifiche numeriche documentate':'Reproducible scripts with documented numerical checks',
    'Come leggere i risultati':'How to read the results',
    'Che cosa riproduce lo script R':'What the R script reproduces',
    'esatto':'exact',
    'asintotico':'asymptotic',
    'approssimato':'approximate',
    'Laboratorio':'Laboratory',
    'Apri il laboratorio →':'Open laboratory →',
    'Apri →':'Open →',
    'Sfoglia l’atlante':'Explore the atlas',
    'Come si collegano i laboratori':'How the laboratories connect',
    'Passa sopra un laboratorio per vedere i suoi legami; clicca per aprirlo.':'Focus on a laboratory to reveal its links; select it to open.',
    'Chiudi':'Close',
    'Ingrandisci il grafico':'Enlarge chart',
    'Chiudi il grafico ingrandito':'Close enlarged chart',
    'Chiudi grafico':'Close chart',
    'Chiudi (Esc)':'Close (Esc)',
    'Su smartphone: tocca ⤢ per ingrandire e scorrere il grafico.':'On a phone, select ⤢ to enlarge and scroll the chart.',
    'Prima di guardare: che cosa ti aspetti?':'Before observing: what do you expect?',
    'facoltativo':'optional',
    'Come usare il laboratorio':'How to use this laboratory',
    'Che cosa stiamo valutando':'What we are measuring',
    'Come leggere la tabella. ':'How to read this table. ',
    'Scorri orizzontalmente la tabella per vedere tutte le colonne.':'Scroll the table horizontally to see every column.',
    'Vai alle sezioni del laboratorio':'Jump to laboratory sections',
    'Parametri':'Parameters',
    'Grafici':'Charts',
    'Mappa':'Map',
    'Risultati':'Results',
    'Inizio':'Top',
    'Obiettivi':'Objectives',
    'Obiettivi di apprendimento':'Learning objectives',
    'Un esempio svolto':'A worked example',
    'Errori frequenti':'Common mistakes',
    'Per andare oltre':'Further reading',
    'Esercizi in preparazione.':'Exercises in preparation.',
    'Bibliografia in preparazione.':'References in preparation.',
    'Mostra la soluzione':'Show solution',
    'In questa scheda':'On this page',
    'Definizione':'Definition',
    'Risultato':'Result',
    'Esempio':'Example',
    'Nota':'Note',
    'Copia':'Copy',
    'Scarica .R':'Download .R',
    'Codice copiato':'Code copied',
    'Figura esportata':'Figure exported',
    'Passo':'Step',
    'Avvia':'Start',
    'Pausa':'Pause',
    'Completa':'Complete',
    'Azzera':'Reset',
    'Velocità':'Speed',
    'Campione':'Sample',
    'Numerosità':'Sample size',
    'Numerosità campionaria':'Sample size',
    'Repliche':'Replicates',
    'Teoria':'Theory',
    'Simulazione':'Simulation',
    'Esporta':'Export',
    'Ricalcola':'Recalculate',
    'Domanda statistica e ipotesi':'Statistical question and assumptions',
    'Lettura dell’esperimento':'How to read the experiment',
    'Enunciato e derivazione':'Statement and derivation',
    'Quando il risultato non vale':'When the result does not apply',
    'Verifica empirica mirata':'Targeted empirical check',
    'Versione inglese in preparazione':'English-language edition in progress',
    'Ogni valore teorico dichiara la propria natura, per non confondere ciò che vale sempre con ciò che vale al limite.':'Every theoretical value is identified as exact, asymptotic, approximate or simulated; do not confuse finite-sample guarantees with limiting statements.',
    'vale per ogni numerosità, senza approssimazioni':'valid at every sample size, without approximation',
    'vale al crescere di n: per n piccolo può essere impreciso':'valid asymptotically: it may be inaccurate at small n',
    'formula o calcolo numerico approssimato, con l’errore indicato':'numerical or analytical approximation, with stated error',
    'stima ottenuta dalla simulazione, con il suo errore casuale':'simulation-based estimate with sampling variability',
    'Il generatore di numeri casuali di R è ricostruito nel browser. Ogni script dichiara fin dove arriva la corrispondenza.':'R’s random generator is reproduced in the browser. Each script reports its documented reproducibility level.',
    'Stessi dati':'Same data',
    'Stesse misure':'Same estimates',
    'Stesso algoritmo':'Same algorithm',
    'Confronto di metodo':'Method comparison',
    'stesso seed, stessi campioni, stesse suddivisioni':'same seed, samples and splits',
    'stesse stime ed errori, a meno dell’arrotondamento':'same estimates and errors within rounding',
    'stessi passi e stesse regole nei casi di parità':'identical steps and tie-breaking rules',
    'pacchetti che seguono regole diverse: risultati vicini, non identici':'different algorithms or libraries: method-level, not bitwise, agreement',
    'Apri il laboratorio →':'Open laboratory →',
    'Che cosa significa, quando vale, dove si rompe':'Interpretation, assumptions and failure cases'
  };
  Object.assign(strings, SA.uiEnglish || {}, SA.liveEnglish || {});
  var lowerStrings = {}, reverseStrings = {};
  Object.keys(strings).forEach(function(k){
    lowerStrings[k.toLocaleLowerCase('it-IT')] = strings[k];
    if (!(strings[k] in reverseStrings)) reverseStrings[strings[k]] = k;
  });
  // Numerically parameterized status labels: translate the sentence while
  // preserving live numeric tokens, including counts, seeds and estimates.
  var numeric = /\d+(?:[.,]\d+)?/g;
  var templates = Object.keys(strings).filter(function(k){
    return numeric.test(k) && (numeric.lastIndex=0, true) &&
      (k.match(numeric)||[]).length === (strings[k].match(numeric)||[]).length;
  }).sort(function(a,b){return b.length-a.length;}).map(function(k){
    var pattern='^'+k.split(numeric).map(function(x){
      return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    }).join('([0-9]+(?:[.,][0-9]+)?)')+'$';
    return {regex:new RegExp(pattern), target:strings[k]};
  });
  function translateDisplay(x) {
    if (typeof x !== 'string' || !x) return x;
    if (Object.prototype.hasOwnProperty.call(strings, x)) return strings[x];
    var lowered = lowerStrings[x.toLocaleLowerCase('it-IT')];
    if (lowered !== undefined) return lowered;
    for (var i=0;i<templates.length;i++) {
      var m=templates[i].regex.exec(x); if (!m) continue;
      var j=0;
      return templates[i].target.replace(numeric,function(){
        return m[++j];
      });
    }
    return x;
  }
  function sourceDisplayName(x) { return reverseStrings[x] || x; }
  function tr(x) { return locale === 'en' && Object.prototype.hasOwnProperty.call(strings, x) ? strings[x] : x; }
  function isEnglish() { return locale === 'en'; }
  function init() {
    try {
      var stored = localStorage.getItem('sa-language');
      if (stored === 'en' || stored === 'it') locale = stored;
    } catch (e) {}
    document.documentElement.setAttribute('lang', locale);
    var skip = document.querySelector('a.sr-only[href="#main"]');
    if (skip) skip.textContent = tr('Vai al contenuto');
    var meta = document.querySelector('meta[name="description"]');
    if (meta && locale === 'en') meta.content = 'StatAtlas: an interactive atlas of probability and statistics with 31 reproducible laboratories.';
  }
  function applyCatalog(catalog) {
    if (!original) {
      original = catalog.map(function (p) {
        return {title:p.title, labs:p.labs.map(function (l) { return {title:l.title, blurb:l.blurb}; })};
      });
    }
    catalog.forEach(function (p, i) {
      p.title = isEnglish() ? SA.english.parts[p.part][0] : original[i].title;
      p.labs.forEach(function (l,j) {
        var en = SA.english.labs[l.id];
        l.title = isEnglish() && en ? en.title : original[i].labs[j].title;
        l.blurb = isEnglish() && en ? en.blurb : original[i].labs[j].blurb;
      });
    });
  }
  function setLanguage(next, catalog) {
    if (next !== 'it' && next !== 'en') return false;
    if (locale === next) return false;
    locale = next;
    try { localStorage.setItem('sa-language', next); } catch (e) {}
    document.documentElement.lang = locale;
    var skip = document.querySelector('a.sr-only[href="#main"]');
    if (skip) skip.textContent = tr('Vai al contenuto');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = isEnglish() ? 'StatAtlas: 31 reproducible interactive statistics laboratories.' : 'StatAtlas 2.1: 31 laboratori di statistica con simulazioni R riproducibili.';
    applyCatalog(catalog);
    return true;
  }
  function localizeSurface(root) {
    if (!isEnglish() || !root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n, targets = [];
    while ((n = walker.nextNode())) {
      var p = n.parentElement;
      if (!p || p.closest('pre, code, script, style, [data-no-localize], .en-companion, [lang=it]')) continue;
      var text = n.nodeValue;
      var trimmed = text.trim();
      if (trimmed && translateDisplay(trimmed) !== trimmed) {
        // A segmented control must retain its original action/trace token.
        var btn = p.closest('.controls .seg button');
        if (btn && !btn.dataset.traceValue) btn.dataset.traceValue = trimmed;
        targets.push({node:n, value:text.replace(trimmed, translateDisplay(trimmed))});
      }
    }
    targets.forEach(function (t) { t.node.nodeValue = t.value; });
    root.querySelectorAll('[aria-label], [title]').forEach(function (element) {
      ['aria-label','title'].forEach(function (a) {
        if (element.closest('[lang=it]')) return;
        var value = element.getAttribute(a);
        if (value && translateDisplay(value) !== value) {
          if (a === 'aria-label' && element.classList.contains('seg') && !element.dataset.traceName)
            element.dataset.traceName = value;
          element.setAttribute(a, translateDisplay(value));
        }
      });
    });
  }
  function localizeCurrent(root) {
    if (!isEnglish() || !root) return;
    // Challenge traces store their stable Italian control keys before this pass.
    // Translate visible text, never the form's value / name / selected index.
    localizeSurface(root);
  }

  function translateRComments(code,id) {
    if (!isEnglish() || !code) return code;
    var mapping = SA.englishRComments || {}, en=SA.english && SA.english.labs[id];
    return String(code).split('\n').map(function(line){
      var m = /^(\s*#\s*)(.*)$/.exec(line);
      if (!m) return line;
      var original = m[2], translated = mapping[original];
      if (!translated && /^StatAtlas · Lab (\d+)/.test(original) && en)
        translated = 'StatAtlas · Lab '+RegExp.$1+' — '+en.title;
      if (!translated && /^StatAtlas · Parte VIII unificata/.test(original) && en)
        translated = 'StatAtlas · Spatial statistics · '+en.title;
      return m[1]+(translated || original);
    }).join('\n');
  }
  function challengeTasks(id, tasks) {
    if (!isEnglish() || !tasks) return tasks;
    var data = SA.englishChallenges && SA.englishChallenges[id];
    if (!data || data.length !== tasks.length) return tasks;
    return tasks.map(function(q, i) {
      var t = data[i];
      var focus = (SA.englishChallenges.focus || {})[q.focus] || q.focus;
      var task;
      if (SA.englishChallenges.pilotTasks && SA.englishChallenges.pilotTasks[id]) {
        task = SA.englishChallenges.pilotTasks[id][i];
      } else if (i === 0) {
        task = 'Open the challenge before changing any controls. Take at least one simulation step, then answer the conceptual question.';
      } else if (i === 1) {
        task = 'Open the challenge first; change the “' + focus + '” control and then run at least two simulation steps at the new setting. Compare your results before answering.';
      } else {
        task = 'Open the challenge first. Compare two values of “' + focus + '” while keeping other settings fixed; collect at least three comparable observations in each configuration. ' +
          ((id === 'boost' || id === 'reti-neurali') ? 'Restart before configuration A and compare matched checkpoints with the same seed and data. ' : '') +
          'Interpret the numerical A/B comparison, not as independent replications when steps are correlated.';
      }
      if (id === 'penalizzata') task = 'First select the Paths view for simulation. ' + task;
      return Object.assign({}, q, {title:t[0],question:t[1],options:t[2].slice(),explanation:t[3],
        task:task,level:['Understanding','Application','Advanced'][i]});
    });
  }
  function trStatus(message) {
    if (!isEnglish() || !message) return message;
    var exact = {
      'Laboratorio non inizializzato.':'Laboratory not initialized.',
      'Seleziona una risposta prima di verificare.':'Select an answer before checking.',
      'Rispondi anche alla domanda sui due risultati numerici osservati.':'Also answer the question comparing the two observed numerical results.',
      'Mancano statistiche numeriche confrontabili.':'No comparable numerical statistics are available yet.',
      'Sfida completata: interpretazione e lettura dei risultati corrette.':'Challenge completed: both interpretation and numerical comparison are correct.',
      'Rivedi l’interpretazione teorica.':'Review the theoretical interpretation.',
      'Rivedi il confronto dei valori numerici A e B.':'Review the numerical comparison between A and B.',
      'Sfida completata.':'Challenge completed.',
      'Risposta da rivedere.':'Review your answer.',
      'Mantieni ordinary kriging e il modello di covarianza assunto iniziale.':'Keep ordinary kriging and the original assumed covariance model.',
      'Aggiungi almeno un sensore dopo aver aperto la sfida.':'Add at least one sensor after opening this challenge.',
      'Seleziona il metodo IDW.':'Select the IDW method.',
      'Confronta la varianza media di kriging prima e dopo.':'Compare mean kriging variance before and after.',
      'Seleziona «Percorsi» nella vista del laboratorio per attivare le repliche.':'Select the Paths view to enable replications.',
      'Due configurazioni comparabili: interpreta la tabella A/B e rispondi.':'The configurations are comparable: interpret the A/B table and answer.'
    };
    if (exact[message]) return exact[message];
    function focusEN(f){ return (SA.englishChallenges && SA.englishChallenges.focus && SA.englishChallenges.focus[f]) || translateDisplay(f); }
    var match;
    if (message === 'Un risultato numerico valido è stato registrato.') return 'A valid numerical result has been recorded.';
    if (message === 'Esegui almeno un passo che produca un valore numerico valido.') return 'Take at least one simulation step that produces a valid numerical result.';
    if ((match=/^Il controllo «([^»]+)» non è disponibile in questa configurazione\.$/.exec(message))) return 'The “'+focusEN(match[1])+'” control is unavailable in this configuration.';
    if ((match=/^Modifica «([^»]+)» nel pannello Parametri\.$/.exec(message))) return 'Change the “'+focusEN(match[1])+'” control in the Parameters panel.';
    if ((match=/^Dopo aver modificato «([^»]+)», genera almeno due misure valide con il nuovo valore \((\d+)\/2\)\.$/.exec(message))) return 'After changing “'+focusEN(match[1])+'”, collect at least two valid measurements using the new setting ('+match[2]+'/2).';
    if ((match=/^Ottieni misure valide in due configurazioni di «([^»]+)»\. Mantieni costanti tutti gli altri controlli\.$/.exec(message))) return 'Collect valid measurements in two settings of “'+focusEN(match[1])+'”; keep all other controls fixed.';
    if ((match=/^Risultato: ([^=]+) = (.+)\.$/.exec(message))) return 'Result: '+focusEN(match[1].trim())+' = '+match[2]+'.';
    if ((match=/^Ultimo risultato: ([^=]+) = (.+)\.$/.exec(message))) return 'Latest result: '+focusEN(match[1].trim())+' = '+match[2]+'.';
    if ((match=/^Confronto appaiato su (\d+) checkpoint comuni/.exec(message))) return 'Paired comparison across '+match[1]+' matched checkpoints with unchanged seed and data. Successive steps of one trajectory are not independent replicates.';
    if (/^Confronto descrittivo tra misurazioni/.test(message)) return 'Descriptive comparison of measurements without demonstrated pairing. Differences in random seeds, datasets or trajectories may affect the result; no statistical significance is implied.';
    if (/^Confronto confuso:/.test(message)) return 'Confounded comparison: other settings changed. Hold all other controls fixed and repeat configurations A and B.';
    if ((match=/^Indicatore: ([^.]+)\. A \(«([^»]+)»\): (.+) \((\d+) misure\); B \(«([^»]+)»\): (.+) \((\d+) misure\)\./.exec(message))) return 'Indicator: '+focusEN(match[1])+'. A ('+match[2]+'): '+match[3]+' ('+match[4]+' measurements); B ('+match[5]+'): '+match[6]+' ('+match[7]+' measurements). Interpret the A/B comparison using matched checkpoints where available.';
    var m = message;
    m = m.replace(/^Genera almeno ([0-9]+) intervalli \(ora: ([0-9]+)\)\./, 'Generate at least $1 intervals (current: $2).')
      .replace(/^Esegui almeno ([0-9]+) repliche \(ora: ([0-9]+)\)\./,'Run at least $1 replications (current: $2).')
      .replace(/^Produci almeno cinque repliche \(ora: ([0-9]+)\)\./,'Generate at least five replications (current: $1).')
      .replace(/^Mantieni fissi gli altri parametri \(diversi: (.+)\)\./,'Keep the other parameters fixed (changed: $1).')
      .replace(/^Completa almeno tre misure per configurazione:/,'Collect at least three observations per configuration:')
      .replace(/^Ripeti almeno tre checkpoint uguali/,'Repeat at least three matched checkpoints')
      .replace(/^Ottieni misure valide in due configurazioni/,'Collect valid observations under two configurations')
      .replace(/^Imposta /,'Set ')
      .replace(/^Usa sinusoide/,'Use the sinusoid')
      .replace(/^Seleziona /,'Select ')
      .replace(/^Conserva il campo iniziale/,'Keep the initial field')
      .replace(/^Modifica almeno un sensore/,'Move at least one sensor');
    return m === message ? 'Complete the required experiment settings and observations before checking your answer.' : m;
  }

  // The English learning drawer is self-contained and uses reviewed
  // mathematics, worked examples and practice. No Italian text is substituted
  // mechanically; the unchanged Italian source remains available in IT mode.
  function englishExtended(id, level, el) {
    var d = SA.english && SA.english.labs[id], e = SA.englishLessons && SA.englishLessons[id];
    var p = SA.pedagogy && SA.pedagogy[id], theory = SA.englishTheory && SA.englishTheory[id];
    if (!d || !e || !theory || !theory.essential || !theory.advanced) throw Error('Missing reviewed English lesson: '+id);
    var box = el('div.english-lesson', {'lang':'en'});
    if (level === 'base') {
      box.append(el('div.objectives',el('div.step-label','Learning objectives'),
        el('ul', [d.question,d.experiment,d.essential,d.limit].map(function(x){return el('li',x);}))),
        el('section.prose.pedagogy-extension',
          el('h2','Essential theory · concepts, assumptions and interpretation'),
          el('h3','Research question'),el('p',d.question),
          el('h3','Experimental design'),el('p',d.experiment),
          el('h3','Statistical interpretation'),el('p',d.essential),
          el('h3','Worked numerical example'),el('p',e.example),
          el('h3','Methodological foundations'),
          theory.essential.map(function(x){return el('p',x);}),
          el('h3','Common interpretation pitfalls'),el('p',d.limit)));
    } else if (level === 'adv') {
      box.appendChild(el('section.prose.pedagogy-extension',
        el('h2','Advanced theory · derivations and validity conditions'),
        el('h3','Key statistical result'),el('p',d.advanced),
        el('h3','Scope and assumptions'),el('p',d.limit),
        el('h3','Mathematical reasoning and inferential conditions'),
        theory.advanced.map(function(x){return el('p',x);}),
        el('h3','Interpretation and replication'),el('p',d.experiment)));
      if (p && p.formula) box.appendChild(el('div.prose.pedagogy-equation',
        el('p.muted','Reference mathematical identity — interpret under the stated assumptions'),
        el('div.eq',{'data-tex':p.formula})));
    } else if (level === 'ex') {
      box.append(el('p.muted','Try each exercise before revealing the suggested solution. Numerical questions use the same examples as the Italian course.'),
        el('div.english-exercises',e.exercises.map(function(q,i){
          return el('div.exercise',el('div.ex-num',String(i+1)),el('div',
            el('p',q[0]),el('details',el('summary','Show solution'),el('p',q[1]))));
        })));
    } else {
      var refs=(SA.content && SA.content[id] && SA.content[id].riferimenti)||[];
      box.append(el('p.muted','Selected books and articles supporting this laboratory.'),
        el('ol.refs',refs.map(function(ref){
          return el('li',String(ref).replace('liberamente disponibile online','freely available online')
            .replace('con esempi in R','with R examples').replace('cap.','chapter').replace(' ed.',' edition'));
        })));
    }
    return box;
  }
  function englishGuide(id) {
    var d=SA.english && SA.english.labs[id]; if(!d) return [];
    return [
      'Identify the population model, its parameters and the statistical question: '+d.question,
      d.experiment,
      'Use Step or Start, monitor the displayed estimates and compare them with the population quantities.',
      'Repeat under a changed sample size or model assumption. Interpretation: '+d.limit
    ];
  }

  function replaceLabProse(page, id) {
    if (!isEnglish()) return;
    var data=SA.english && SA.english.labs[id]; if(!data) return;
    var intro = page.querySelector('.lab-head .lede');
    if (intro) intro.textContent = data.blurb;
    var kicker = page.querySelector('.lab-head .kicker');
    if (kicker) kicker.textContent = kicker.textContent.replace(/Laboratorio\s+(\d+)/i, 'Laboratory $1');
    var objectives = page.querySelectorAll('.lab-head .chips li');
    var goals = SA.englishGoals && SA.englishGoals[id];
    if (goals && objectives.length) Array.prototype.forEach.call(objectives, function(li,i){
      li.textContent = goals[i] || goals[goals.length - 1];
    });
    var caption = page.querySelector('.lab-cover figcaption');
    if (caption) caption.textContent = caption.textContent.replace(/Tavola\s+(\d+)/i,'Plate $1');
    var coverGraphic = page.querySelector('.lab-cover svg[aria-label]');
    if (coverGraphic) coverGraphic.setAttribute('aria-label', data.title + ': visual introduction');
    page.querySelectorAll('p.question').forEach(function(p){
      if (!p.closest('.challenge-section')) p.textContent=data.question;
    });
    page.querySelectorAll('section.step').forEach(function(step){
      var lbl=step.querySelector('.step-label');
      if (!lbl || !/interpretazione|interpretation/i.test(lbl.textContent)) return;
      var body=step.querySelector('.step-body');
      if(!body) return;
      // The original dynamically updated node remains in the DOM and runs as
      // before, but only the reviewed English counterpart is shown in EN mode.
      Array.prototype.forEach.call(body.children,function(child){
        if (child.classList.contains('prose') && !child.classList.contains('en-interpretation'))
          child.classList.add('it-source-hidden');
      });
      var trans=document.createElement('div');
      trans.className='prose en-interpretation'; trans.lang='en';
      var h=document.createElement('h3');h.textContent='What the results mean';
      var p=document.createElement('p');p.textContent=data.essential;
      var q=document.createElement('p');q.textContent=data.limit;
      trans.append(h,p,q);body.insertBefore(trans,body.firstChild.nextSibling);
    });
  }

  function companion(id) {
    if (!isEnglish()) return null;
    var data = SA.english.labs[id];
    if (!data) return null;
    var el = SA.ui.el;
    var section = el('section.en-companion', {'lang':'en', 'aria-labelledby':'english-guide-'+id});
    section.appendChild(el('div.kicker','English scientific companion'));
    section.appendChild(el('h2#english-guide-'+id,'Question · experiment · interpretation'));
    section.appendChild(el('dl.en-companion-grid',
      el('div',el('dt','Research question'),el('dd',data.question)),
      el('div',el('dt','Suggested experiment'),el('dd',data.experiment))));
    section.appendChild(el('h3','Essential interpretation'));
    section.appendChild(el('p',data.essential));
    section.appendChild(el('details',el('summary','Advanced considerations and limits'),
      el('p',data.advanced), el('p',data.limit)));
    section.appendChild(el('p.en-coverage-note',
      'This English learning track provides scientific notes, worked examples, exercises and Challenges. ' +
      'Switch to Italian for the authoritative original chapters and unmodified R-script comments.'));
    return section;
  }
  var liveObserver=null;
  function watchLive(root) {
    if(liveObserver){liveObserver.disconnect();liveObserver=null;}
    if(!isEnglish() || !root || !window.MutationObserver) return;
    var pending=false, changed=new Set();
    liveObserver=new MutationObserver(function(changes){
      if(!root.isConnected) return;
      changes.forEach(function(m){
        if(m.type==='characterData') {
          if(m.target.parentElement) changed.add(m.target.parentElement);
        } else {
          m.addedNodes.forEach(function(n){
            if(n.nodeType===1) changed.add(n);
            else if(n.nodeType===3 && n.parentElement) changed.add(n.parentElement);
          });
        }
      });
      if(pending) return;
      // Process only changed nodes; never rescan hundreds of SVG marks on
      // each animation frame of an ongoing statistical simulation.
      pending=true;
      requestAnimationFrame(function(){
        pending=false;
        var items=Array.from(changed);changed.clear();
        if(!root.isConnected || !isEnglish()) return;
        items.forEach(function(n){
          if(n.isConnected && root.contains(n) && !n.closest('pre,code,script,style,[lang=it],.it-source-hidden')) {
            // text changes and new elements can both introduce Italian labels
            localizeSurface(n);
            if(n.matches && n.matches('[aria-label],[title]')) {
              ['aria-label','title'].forEach(function(a){var value=n.getAttribute(a);
                if(value) n.setAttribute(a,translateDisplay(value));});
            }
          }
        });
      });
    });
    liveObserver.observe(root,{subtree:true,childList:true,characterData:true});
  }
  SA.i18n = { display:translateDisplay, watchLive:watchLive, init:init, applyCatalog:applyCatalog, setLanguage:setLanguage, isEnglish:isEnglish,
    tr:tr, translateRComments:translateRComments, sourceDisplayName:sourceDisplayName, localizeSurface:localizeSurface, localizeCurrent:localizeCurrent, companion:companion, challengeTasks:challengeTasks, trStatus:trStatus, englishExtended:englishExtended, englishGuide:englishGuide, replaceLabProse:replaceLabProse, get language() {return locale;} };
})();

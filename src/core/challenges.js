/* StatAtlas Challenges · 31 laboratori (pilot con regole specialistiche 08, 18, 30).
 * The challenge layer only reads snapshots returned by the labs; it never
 * changes RNG, statistical estimators, training state or lab controls.
 * Results live in this page only; they are not an exam grade.
 */
(function () {
  'use strict';
  var SA = window.SA || (window.SA = {});
  function status(ok, message) { return { ready: ok, message: message || '' }; }
  var bank = {
    intervalli: [
      {
        id: 'ci-t', level: 'Comprensione', title: 'La promessa del 95%',
        task: 'Seleziona l’intervallo t per la media normale con varianza ignota, n non superiore a 20 e livello 95%. Genera almeno 100 intervalli, poi interpreta la frequenza di copertura osservata.',
        question: 'Quale affermazione è giustificata nel modello simulato?',
        options: ['Dopo l’osservazione, il parametro ha probabilità 95% di essere nel particolare intervallo.',
          'Prima del campionamento, la procedura t contiene la media vera nel 95% dei campioni.',
          'Se il campione è piccolo, l’intervallo t è sempre più stretto dello Z.'],
        correct: 1,
        explanation: 'Sotto campionamento normale indipendente, l’intervallo t è esatto. La copertura osservata su 100 repliche oscilla intorno al 95% per errore Monte Carlo; non è la probabilità posteriore di un parametro fissato.',
        rule: function (s) {
          if (s.method !== 't' || s.n > 20 || Math.abs(s.level - .95) > 1e-9) return status(false, 'Imposta t, n ≤ 20 e livello 95%.');
          return status(s.k >= 100, 'Genera almeno 100 intervalli (ora: ' + s.k + ').');
        }
      },
      {
        id: 'ci-wald', level: 'Applicazione', title: 'Quando Wald sottocopre',
        task: 'Seleziona Wald per una proporzione, p vero ≤ 0,15 e n ≤ 20. Genera almeno 100 intervalli. Cerca le realizzazioni in cui la proporzione campionaria è zero.',
        question: 'Perché il metodo può avere una copertura molto inferiore al 95% nominale?',
        options: ['Con p stimato pari a zero, l’ampiezza stimata può diventare zero.',
          'Perché le osservazioni Bernoulli non hanno mai media finita.',
          'Perché il metodo Wald è sempre conservativo nei piccoli campioni.'],
        correct: 0,
        explanation: 'Se p̂=0, la stima plug-in della varianza è zero: l’intervallo di Wald degenera. A n=20 e p=0,1 il difetto si osserva anche calcolando la copertura esatta, non solo per Monte Carlo.',
        rule: function (s) {
          if (s.method !== 'wald' || s.n > 20 || s.p > .15) return status(false, 'Imposta Wald, n ≤ 20 e p vero ≤ 0,15.');
          return status(s.k >= 100, 'Genera almeno 100 intervalli (ora: ' + s.k + ').');
        }
      },
      {
        id: 'ci-wilson', level: 'Avanzato', title: 'Wilson è sempre esatto?',
        task: 'Passa a Wilson con p vero ≤ 0,15, n ≤ 20 e livello 95%. Genera almeno 100 intervalli e confronta la copertura empirica con il valore esatto nella tabella.',
        question: 'Che cosa possiamo affermare della copertura di Wilson?',
        options: ['È esattamente 95% per ogni p e n.',
          'È sempre almeno 95%, come Clopper–Pearson.',
          'Dipende da p e n; Wilson non garantisce copertura almeno nominale per tutti i casi.'],
        correct: 2,
        explanation: 'Wilson è un intervallo score con buona copertura in molte configurazioni, ma non è un intervallo esatto conservativo. La copertura vera per una variabile discreta può oscillare al variare di p e n.',
        rule: function (s) {
          if (s.method !== 'wilson' || s.n > 20 || s.p > .15 || Math.abs(s.level - .95) > 1e-9) return status(false, 'Imposta Wilson, n ≤ 20, p ≤ 0,15 e livello 95%.');
          return status(s.k >= 100, 'Genera almeno 100 intervalli (ora: ' + s.k + ').');
        }
      }
    ],
    validazione: [
      {
        id: 'cv-complexity', level: 'Comprensione', title: 'Adattamento contro previsione',
        task: 'Usa la sinusoide, n ≤ 60, un grado mostrato ≥ 8 e almeno 5 repliche. Confronta il grafico del fit con le curve degli errori.',
        question: 'Quale indicatore permette di valutare la generalizzazione, senza confonderla con l’adattamento?',
        options: ['Solo l’errore sul training.', 'L’errore fuori campione ottenuto da dati non usati per il fitting.', 'Il numero di coefficienti non nulli.'],
        correct: 1,
        explanation: 'Il training error è calcolato sui dati già utilizzati per stimare il modello. La complessità può ridurlo mentre peggiora l’errore su nuove osservazioni.',
        rule: function (s) {
          if (s.fun !== 'sin' || s.n > 60 || s.dShow < 8) return status(false, 'Usa sinusoide, n ≤ 60 e grado mostrato ≥ 8.');
          return status(s.k >= 5, 'Esegui almeno cinque repliche (ora: ' + s.k + ').');
        }
      },
      {
        id: 'cv-choice', level: 'Applicazione', title: 'Scegli con CV, valuta con test',
        task: 'Esegui almeno 20 repliche mantenendo la selezione dei gradi con i fold del training. Osserva il grado scelto dalla CV e l’errore sul test indipendente.',
        question: 'Qual è il protocollo di valutazione corretto?',
        options: ['Selezionare il grado sul test e riportare lo stesso test come valutazione finale.',
          'Selezionare il grado con CV nel training e usare il test indipendente solo per la valutazione.',
          'Selezionare il grado con training error e dichiarare il suo minimo come rischio predittivo.'],
        correct: 1,
        explanation: 'Tuning e valutazione devono essere separati. Una volta usato il test per scegliere il modello, il suo errore non è più una stima indipendente della procedura selezionata.',
        rule: function (s) { return status(s.k >= 20, 'Esegui almeno 20 repliche (ora: ' + s.k + ').'); }
      },
      {
        id: 'cv-misspec', level: 'Avanzato', title: 'Un picco difficile da recuperare',
        task: 'Seleziona la funzione con picco localizzato, n ≤ 60 e genera almeno 10 repliche. Osserva come la famiglia polinomiale rappresenta il picco.',
        question: 'Una validazione incrociata impeccabile risolve il problema di una famiglia di modelli incapace di rappresentare il segnale?',
        options: ['Sì, la CV elimina sempre la distorsione di specificazione.',
          'No, la CV seleziona tra i candidati disponibili e non modifica la loro classe funzionale.',
          'Sì, purché il numero di fold sia almeno cinque.'],
        correct: 1,
        explanation: 'La CV seleziona la complessità nella classe proposta; non crea una famiglia più ricca. Anche un protocollo corretto può scegliere il miglior modello fra candidati tutti inadeguati.',
        rule: function (s) {
          if (s.fun !== 'bump' || s.n > 60) return status(false, 'Seleziona il picco localizzato e n ≤ 60.');
          return status(s.k >= 10, 'Genera almeno 10 repliche (ora: ' + s.k + ').');
        }
      }
    ],
    kriging: [
      {
        id: 'kr-added', level: 'Comprensione', title: 'Un sensore aggiunge informazione',
        task: 'Apri questa sfida prima di intervenire. Con ordinary kriging e modello assunto invariato, aggiungi almeno un sensore e confronta la varianza media di kriging.',
        question: 'Sotto il modello fissato, che cosa possiamo dedurre dall’aggiunta di un sensore?',
        options: ['La varianza ottimale di kriging non aumenta; l’errore sulla singola mappa può invece aumentare.',
          'L’RMSE sulla particolare mappa non può aumentare.',
          'La varianza di kriging deve aumentare perché si stima un nuovo valore.'],
        correct: 0, baseline: true,
        explanation: 'La varianza del predittore lineare ottimo, condizionata al modello, non aumenta aggiungendo osservazioni. L’errore realizzato su un singolo campo può muoversi in entrambe le direzioni.',
        rule: function (s, b) {
          if (!b || s.fieldKey !== b.fieldKey) return status(false, 'Conserva il campo iniziale: non rigenerare i dati durante la sfida.');
          if (s.method !== 'ordinary' || s.assumedModel !== b.assumedModel || Math.abs(s.assumedPhi - b.assumedPhi) > 1e-10) return status(false, 'Mantieni ordinary kriging e il modello di covarianza assunto iniziale.');
          if (s.nSensor <= b.nSensor) return status(false, 'Aggiungi almeno un sensore dopo aver aperto la sfida.');
          return status(s.meanVar <= b.meanVar + 1e-8, 'Confronta la varianza media di kriging prima e dopo.');
        }
      },
      {
        id: 'kr-idw', level: 'Applicazione', title: 'IDW e modello probabilistico',
        task: 'Seleziona IDW; modifica il posizionamento di un sensore e confronta il pannello della previsione con quello dell’incertezza.',
        question: 'Quale affermazione sulla varianza di predizione è corretta?',
        options: ['IDW produce automaticamente la stessa varianza del kriging ordinario.',
          'IDW assegna pesi basati sulle distanze e non fornisce, da solo, una varianza di kriging.',
          'IDW utilizza la matrice di covarianza completa e stima il nugget.'],
        correct: 1, baseline: true,
        explanation: 'La media pesata IDW non deriva direttamente dal sistema BLUP con modello stocastico. Senza ulteriori assunzioni non si ricava la varianza modellistica usata per il kriging.',
        rule: function (s, b) {
          if (s.method !== 'idw') return status(false, 'Seleziona il metodo IDW.');
          if (!b || s.fieldKey !== b.fieldKey || s.sensorKey === b.sensorKey) return status(false, 'Modifica almeno un sensore senza rigenerare il campo.');
          return status(true);
        }
      },
      {
        id: 'kr-misspec', level: 'Avanzato', title: 'L’incertezza dipende dal modello',
        task: 'Mantieni ordinary kriging, scegli un range assunto differente dal range vero e produci almeno 5 nuove repliche Monte Carlo.',
        question: 'Come va interpretata la mappa della varianza in questa situazione?',
        options: ['È comunque la varianza esatta degli errori sotto il modello generatore.',
          'È condizionata alla covarianza assunta e può risultare mal calibrata.',
          'Coincide necessariamente con il quadrato dell’RMSE sul campo osservato.'],
        correct: 1,
        explanation: 'I pesi e le varianze di kriging dipendono dal modello assunto. Cambiare il range senza cambiare il campo generatore mette in evidenza la distinzione tra incertezza modellistica ed errore realizzato.',
        rule: function (s) {
          if (s.method !== 'ordinary' || Math.abs(s.assumedPhi - s.phi) < 1e-9) return status(false, 'Imposta ordinary kriging e un range assunto diverso da quello vero.');
          return status(s.reps >= 5, 'Produci almeno cinque repliche (ora: ' + s.reps + ').');
        }
      }
    ]
  };

  function evaluate(labId, taskId, snapshot, initial, answer) {
    var tasks = bank[labId] || [], q = tasks.filter(function (t) { return t.id === taskId; })[0];
    if (!q) throw new Error('Sfida sconosciuta: ' + labId + '/' + taskId);
    if (!snapshot) return { ok: false, ready: false, message: 'Laboratorio non inizializzato.' };
    var r = q.rule(snapshot, initial);
    if (!r.ready) return { ok: false, ready: false, message: r.message };
    if (answer == null || answer < 0 || answer >= q.options.length) return { ok: false, ready: true, message: 'Seleziona una risposta prima di verificare.' };
    var ok = +answer === q.correct;
    return { ok: ok, ready: true, message: ok ? 'Sfida completata.' : 'Risposta da rivedere.', explanation: q.explanation };
  }

  /* Activity recorder: capture BEFORE lab onchange handlers rebuild .controls.
   * Step history is independent of a runner reset (new model = new experiment),
   * and records which control configuration was used for each sample.
   */
  function nameOf(target) {
    if (!target) return '';
    var name = target.getAttribute('aria-label');
    if (!name) {
      var label = target.closest && target.closest('label');
      if (label) {
        var first = label.querySelector(':scope > .field-row > span, :scope > span, :scope > .field-row > div > span');
        name = first ? first.textContent : '';
      }
    }
    return (name || '').trim().replace(/\s+/g, ' ');
  }
  function keyOf(name) {
    return String(name || '').toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }
  function controlValue(target) {
    return target.type === 'checkbox' ? String(target.checked) : String(target.value);
  }
  function ensureTrace(id) {
    return SA.challenges.traces[id] || (SA.challenges.traces[id] = { steps: 0, edits: [], samples: [], current: {} });
  }
  function noteStep(id) {
    var trace = ensureTrace(id);
    trace.steps++;
    trace.samples.push({ seq: trace.steps, values: Object.assign({}, trace.current) });
    if (typeof trace.onUpdate === 'function') trace.onUpdate();
  }
  function mount(page, id) {
    var tasks = bank[id], lab = SA.labs[id];
    if (!tasks || !lab) return;
    var trace = ensureTrace(id);
    trace.edits = []; trace.samples = []; trace.steps = 0; trace.current = {}; trace.listeners = []; trace.onUpdate = null;
    page.querySelectorAll('.controls input, .controls select, .controls textarea').forEach(function (input) {
      var key = keyOf(nameOf(input));
      if (key && key !== 'velocita') trace.current[key] = controlValue(input);
    });
    page.querySelectorAll('.controls .seg[aria-label]').forEach(function(group) {
      var pressed = group.querySelector('button[aria-pressed="true"]');
      if (pressed) trace.current[keyOf(group.getAttribute('aria-label'))] = pressed.textContent.trim();
    });
    function recordEdit(key, value) {
      if (!key || key === 'velocita') return;
      var old = trace.current[key];
      if (old === value) return;
      trace.current[key] = value;
      trace.edits.push({ key: key, from: old, to: value, seq: trace.steps });
      if (typeof trace.onUpdate === 'function') trace.onUpdate();
    }
    // Capture phase is essential: onchange handlers can replace controls
    // synchronously, which prevents a bubbling page listener from seeing them.
    page.addEventListener('change', function (ev) {
      var t = ev.target;
      if (!t.closest || !t.closest('.controls') ||
          !/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      recordEdit(keyOf(nameOf(t)), controlValue(t));
    }, true);
    page.addEventListener('click', function (ev) {
      var btn = ev.target.closest && ev.target.closest('.controls .seg button');
      if (!btn) return;
      var group = btn.closest('.seg');
      recordEdit(keyOf(group.getAttribute('aria-label') || 'Modello dei dati'), btn.textContent.trim());
    }, true);
    function getState() {
      var raw = typeof lab.challengeState === 'function' ? lab.challengeState() : {};
      var n = Math.max(trace.steps, raw && raw.k && id === 'stimatori' ? raw.k : 0);
      return Object.assign({}, raw || {}, {
        actions: n, changes: trace.edits.length,
        edits: trace.edits.slice(), samples: trace.samples.slice(),
        controls: Object.assign({}, trace.current)
      });
    }
    var el = SA.ui.el, solved = {}, progress = el('p.challenge-progress', { role: 'status', 'aria-live': 'polite' });
    var step = SA.ui.step('', 'Mettiti alla prova', 'StatAtlas Challenges');
    step.classList.add('challenge-section');
    step.body.append(el('p.prose', 'Usa i controlli e le simulazioni di questo laboratorio prima di rispondere. Ogni sfida verifica sia l’esperimento svolto sia la sua interpretazione; nessun dato viene inviato a un server.'), progress);

    function syncProgress() {
      var k = Object.keys(solved).filter(function (key) { return solved[key]; }).length;
      progress.textContent = k + ' di ' + tasks.length + ' sfide completate · risultato formativo locale, non un voto.';
    }
    tasks.forEach(function (q, i) {
      var initial = null, selected = null;
      var card = el('details.challenge-card', { 'data-challenge-id': q.id });
      var summary = el('summary.challenge-summary', el('span.challenge-index', String(i + 1).padStart(2, '0')),
        el('span', el('strong', q.title), el('small', q.level)));
      var choices = el('fieldset.challenge-answers', el('legend', q.question));
      q.options.forEach(function (option, j) {
        var input = el('input', { type: 'radio', name: 'challenge-' + id + '-' + q.id, value: String(j),
          onchange: function () { selected = j; message.textContent = ''; message.hidden = true; } });
        choices.appendChild(el('label.challenge-answer', input, el('span', option)));
      });
      var activity = el('p.challenge-activity', { role: 'status', 'aria-live': 'polite' }, 'Apri la sfida per registrare il punto di partenza.');
      var message = el('div.challenge-feedback', { role: 'status', 'aria-live': 'polite', hidden: true });
      var verify = SA.ui.button('Verifica la sfida', { cls: 'btn-primary', onclick: function () {
        if (q.baseline && !initial) initial = getState();
        var result = evaluate(id, q.id, getState(), initial, selected);
        message.hidden = false; message.classList.toggle('success', !!result.ok);
        message.textContent = result.message + (result.ready && result.explanation ? ' ' + result.explanation : '');
        if (result.ok) { solved[q.id] = true; card.classList.add('challenge-solved'); syncProgress(); }
      } });
      var jump = SA.ui.button('Vai ai controlli', { cls: 'btn-ghost', onclick: function () {
        var controls = page.querySelector('.controls');
        if (controls) controls.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } });
      var body = el('div.challenge-body', el('p', q.task), choices,
        activity, el('div.challenge-actions', jump, verify), message);
      if (q.baseline) {
        var info = el('p.challenge-reference', id === 'kriging' ? 'Apri questa sfida prima di modificare i sensori: registreremo la configurazione corrente.' : 'Le azioni sono conteggiate da quando apri la sfida. Prima esegui i passaggi richiesti, poi verifica la risposta.');
        var reset = SA.ui.button('Aggiorna punto di partenza', { cls: 'btn-ghost', onclick: function () {
          initial = getState();
          activity.textContent = 'Nuovo punto di partenza: 0 passi, 0 modifiche.';
          message.hidden = false; message.classList.remove('success');
          message.textContent = id === 'kriging' ? 'Nuova configurazione registrata. Ora modifica i sensori.' : 'Nuovo punto di partenza registrato. Esegui i passi richiesti dalla sfida.';
        } });
        body.insertBefore(info, choices); body.querySelector('.challenge-actions').appendChild(reset);
      }
      // Capture on the initiating interaction, not only on the asynchronous
      // <details> toggle event: a quick touch must not move the baseline.
      function startChallenge() {
        if (!initial) initial = getState();
        updateActivity();
      }
      function updateActivity() {
        if (!card.open || !initial) return;
        var now = getState();
        var steps = Math.max(0, now.actions - initial.actions);
        var edits = Math.max(0, now.changes - initial.changes);
        var result = q.rule(now, initial);
        activity.textContent = 'Dopo l’apertura: ' + steps + ' passi · ' + edits +
          ' modifiche. ' + (result.ready ? 'Esperimento pronto: scegli la risposta.' : result.message) +
          (result.ready && result.quality ? ' ' + result.quality : '');
      }
      // Baseline captured on the initiating interaction (mouse/touch/keyboard).
      summary.addEventListener('click', function () { if (!card.open) startChallenge(); });
      summary.addEventListener('keydown', function (ev) {
        if (!card.open && (ev.key === 'Enter' || ev.key === ' ')) startChallenge();
      });
      card.addEventListener('toggle', function () {
        if (card.open) startChallenge();
      });
      card.append(summary, body); step.body.appendChild(card);
      (trace.listeners || (trace.listeners=[])).push(updateActivity);
    });
    trace.onUpdate = function () {
      if (trace.updateQueued) return;
      trace.updateQueued = true;
      requestAnimationFrame(function () {
        trace.updateQueued = false;
        (trace.listeners || []).forEach(function (listener) { listener(); });
      });
    };
    syncProgress();
    var beforeR = Array.prototype.find.call(page.querySelectorAll('section.step'), function (s) {
      var label = s.querySelector('.step-label'); return label && /riproduci in r/i.test(label.textContent);
    });
    if (beforeR) page.insertBefore(step, beforeR); else page.appendChild(step);
    page.querySelectorAll('section.step').forEach(function (sec, i) {
      var number = sec.querySelector('.step-num'); if (number) number.textContent = String(i + 1);
    });
  }
  SA.challenges = { bank: bank, evaluate: evaluate, mount: mount, traces: {}, noteStep: noteStep, keyOf: keyOf };
})();

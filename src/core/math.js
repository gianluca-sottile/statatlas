/* StatAtlas · core/math.js — composizione tipografica delle formule, senza librerie esterne.
 * SA.math.tex(sorgente) converte un sottoinsieme di LaTeX in HTML + CSS (frazioni, radici, sommatorie con limiti,
 * apici e pedici, accenti, lettere greche, funzioni in tondo). SA.math.typeset(radice) compone gli elementi con
 * attributo data-tex: i blocchi .eq vengono numerati, <a data-eqref="id"> diventa il numero dell'equazione con data-id="id".
 * Sintassi: \frac{a}{b} \sqrt{x} \sum_{i=1}^{n} \hat{\theta} \bar{x} \text{testo} \left( \right) x^{2} x_{i} … */
SA.math = (function () {
  var GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω' };
  var UPPER = { Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
  var SYM = { cdot: '·', times: '×', infty: '∞', partial: '∂', ldots: '…', dots: '…', cdots: '⋯', pm: '±', mid: '|', ell: 'ℓ', prime: '′', top: '⊤', nabla: '∇', odot: '⊙', forall: '∀', exists: '∃', emptyset: '∅', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', langle: '⟨', rangle: '⟩', '{': '{', '}': '}', '|': '‖', '%': '%' };
  var REL = { le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', sim: '∼', to: '→', rightarrow: '→', Rightarrow: '⇒', iff: '⇔', 'in': '∈', notin: '∉', subset: '⊂', propto: '∝', equiv: '≡', mapsto: '↦', ll: '≪', gg: '≫' };
  var FN = ['log', 'exp', 'sin', 'cos', 'tan', 'ln', 'det', 'tr', 'Var', 'Cov', 'Cor', 'E', 'P', 'logit', 'rank', 'diag', 'sign', 'EQM', 'MSE'];
  var BIG = { sum: ['Σ', 1], prod: ['Π', 1], int: ['∫', 1], sup: ['sup', 0], inf: ['inf', 0], min: ['min', 0], max: ['max', 0], lim: ['lim', 0], argmin: ['arg min', 0], argmax: ['arg max', 0] };
  var ACC = { hat: '̂', bar: '̄', tilde: '̃', dot: '̇' };
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function tex(src) {
    var i = 0, n = src.length;
    function group(stop) { // sequenza di atomi fino a «}» (se stop) o alla fine
      var out = '', prev = 'open';
      while (i < n) {
        if (src[i] === '}') { if (stop) i++; break; }
        var a = atom(prev); if (!a) continue;
        a = scripts(a); out += a.h; prev = a.k || 'ord';
      }
      return out;
    }
    function arg() { // argomento di un comando o di un apice/pedice: gruppo tra graffe o un solo atomo
      while (i < n && src[i] === ' ') i++;
      if (src[i] === '{') { i++; return group(true); }
      var a = atom('open'); return a ? a.h : '';
    }
    function scripts(a) {
      var sub = null, sup = null;
      for (;;) {
        while (i < n && src[i] === ' ') i++;
        if (src[i] === '_' && sub === null) { i++; sub = arg(); } else if (src[i] === '^' && sup === null) { i++; sup = arg(); } else break;
      }
      if (sub === null && sup === null) return a;
      if (a.k === 'big') return { h: '<span class="m-op"><span class="m-lim">' + (sup || '') + '</span>' + a.h + '<span class="m-lim">' + (sub || '') + '</span></span>', k: 'ord' };
      if (sub !== null && sup !== null) return { h: a.h + '<span class="m-ss"><span>' + sup + '</span><span>' + sub + '</span></span>', k: 'ord' };
      return { h: a.h + (sub !== null ? '<sub>' + sub + '</sub>' : '<sup>' + sup + '</sup>'), k: 'ord' };
    }
    function atom(prev) {
      var c = src[i];
      if (c === ' ' || c === '\n') { i++; return null; }
      if (c === '{') { i++; return { h: group(true) }; }
      if (c === '~') { i++; return { h: '&nbsp;' }; }
      if (c === '\\') {
        i++; var m = /^[a-zA-Z]+/.exec(src.slice(i)), name;
        if (m) { name = m[0]; i += name.length; } else { name = src[i++]; }
        if (name === ',') return { h: '<span class="m-sp1"></span>', k: prev };
        if (name === ';' || name === ':') return { h: '<span class="m-sp2"></span>', k: prev };
        if (name === '!') return { h: '', k: prev };
        if (name === 'quad') return { h: '<span class="m-sp3"></span>', k: 'open' };
        if (name === 'qquad') return { h: '<span class="m-sp4"></span>', k: 'open' };
        if (name === '\\') return { h: '<br>', k: 'open' };
        if (name === 'frac' || name === 'tfrac' || name === 'dfrac') { var a = arg(), b = arg(); return { h: '<span class="m-frac"><span class="m-num">' + a + '</span><span class="m-den">' + b + '</span></span>' }; }
        if (name === 'binom') { var p = arg(), q = arg(); return { h: '<span class="m-delim m-tall">(</span><span class="m-frac m-nobar"><span class="m-num">' + p + '</span><span class="m-den">' + q + '</span></span><span class="m-delim m-tall">)</span>' }; }
        if (name === 'sqrt') return { h: '<span class="m-sqrt"><svg class="m-surd" viewBox="0 0 10 30" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0.6 17.5 L3 15.6 L6.2 29.2 L10 0.5" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg><span class="m-rad">' + arg() + '</span></span>' };
        if (ACC[name]) { var x = arg(), plain = x.replace(/<[^>]+>/g, ''); return { h: plain.length === 1 ? x.replace(plain, plain + ACC[name]) : '<span class="m-acc m-' + name + '">' + x + '</span>' }; }
        if (name === 'overline') return { h: '<span class="m-acc m-bar">' + arg() + '</span>' };
        if (name === 'text' || name === 'mathrm' || name === 'operatorname') { while (src[i] === ' ') i++; var t = ''; if (src[i] === '{') { i++; var d = 1; while (i < n) { if (src[i] === '{') d++; else if (src[i] === '}' && --d === 0) { i++; break; } t += src[i++]; } } return { h: '<span class="m-text">' + esc(t).replace(/ /g, '&nbsp;') + '</span>' }; }
        if (name === 'mathbf' || name === 'boldsymbol') return { h: '<b class="m-bf">' + arg().replace(/<\/?i>/g, '') + '</b>' };
        if (name === 'left' || name === 'right') { while (src[i] === ' ') i++; var dl = src[i++]; if (dl === '\\') { var mm = /^[a-zA-Z]+|^./.exec(src.slice(i))[0]; i += mm.length; dl = SYM[mm] || mm; } return { h: dl === '.' ? '' : '<span class="m-delim m-tall">' + esc(dl) + '</span>', k: name === 'left' ? 'open' : 'ord' }; }
        if (BIG[name]) return { h: '<span class="m-sym' + (BIG[name][1] ? ' m-bigsym' : ' m-text') + '">' + BIG[name][0] + '</span>', k: 'big' };
        if (FN.indexOf(name) >= 0) return { h: '<span class="m-fn">' + name + '</span>' };
        if (GREEK[name]) return { h: '<i>' + GREEK[name] + '</i>' };
        if (UPPER[name]) return { h: UPPER[name] };
        if (REL[name]) return { h: '<span class="m-rel">' + REL[name] + '</span>', k: 'bin' };
        if (name === 'pm' || name === 'mp') return { h: '<span class="m-bin">' + (name === 'pm' ? '±' : '∓') + '</span>', k: 'bin' };
        if (SYM[name] !== undefined) return { h: SYM[name], k: name === 'cdot' || name === 'times' ? 'ord' : undefined };
        return { h: '<span class="m-text">' + esc(name) + '</span>' };
      }
      i++;
      if (/[a-zA-Z]/.test(c)) return { h: '<i>' + c + '</i>' };
      if (/[0-9]/.test(c)) { var num = c; while (i < n && /[0-9]/.test(src[i]) || (i < n - 1 && /[.,]/.test(src[i]) && /[0-9]/.test(src[i + 1]))) num += src[i++]; return { h: num }; }
      if (c === '-' || c === '−') return prev === 'open' || prev === 'bin' ? { h: '−', k: 'ord' } : { h: '<span class="m-bin">−</span>', k: 'bin' };
      if (c === '+') return prev === 'open' || prev === 'bin' ? { h: '+', k: 'ord' } : { h: '<span class="m-bin">+</span>', k: 'bin' };
      if (c === '=' || c === '<' || c === '>' || c === '≤' || c === '≥' || c === '≈' || c === '→') return { h: '<span class="m-rel">' + esc(c) + '</span>', k: 'bin' };
      if (c === '(' || c === '[') return { h: c, k: 'open' };
      if (c === ',' || c === ';') return { h: c + '<span class="m-sp1"></span>', k: 'open' };
      if (c === "'") return { h: '′' };
      return { h: esc(c) };
    }
    var html = group(false);
    return '<span class="m" role="math" aria-label="' + esc(src).replace(/"/g, '&quot;') + '">' + html + '</span>';
  }

  /* compone tutti gli elementi con data-tex sotto root; numera i blocchi .eq (salvo data-n="no") e risolve i rimandi */
  function typeset(root) {
    var k = 0, ids = {};
    root.querySelectorAll('[data-tex]').forEach(function (node) {
      if (node.getAttribute('data-done')) return;
      node.innerHTML = tex(node.getAttribute('data-tex')); node.setAttribute('data-done', '1');
      if (node.classList.contains('eq')) {
        node.classList.add('eq-tex');
        if (node.getAttribute('data-n') !== 'no') { k++; var num = document.createElement('span'); num.className = 'eq-num'; num.textContent = '(' + k + ')'; node.appendChild(num); if (node.getAttribute('data-id')) ids[node.getAttribute('data-id')] = k; }
      }
    });
    root.querySelectorAll('a[data-eqref]').forEach(function (a) { var q = ids[a.getAttribute('data-eqref')]; a.textContent = q ? '(' + q + ')' : '(?)'; a.classList.add('eqref'); });
    return root;
  }
  return { tex: tex, typeset: typeset };
})();

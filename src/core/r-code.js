/* StatAtlas · Esportazione R sicura per console e file .R.
 * Accorcia solo espressioni lunghe, inserendo a capo dopo virgole che si
 * trovano dentro chiamate o indici. Non spezza stringhe, commenti o numeri.
 * Non cambia alcun valore o operatore statistico.
 */
var SA = window.SA || (window.SA = {});
SA.rCode = (function () {
  'use strict';
  var DEFAULT_LIMIT = 180;
  function wrap(source, limit) {
    if (typeof source !== 'string') throw new TypeError('Codice R non testuale');
    limit = limit == null ? DEFAULT_LIMIT : limit;
    if (!(limit >= 80 && limit <= 1000)) throw new RangeError('Lunghezza massima R non valida');
    var breaks = [], stack = [], quote = null, escaped = false, comment = false;
    var col = 0, candidate = -1;
    for (var i = 0; i < source.length; i++) {
      var ch = source[i];
      if (ch === '\n') { col = 0; candidate = -1; comment = false; continue; }
      if (ch === '\r') continue;
      col++;
      if (comment) continue;
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '#') { comment = true; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
      else if (ch === ')' || ch === ']' || ch === '}') {
        if (stack.length) stack.pop();
      } else if (ch === ',' && (stack.indexOf('(') >= 0 || stack.indexOf('[') >= 0)) {
        candidate = i + 1;
      }
      if (col > limit && candidate > 0) {
        breaks.push(candidate);
        col = i + 1 - candidate + 4;
        candidate = -1;
      }
    }
    if (!breaks.length) return source;
    var out = '', start = 0;
    for (var j = 0; j < breaks.length; j++) {
      out += source.slice(start, breaks[j]) + '\n    ';
      start = breaks[j];
    }
    return out + source.slice(start);
  }
  function maxLine(source) {
    return String(source).split(/\r?\n/).reduce(function (m, line) {
      return Math.max(m, line.length);
    }, 0);
  }
  return { wrap: wrap, maxLine: maxLine, maxConsoleLine: 4094 };
})();

/* Guard rail for long R console lines: all UI exports use SA.rCode.wrap(). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{},console});
for (const f of ['src/core/r-code.js','src/core/spatial-unified.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
}
const r = context.window.SA.rCode;
const spatial = context.window.SA.spatialUnified;
function check(source, label, threshold=220) {
  const out=r.wrap(source);
  assert.equal(out.replace(/\n {4}/g,''),source.replace(/\n {4}/g,''),`${label}: only whitespace after a comma can be inserted`);
  assert.ok(r.maxLine(out) <= threshold,`${label}: longest line ${r.maxLine(out)}`);
  return out;
}
const N=1800;
const vals=Array.from({length:N},(_,i)=>Math.sin(i/13).toPrecision(16));
const original='data <- data.frame(x=c('+vals.join(', ')+'), y=c('+vals.join(', ')+'))';
const w=check(original,'two very long numeric vectors');
assert.ok(w.split('\n').length>100,'must insert actual newlines');
const strings='cat("hello, # and c(1, 2) are literal text", "escaped \\\" quote")';
assert.equal(r.wrap(strings),strings);
const comment='# comment ' + ','.repeat(6000);
assert.equal(r.wrap(comment),comment,'no splitting in comments');
const withStrings='a <- c("a, b, c", ' + vals.join(', ') + ', "# End, with a comma")';
check(withStrings,'numeric vector and quoted strings');
const ids=['moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale'];
for(const id of ids){
  const pts=Array.from({length:250},(_,i)=>({x:(i%31)/31,y:((i*13)%41)/41,value:Math.sin(i/19),cov:Math.cos(i/11)}));
  const state={points:pts,knn:4,band:.085,bins:8,other:{covOptions:{phi:.25}},model:'coords'};
  const src=spatial.rScript(id,{state});
  const rawLength=r.maxLine(src);
  const out=check(src,id,220);
  assert.ok(src.includes('d <- data.frame(\n  x = c(\n'),'structured R data.frame');
  assert.ok(out.includes('plot(d$x,d$y'),'not lose executable R code');
  console.log('PASS',id,'250 points, raw max',rawLength,'formatted max',r.maxLine(out));
}
console.log('PASS R formatter: huge vectors, six spatial generators, strings and comments');

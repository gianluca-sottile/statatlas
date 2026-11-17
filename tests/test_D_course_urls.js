'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),ctx={window:{SA:{}},console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'src/core/course-bridge.js'),'utf8'),ctx);
const b=ctx.window.SA.courseBridge,ids=Object.keys(b.map),used=new Set();
assert.equal(ids.length,31);
for(const id of ids)for(const num of b.map[id].lessons){
  const it=b.lesson(num,'it'),en=b.lesson(num,'en');used.add(num);
  assert(en.lang==='en' && !en.url.includes('/it/lessons/'),id+'/'+num);
  assert(en.url.startsWith('https://gianluca-sottile.github.io/')&&en.url.endsWith('.html'));
  assert(it.lang === (num===62?'en':'it'),id+'/'+num);
  if(num!==62)assert.equal(it.url.replace('/it/lessons/','/lessons/'),en.url);
  else assert.equal(it.url,en.url);
  assert(en.title && en.title.length>2);
}
assert(used.size>=25);
console.log(`PASS D bilingual course URLs: ${ids.length} labs, ${used.size} unique mapped lessons, EN/IT+EN-only exception`);

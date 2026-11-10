// Smoke test jsdom del lab 01 (frecce della mappa, vista 3D, codice R). Uso: node tests/smoke/smoke_lab01.js index.html
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/distribuzioni'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s);
setTimeout(()=>{try{
 const hit=d.querySelectorAll('path[role="button"]'); console.log('aree frecce',hit.length);
 hit[2].dispatchEvent(new w.Event('mouseenter')); console.log('didascalia:',d.querySelector('.feedback[role=status][style*="max-width"]').textContent);
 const b3=[...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Superficie 3D'); b3.click();
 console.log('poligoni 3D', q('.fig svg').querySelectorAll('polygon').length, '| legenda', q('.legend').textContent);
 const code=q('.code pre').textContent; console.log(code.slice(code.indexOf('# Superficie 3D')).slice(0,700));
 const sel=q('select[aria-label="Legge"]'); for(const id of ['binom','beta','norm']){sel.value=id;sel.dispatchEvent(new w.Event('change'));console.log(id,'linee',q('.fig svg').querySelectorAll('line').length,'poly',q('.fig svg').querySelectorAll('polygon').length);}
 const ss=q('select[aria-label="Superficie"]'); ss.value='bivar'; ss.dispatchEvent(new w.Event('change'));
 console.log('bivar poly', q('.fig svg').querySelectorAll('polygon').length);
 const code2=q('.code pre').textContent; console.log(code2.slice(code2.indexOf('# Superficie 3D')).slice(0,300));
 q('.fig svg').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
 [...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento').click();
}catch(e){console.log('ERR',e.stack)} console.log('errs',errs);process.exit(0)},300);

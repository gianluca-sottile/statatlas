// Smoke test jsdom dei lab 10 e 11
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/regressione'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const kp=()=>q('.kpis').textContent.replace(/\s+/g,' ');
const go=(h,f)=>new Promise(r=>{w.location.hash=h;setTimeout(()=>{try{f()}catch(e){console.log('ERR',h,e.stack)};r()},150)});
(async()=>{await new Promise(r=>setTimeout(r,300));
 await go('#/regressione',()=>{console.log('REG start ::',kp());fin().click();console.log('REG norm ::',rows(),'::',kp());
  const s=q('.controls select');s.value='skew';s.dispatchEvent(new w.Event('change'));fin().click();console.log('REG skew ::',rows());
  [...d.querySelectorAll('button')].find(b=>b.textContent.includes('valore anomalo')).click();console.log('outlier ::',kp());});
 await go('#/regressione-lp',()=>{const s=()=>q('.controls select');for(const e of ['norm','laplace','t2','contam']){const x=s();x.value=e;x.dispatchEvent(new w.Event('change'));fin().click();console.log('LP',e,'::',rows(),'::',kp());}});
 console.log('errs',errs);process.exit(0);})();

// Smoke test jsdom del lab 21 (PCA): base, λ₁ = λ₂, p = 6, unità × 10 con/senza standardizzazione, outlier, k
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/pca',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const sl=(lab,v)=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith(lab));s.value=v;s.dispatchEvent(new w.Event('change'));};
const cb=(i,v)=>{const c=d.querySelectorAll('.controls input[type=checkbox]')[i];c.checked=v;c.dispatchEvent(new w.Event('change'));};
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=(lab)=>{const t0=Date.now();fin().click();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(()=>{try{
 go('base p=2 λ1=4');
 sl('Varianza del primo','1.5');go('λ1=1.5');
 sl('Varianza del primo','1');go('λ1=λ2');
 sl('Varianza del primo','4');sel(0,'6');sl('Componenti','3');go('p=6 k=3');
 sel(0,'2');sel(2,'10');go('unità ×10');
 cb(0,true);go('unità ×10 standardizzata');
 cb(0,false);sel(2,'1');cb(1,true);go('outlier');
 console.log('R:',d.querySelector('pre').textContent.includes('prcomp'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

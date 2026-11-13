// Smoke test jsdom del lab 19 (kNN): base, k = 1, XOR, scala × 10 con e senza standardizzazione, n grande
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/knn',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const sl=(lab,v)=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith(lab));s.value=v;s.dispatchEvent(new w.Event('change'));};
const wait=()=>new Promise(r=>{const it=setInterval(()=>{if(!d.querySelector('[data-busy]')){clearInterval(it);r()}},20)});
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=async(lab)=>{const t0=Date.now();fin().click();await wait();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(async()=>{try{
 await go('base lin δ=2 k=15');
 sl('k mostrato','1');console.log('k=1 ::',rows().split('\n')[1]);
 sel(0,'xor');sl('Separazione','3');await go('xor δ=3');
 sel(0,'lin');sl('Separazione','2');sel(2,'10');await go('scala 10 standardizzata');
 const cb=d.querySelector('.controls input[type=checkbox]');cb.checked=false;cb.dispatchEvent(new w.Event('change'));await go('scala 10 NON standardizzata');
 cb.checked=true;cb.dispatchEvent(new w.Event('change'));sel(2,'1');sel(1,'400');await go('n=400');
 console.log('R script:',d.querySelector('pre').textContent.includes('o[o != i]'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

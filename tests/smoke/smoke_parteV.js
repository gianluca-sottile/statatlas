// Smoke test jsdom dei lab 14 e 15
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/quantilica'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const kp=()=>q('.kpis').textContent.replace(/\s+/g,' ');
const go=(h,f)=>new Promise(r=>{w.location.hash=h;setTimeout(()=>{try{f()}catch(e){console.log('ERR',h,e.stack)};r()},200)});
(async()=>{await new Promise(r=>setTimeout(r,300));
 await go('#/quantilica',()=>{console.log('Q start ::',rows());const t0=Date.now();fin().click();console.log('Q completo in',Date.now()-t0,'ms ::',kp());
  const s=q('.controls select');s.value='skew';s.dispatchEvent(new w.Event('change'));fin().click();console.log('Q skew ::',rows().slice(0,200),'::',kp());
  [...d.querySelectorAll('button')].find(b=>b.textContent.includes('valore anomalo')).click();console.log('Q anomalo ::',rows().slice(0,120));});
 await go('#/penalizzata',()=>{console.log('G lasso ::',rows());
  [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Ridge').click();console.log('G ridge ::',rows().slice(0,90));
  [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Percorsi').click();
  const t0=Date.now();fin().click();console.log('P lasso completo in',Date.now()-t0,'ms ::',rows(),'::',kp());
  [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Lasso').click();fin().click();console.log('P lasso ::',rows(),'::',kp());
  console.log(q('.code pre').textContent.split('\n').slice(20,26).join('\n'));});
 console.log('errs',errs);process.exit(0);})();

// Smoke test jsdom del lab 18 (validazione): base, cambio funzione, n piccolo, K = 10, n grande, grado mostrato
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/validazione'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
setTimeout(()=>{try{
 let t0=Date.now();fin().click();console.log('base in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());
 sel(0,'cubic');fin().click();console.log('cubic NaN?',nan(),'\n  '+rows());
 sel(0,'bump');fin().click();console.log('bump NaN?',nan(),'\n  '+rows());
 sel(0,'sin');sel(1,'30');sel(2,'0.2');fin().click();console.log('n=30 pt=0.2 NaN?',nan(),d.querySelector('.controls p.muted').textContent,'\n  '+rows());
 sel(3,'10');fin().click();console.log('K=10 NaN?',nan(),d.querySelector('.controls p.muted').textContent);
 sel(1,'250');sel(2,'0.3');sel(4,'1000');t0=Date.now();fin().click();console.log('n=250 B=1000 in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());
 const r=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith('Grado'));r.value='12';r.dispatchEvent(new w.Event('change'));console.log('grado mostrato 12 NaN?',nan());
 const code=d.querySelector('pre code, pre').textContent;console.log('R contiene sample(n, n_test):',code.includes('sample(n, n_test)'),'D <-',code.match(/D <- \d+/)[0]);
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

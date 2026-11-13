// Smoke test jsdom del lab 20 (alberi): base, diagonale, nessun rumore, mtry = p, profondità 2, n grande
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/alberi',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const wait=()=>new Promise(r=>{const it=setInterval(()=>{if(!d.querySelector('[data-busy]')){clearInterval(it);r()}},20)});
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=async(lab)=>{const t0=Date.now();fin().click();await wait();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(async()=>{try{
 await go('base cerchio');
 sel(0,'diag');await go('diagonale');
 sel(0,'circle');sel(2,'0');await go('q=0 (p=2)');
 sel(2,'3');sel(5,'5');await go('mtry=p');
 sel(5,'2');sel(3,'2');await go('profondità 2');
 sel(3,'30');sel(1,'400');sel(6,'200');await go('n=400 B=200');
 console.log('R:',d.querySelector('pre').textContent.includes('sample(p, mtry)'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

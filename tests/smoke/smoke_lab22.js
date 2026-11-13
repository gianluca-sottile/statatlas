// Smoke test jsdom del lab 22 (clustering): base, allungati, d piccolo, K = 1 e 6, legami, n grande, trascinabili
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/clustering',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const sl=(lab,v)=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith(lab));s.value=v;s.dispatchEvent(new w.Event('change'));};
const cb=(i,v)=>{const c=d.querySelectorAll('.controls input[type=checkbox]')[i];c.checked=v;c.dispatchEvent(new w.Event('change'));};
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=(lab)=>{const t0=Date.now();fin().click();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(()=>{try{
 go('base sferici d=3 K=3');
 sel(0,'allungati');go('allungati');
 sel(0,'sferici');sl('Distanza','1');go('d=1');
 sl('Distanza','3');sl('Numero di gruppi','1');go('K=1');
 sl('Numero di gruppi','6');sel(2,'50');go('K=6 nstart=50');
 sl('Numero di gruppi','3');['single','complete','average'].forEach(l=>{sel(3,l);go('legame '+l);});
 sel(3,'ward.D2');sel(4,'300');cb(1,true);go('n=300 outlier');
 sel(1,'manual');go('trascinabili');console.log('cerchi trascinabili:',d.querySelectorAll('circle[data-c]').length);
 console.log('R:',d.querySelector('pre').textContent.includes('centri0'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

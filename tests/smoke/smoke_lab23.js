// Smoke test jsdom del lab 23 (DBSCAN): lune, cerchi, densità, uniforme, ε estremi, minPts, scala, n grande, clic
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/dbscan',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const sl=(lab,v)=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith(lab));s.value=v;s.dispatchEvent(new w.Event('change'));};
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=(lab)=>{const t0=Date.now();fin().click();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(()=>{try{
 go('lune');
 sel(0,'circles');go('cerchi');
 sel(0,'dens');go('densità ε=0,2');
 sl('Raggio','0.45');go('densità ε=0,45');
 sel(0,'unif');sl('Raggio','0.2');go('uniforme');
 sel(0,'moons');sl('Raggio','0.05');go('lune ε=0,05');
 sl('Raggio','0.2');sel(3,'3');go('lune scala ×3');
 sel(3,'1');sel(1,'600');sel(2,'30');go('n=600 anomali 30');
 const svg=d.querySelector('.figure svg');svg.dispatchEvent(new w.Event('pointerdown'));
 console.log('R:',d.querySelector('pre').textContent.includes('dbscan_did'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

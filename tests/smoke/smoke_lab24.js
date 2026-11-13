// Smoke test jsdom del lab 24 (reti neurali): XOR, η alto, H = 2 e 8, ReLU, lune, L2, più inizializzazioni, cambio pagina
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/reti-neurali',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const d=w.document,fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join('\n  ');
const sel=(i,v)=>{const s=d.querySelectorAll('.controls select')[i];s.value=v;s.dispatchEvent(new w.Event('change'));};
const wait=()=>new Promise(r=>{const it=setInterval(()=>{if(!d.querySelector('[data-busy]')){clearInterval(it);r()}},20)});
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
const go=async(lab)=>{const t0=Date.now();fin().click();await wait();console.log(lab,'in',Date.now()-t0,'ms NaN?',nan(),'\n  '+rows());};
setTimeout(async()=>{try{
 await go('XOR H=4 tanh η=1');
 sel(3,'30');await go('η=30');
 sel(3,'1');sel(1,'2');await go('H=2');
 const b=[...d.querySelectorAll('button')].find(x=>x.textContent.includes('inizializzazioni'));b.click();
 await new Promise(r=>{const it=setInterval(()=>{if(!b.disabled){clearInterval(it);r();}},100)});
 console.log('multi H=2 ::',rows().split('\n').pop());
 sel(1,'8');sel(6,'60');sel(0,'line');await go('linea H=8 n=60');
 sel(0,'moons');sel(2,'relu');sel(4,'0.01');await go('lune ReLU λ=0,01');
 b.click();w.location.hash='#/pca';await new Promise(r=>setTimeout(r,400));console.log('cambio pagina durante multi: h1 =',d.querySelector('h1').textContent);
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

// Smoke test jsdom del lab 17 (segmentata): casi base, δ = 0, σ piccolo, n grande, bootstrap e cambio di pagina
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/segmentata'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join(' | ');
const set=(lab,v)=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith(lab));s.value=v;s.dispatchEvent(new w.Event('change'));};
const nan=()=>[...d.querySelectorAll('.figure svg')].some(s=>s.innerHTML.includes('NaN'));
setTimeout(async()=>{try{
 let t0=Date.now();fin().click();console.log('base completo in',Date.now()-t0,'ms NaN?',nan(),'::',rows());
 set('Cambio di pendenza','0');fin().click();console.log('delta=0 ::',rows());
 set('Cambio di pendenza','1.2');set('Rumore','0.2');fin().click();console.log('sigma=0.2 ::',rows().slice(0,200));
 const n=d.querySelectorAll('.controls select')[1];n.value='300';n.dispatchEvent(new w.Event('change'));t0=Date.now();fin().click();console.log('n=300 completo in',Date.now()-t0,'ms NaN?',nan());
 n.value; const nn=d.querySelectorAll('.controls select')[1];nn.value='80';nn.dispatchEvent(new w.Event('change'));
 const b=[...d.querySelectorAll('button')].find(x=>x.textContent.includes('bootstrap'));b.click();
 await new Promise(r=>{const it=setInterval(()=>{if(!b.disabled){clearInterval(it);r();}},200)});
 console.log('bootstrap ::',rows().split(' | ').pop());
 b.click(); w.location.hash='#/spline'; await new Promise(r=>setTimeout(r,500)); console.log('cambio pagina durante il bootstrap: ok, h1 =',q('h1').textContent);
 const s=[...d.querySelectorAll('section.step')].length;console.log('passi spline',s);
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

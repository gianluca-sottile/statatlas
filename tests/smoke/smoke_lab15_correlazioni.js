const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/penalizzata'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};const d=w.document,q=s=>d.querySelector(s);
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const setR=v=>{const s=[...d.querySelectorAll('.controls input[type=range]')].find(i=>(i.getAttribute('aria-label')||'').startsWith('Correlazione'));s.value=v;s.dispatchEvent(new w.Event('input'));s.dispatchEvent(new w.Event('change'));};
setTimeout(()=>{for(const r of ['0.5','-0.5','-0.9']){setR(r);const svg=q('svg[aria-label="Spazio delle soluzioni"]');console.log('GEO r='+r,'NaN?',svg.innerHTML.includes('NaN'),'::',rows());}
 [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Percorsi').click();
 for(const r of ['0.5','-0.1','-0.5','-0.9']){setR(r);[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento').click();const s=q('svg[aria-label="Percorsi di regolarizzazione"]');console.log('PATH r='+r,'NaN?',s.innerHTML.includes('NaN'),'::',rows().slice(0,160));}
 console.log('errs',errs);process.exit(0)},300);

// Smoke test jsdom del lab 16 e della mappa dell'atlante
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
setTimeout(()=>{try{
 console.log('pulsanti hero:',[...d.querySelectorAll('.hero-actions .btn')].map(b=>b.textContent).join(' / '));
 d.querySelector('.hero-actions .btn').click();
 console.log('mappa: nodi',d.querySelectorAll('.atlas-map g[role=link]').length,'archi',d.querySelectorAll('.atlas-map path').length);
 const n=[...d.querySelectorAll('.atlas-map g[role=link]')].find(g=>g.getAttribute('aria-label').includes('16'));n.dispatchEvent(new w.Event('mouseenter'));
 console.log('didascalia:',q('.modal .feedback').textContent.slice(0,220));
 n.dispatchEvent(new w.Event('click'));
 setTimeout(()=>{try{console.log('aperto:',q('h1').textContent,'| modale chiusa',!q('.modal'));
  console.log('S1 ::',rows());const t0=Date.now();fin().click();console.log('completo in',Date.now()-t0,'ms ::',rows());
  const sel=q('.controls select');for(const m of ['poly','pspline','kernel']){sel.value=m;sel.dispatchEvent(new w.Event('change'));const s2=q('.controls select');fin().click();console.log(m,'::',rows().slice(0,200),'::',q('.kpis').textContent.replace(/\s+/g,' ').slice(0,120));}
  console.log(q('.code pre').textContent.split('\n').slice(14,22).join('\n'));
 }catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);
}catch(e){console.log('ERR',e.stack);process.exit(1)}},300);

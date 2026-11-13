// Smoke test: in ogni laboratorio le schede Essenziale e Avanzato compongono tutte le formule (nessun comando non riconosciuto),
// le numerano, creano l'indice quando serve e i riquadri hanno l'intestazione.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/',beforeParse(w){w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};}});
const w=dom.window,d=w.document,errs=[];w.addEventListener('error',e=>errs.push(e.message));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(async()=>{try{
 const ids=[];w.SA.catalog.forEach(p=>p.labs.forEach(l=>ids.push(l.id)));
 let tot=0,bad=[],toc=0,boxes=0;
 console.log('home: legenda',d.querySelectorAll('.legend-home .legend-list li').length,'voci');
 for(const id of ids){w.location.hash='#/'+id;await sleep(120);
  const b=[...d.querySelectorAll('button')].find(x=>x.textContent.trim()==='Approfondisci');b.click();
  for(const lev of ['base','adv']){d.querySelector('.drawer-head button[data-level="'+lev+'"]').click();
   const body=d.querySelector('.drawer-body')||d.querySelector('.drawer');
   const eqs=body.querySelectorAll('[data-tex]');tot+=eqs.length;
   eqs.forEach(e=>{const t=e.textContent;if(!e.getAttribute('data-done')||/\\|undefined|NaN/.test(t)||!e.querySelector('.m'))bad.push(id+'/'+lev+': '+e.getAttribute('data-tex').slice(0,40));
    e.querySelectorAll('.m-text').forEach(m=>{if(/^(frac|sqrt|sum|left|right|hat|bar)$/.test(m.textContent))bad.push(id+': comando '+m.textContent)})});
   if(body.querySelector('.sheet-toc'))toc++;boxes+=body.querySelectorAll('.box > .box-t').length;}
  d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));}
 console.log('laboratori',ids.length,'· formule composte',tot,'· problemi',bad.length,bad.slice(0,5),'· schede con indice',toc,'· riquadri con intestazione',boxes);
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},400);

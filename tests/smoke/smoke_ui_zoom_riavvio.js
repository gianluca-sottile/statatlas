// Smoke test: ingrandimento dei grafici (finestra modale, chiusura con Esc e cambio pagina) e «Riavvia» a simulazione finita
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/lgn-tcl',beforeParse(w){w.scrollTo=()=>{};}});
const w=dom.window,d=w.document,errs=[];w.addEventListener('error',e=>errs.push(e.message));
const btn=l=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===l);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(async()=>{try{
 const figs=d.querySelectorAll('.fig').length, zb=d.querySelectorAll('.fig-zoom-btn');
 console.log('grafici',figs,'pulsanti di ingrandimento',zb.length);
 zb[0].click(); console.log('aperto: modale',!!d.querySelector('.fig-modal .fig-in-modal'),'segnaposto',!!d.querySelector('.fig-placeholder'),'scroll bloccato',d.documentElement.classList.contains('zoom-open'));
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 console.log('Esc: modale',!!d.querySelector('.fig-modal'),'grafico rimesso',!!d.querySelector('.figure .fig .fig-zoom-btn'),'scroll',!d.documentElement.classList.contains('zoom-open'));
 zb[1].click(); w.location.hash='#/clustering'; await sleep(300);
 console.log('cambio pagina: modale',!!d.querySelector('.fig-modal'),'scroll',!d.documentElement.classList.contains('zoom-open'),'h1',d.querySelector('h1').textContent);
 const play=()=>d.querySelector('.transport .btn-primary');
 btn('Completa l’esperimento').click(); console.log('dopo Completa:',play().textContent.trim());
 play().click(); await sleep(200); console.log('dopo Riavvia:',play().textContent.trim(),'· avanzamento',d.querySelector('.progress i').style.width);
 w.location.hash='#/stimatori'; await sleep(300);
 [...d.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').startsWith('Completa')||/Tutto|Completa/.test(b.title||'')).click(); await sleep(100);
 console.log('lab 06 dopo Completa:',play().textContent.trim()); play().click(); await sleep(150); console.log('lab 06 dopo Riavvia:',play().textContent.trim());
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},400);

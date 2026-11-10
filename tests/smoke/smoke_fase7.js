// Smoke test jsdom dei lab 12 e 13
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/glm'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const go=(h,f)=>new Promise(r=>{w.location.hash=h;setTimeout(()=>{try{f()}catch(e){console.log('ERR',h,e.stack)};r()},150)});
(async()=>{await new Promise(r=>setTimeout(r,300));
 await go('#/glm',()=>{fin().click();console.log('GLM logit n40 ::',rows());const n=d.querySelectorAll('.controls select')[1];n.value='10';n.dispatchEvent(new w.Event('change'));fin().click();console.log('GLM logit n10 ::',rows());
  const s=q('.controls select');s.value='pois';s.dispatchEvent(new w.Event('change'));fin().click();console.log('GLM pois ::',rows());});
 await go('#/arma',()=>{const s=()=>q('.controls select');for(const p of ['ar1','ar2','ma1','arma','explo']){const x=s();x.value=p;x.dispatchEvent(new w.Event('change'));fin().click();console.log('ARMA',p,'::',rows().slice(0,300),'::',q('.kpis').textContent.replace(/\s+/g,' ').slice(0,120));}});
 console.log('errs',errs);process.exit(0);})();

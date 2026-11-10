// Smoke test jsdom dei lab 03, 08, 09. Uso: NODE_PATH=... node tests/smoke/smoke_fase3.js index.html
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/simulazione'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const kp=()=>q('.kpis').textContent.replace(/\s+/g,' ');
const go=(h,f)=>new Promise(r=>{w.location.hash=h;setTimeout(()=>{try{f()}catch(e){console.log('ERR',h,e.stack)};r()},120)});
(async()=>{await new Promise(r=>setTimeout(r,300));
 await go('#/simulazione',()=>{fin().click();console.log('INV exp ::',rows());const s=q('.controls select');s.value='pois';s.dispatchEvent(new w.Event('change'));fin().click();console.log('INV pois ::',rows());
  [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Monte Carlo').click();fin().click();console.log('MC ::',rows(),'::',kp());});
 await go('#/intervalli',()=>{fin().click();console.log('CI wald ::',rows(),'::',kp());const s=q('.controls select');for(const m of ['wilson','garwood','z','t','exp']){s.value=m;s.dispatchEvent(new w.Event('change'));fin().click();console.log('CI',m,'::',rows());}
  console.log(q('.code pre').textContent.split('\n').slice(8,22).join('\n'));});
 await go('#/test',()=>{fin().click();console.log('TEST ::',rows(),'::',kp());console.log(q('.code pre').textContent.split('\n').slice(11,20).join('\n'));});
 console.log('errs',errs);process.exit(0);})();

const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/stimatori'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
w.matchMedia=w.matchMedia||(()=>({matches:false}));
setTimeout(()=>{
 const d=w.document;
 console.log('title',d.title,'| h1',d.querySelector('h1')&&d.querySelector('h1').textContent);
 // step 50 replicates via button
 const stepBtn=[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa tutte le repliche');
 stepBtn.click();
 console.log('rows',d.querySelectorAll('table.tv tbody tr').length,'kpi',d.querySelector('.kpis').textContent.slice(0,120));
 console.log('table',[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join('\n'));
 // switch to cauchy
 [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Cauchy').click();
 stepBtn.click();
 console.log('cauchy',[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join('\n'));
 console.log('code head',d.querySelector('.code pre').textContent.split('\n').slice(15,30).join('\n'));
 w.location.hash='#/';setTimeout(()=>{console.log('home cards',d.querySelectorAll('.card').length,'errs',errs);process.exit(0)},50);
},300);

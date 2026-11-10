// Smoke test jsdom dei lab 02 e 05
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/bivariata'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};
const d=w.document,q=s=>d.querySelector(s),fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
const rows=()=>[...d.querySelectorAll('table.tv tbody tr')].map(r=>r.textContent).join(' | ');
const go=(h,f)=>new Promise(r=>{w.location.hash=h;setTimeout(()=>{try{f()}catch(e){console.log('ERR',h,e.stack)};r()},150)});
(async()=>{await new Promise(r=>setTimeout(r,300));
 await go('#/bivariata',()=>{fin().click();console.log('BIV norm ::',rows());const s=q('.controls select');s.value='quad';s.dispatchEvent(new w.Event('change'));fin().click();console.log('BIV quad ::',rows());
  [...d.querySelectorAll('.seg button')].find(b=>b.textContent==='Densità 3D').click();console.log('3D bars',q('svg[aria-label^="Densità congiunta"]').querySelectorAll('circle').length);});
 await go('#/adattamento',()=>{const sels=()=>d.querySelectorAll('.controls select');
  for(const [dk,hk] of [['gamma','norm'],['gamma','exp'],['lnorm','lnorm'],['t5','norm'],['pois','pois'],['nbinom','pois'],['binom','binom']]){
   let s=sels()[0];s.value=dk;s.dispatchEvent(new w.Event('change'));s=sels()[1];s.value=hk;s.dispatchEvent(new w.Event('change'));fin().click();
   const b=[...d.querySelectorAll('button')].find(x=>/p-value Monte Carlo/.test(x.textContent));
   console.log('FIT',dk,'~',hk,'::',rows().slice(0,260));}
  console.log(q('.code pre').textContent.split('\n').slice(8,32).join('\n'));});
 await new Promise(r=>setTimeout(r,100));
 // MC p-value su un caso
 const b=[...d.querySelectorAll('button')].find(x=>/p-value Monte Carlo/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,8000));
 console.log('MC ::',rows().slice(0,400));
 console.log('errs',errs);process.exit(0);})();

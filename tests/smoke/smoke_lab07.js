// Smoke test jsdom del lab 07 su tutti i modelli
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/fisher'});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.scrollTo=()=>{};const d=w.document,q=s=>d.querySelector(s);
const fin=()=>[...d.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Completa l’esperimento');
setTimeout(()=>{try{const sel=q('.controls select');
for(const m of [...sel.options].map(o=>o.value)){const s=q('.controls select');s.value=m;s.dispatchEvent(new w.Event('change'));fin().click();
 console.log(m,'::',[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].slice(0,3).map(c=>c.textContent).join(' / ')).join(' | '));}
console.log(q('.code pre').textContent.split('\n').slice(8,30).join('\n'));
}catch(e){console.log('ERR',e.stack)}console.log('errs',errs);process.exit(0)},300);

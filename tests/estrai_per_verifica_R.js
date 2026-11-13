// Estrae, per ogni laboratorio, il codice R e la tabella dopo «Completa» (lab 17: anche il bootstrap; lab 24: anche le 20 inizializzazioni).
// Uso: NODE_PATH=<jsdom> node tests/estrai_per_verifica_R.js index.html '["distribuzioni", …]' estrazione.json
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const ids=JSON.parse(process.argv[3]);
const out={};
function load(id){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/#/'+id,beforeParse(w){w.scrollTo=()=>{};}});setTimeout(()=>res(dom),400);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{for(const id of ids){const dom=await load(id),w=dom.window,d=w.document;
 const fin=[...d.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').startsWith('Completa'));
 const heavy=true; // «Completa» in tutti i laboratori
 if(heavy&&fin){fin.click();for(let i=0;i<3000&&d.querySelector('[data-busy]');i++)await sleep(20);}
 if(id==='segmentata'||id==='reti-neurali'){const b=[...d.querySelectorAll('button')].find(x=>/bootstrap|inizializzazioni/.test(x.textContent));b.click();await sleep(50);for(let i=0;i<6000&&b.disabled;i++)await sleep(20);}
 const code=d.querySelector('pre')?d.querySelector('pre').textContent:'';
 const rows=[...d.querySelectorAll('table.tv tbody tr')].map(r=>[...r.children].map(c=>c.textContent));
 const kpi=[...d.querySelectorAll('.kpi')].map(k=>k.textContent);
 out[id]={code,rows,kpi};w.close();}
 fs.writeFileSync(process.argv[4] || 'estrazione.json',JSON.stringify(out));console.log('ok',Object.keys(out).length);process.exit(0);})();

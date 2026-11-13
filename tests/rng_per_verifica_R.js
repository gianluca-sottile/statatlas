global.window = global;
['rng.js','resampling.js'].forEach(f=>require(require('path').join(__dirname,'../src/core/',f)));
const SA=global.SA;
let g=new SA.RRNG(2026);console.log(JSON.stringify({unif:[0,1,2,3,4].map(()=>g.unif()),
 norm:(g=new SA.RRNG(2026),[0,1,2,3,4].map(()=>g.norm())),
 sample:(g=new SA.RRNG(2026),SA.rs.sample(g,10)),
 boot:(g=new SA.RRNG(2026),SA.rs.sample(g,100,5,true))}));

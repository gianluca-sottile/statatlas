/* StatAtlas | controlli deterministic sui pesi spaziali e le distanze */
global.window=global;
require('../src/core/spatial.js');
const S=global.SA.spatial; let ok=0,ko=0;
function check(label,p){(p?ok++:ko++);console.log((p?'OK  ':'FAIL ')+label);}
function near(a,b,eps=1e-12){return Math.abs(a-b)<eps;}
const G=S.grid(3,4);check('griglia row-major 3x4',G.length===12&&G[5].row===1&&G[5].col===1);
for(const kind of ['rook','queen'])for(const style of ['binary','row']){
 const W=S.weights(3,4,kind,style);let degrees=W.map(a=>a.length);
 check(kind+' '+style+': simmetria adiacenza',W.every((nb,i)=>nb.every(e=>W[e.j].some(t=>t.j===i))));
 check(kind+' '+style+': diagonale nulla',W.every((nb,i)=>nb.every(e=>e.j!==i)));
 check(kind+' '+style+': normalizzazione',W.every(nb=>style==='binary'?nb.every(e=>e.w===1):near(nb.reduce((a,b)=>a+b.w,0),1)));
 check(kind+' '+style+': cardinalita centro',degrees[5]===(kind==='rook'?4:8));
}
let D=S.weights(3,4,'distance','binary',1.5);
check('distanza 1.5 include le diagonali',D[5].length===8);
check('lag costante normalizzato unitario',S.lag(S.weights(4,4,'rook','row'),Array(16).fill(7)).every(v=>near(v,7)));
check('s0=numero di aree, row-normalizzata',near(S.inspect(S.weights(8,8,'rook','row')).s0,64));
for(const f of [()=>S.grid(1,2),()=>S.weights(2,2,'unk','binary'),()=>S.weights(2,2,'rook','unnamed'),()=>S.weights(2,2,'distance','row',0)]){let yes=false;try{f()}catch(e){yes=true;}check('input degenerato rigettato',yes);}
check('isolate possibile con distanza piccola',S.inspect(S.weights(3,3,'distance','row',0.2)).isolates===9);
console.log('\n'+ok+' superati, '+ko+' falliti');process.exit(ko?1:0);

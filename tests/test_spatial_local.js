global.window=global;
for(const f of ['rng.js','spatial.js','spatial-areal.js','spatial-local.js']) require('../src/core/'+f);
const sp=SA.spatial, ar=SA.spatialAreal, loc=SA.spatialLocal;
let ok=0,bad=0;
function check(k,v){if(v){ok++;console.log('OK  '+k);}else{bad++;console.error('FAIL '+k);}}
function near(a,b,t=1e-10){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<t;}
for(const kind of ['rook','queen','distance'])for(const style of ['binary','row']){
 const W=sp.weights(8,8,kind,style,1.5), x=ar.generate(8,8,'sar',2026,.6).x;
 const L=loc.local(x,W),G=ar.moran(x,W);
 check('somma locali = S0*I '+kind+' '+style,near(L.I.reduce((a,b)=>a+b,0),G.I*G.s0,1e-8));
 check('corretto numero I locali '+kind+' '+style,L.I.length===64&&L.I.every(Number.isFinite));
 check('aspettative negative/zero '+kind+' '+style,L.expected.every(v=>v<=1e-12));
}
const W=sp.weights(2,3,'rook','row'),x=[1,2,3,5,7,9], L=loc.local(x,W);
// E esatta mediante permutazioni di tutti e cinque i valori per ciascuna unità.
for(let i=0;i<x.length;i++){
 const rest=L.z.filter((_,j)=>i!==j), perms=[];
 function search(j){if(j===rest.length){let sum=0;for(const e of W[i]){let pos=e.j<i?e.j:e.j-1;sum+=e.w*rest[pos];}perms.push(L.z[i]*sum/L.m2);return;}
   for(let k=j;k<rest.length;k++){[rest[j],rest[k]]=[rest[k],rest[j]];search(j+1);[rest[j],rest[k]]=[rest[k],rest[j]];}}
 search(0);check('E locale condizionale cella '+i,near(perms.reduce((a,b)=>a+b,0)/perms.length,L.expected[i]));
}
const a=loc.adjust([.001,.01,.02,.2],'BH');
check('BH correzione nota',a.every((v,i)=>near(v,[.004,.02,.02666666666666667,.2][i])));
check('BY mai inferiore a BH',loc.adjust([.001,.01,.02,.2],'BY').every((v,i)=>v>=a[i]));
check('missing p resta missing',Number.isNaN(loc.adjust([.02,NaN,.3],'BH')[1]));
check('none p invariato',loc.adjust([.01,.04],'none').join()===[.01,.04].join());
const fixed=ar.generate(8,8,'iid',42).x;
for(const scale of ['none','2','4'])for(const zoning of ['regular','shifted']){
 const A=loc.aggregate(fixed,scale,zoning), req=scale==='none'?64:scale==='2'?16:4;
 check('aggregazione '+scale+' '+zoning,A.x.length===req&&A.members.reduce((s,m)=>s+m.length,0)===64);
 check('media complessiva ponderata '+scale+' '+zoning,near(A.x.reduce((s,v,i)=>s+v*A.members[i].length,0)/64,fixed.reduce((s,v)=>s+v,0)/64));
 check('partizione integrale '+scale+' '+zoning,A.members.flat().sort((a,b)=>a-b).join()==Array.from({length:64},(_,i)=>i).join());
}
const row=sp.weights(8,8,'rook','row'), mr=loc.local(fixed,row), aa=new SA.RRNG(7),bb=new SA.RRNG(7);
check('condizionale deterministico stesso seed',loc.conditionalOne(mr.z,row,mr.m2,aa).join()===loc.conditionalOne(mr.z,row,mr.m2,bb).join());
const vals=Array.from({length:11},(_,i)=>loc.conditionalOne(mr.z,row,mr.m2,new SA.RRNG(i+4)));
const ps=loc.pValues(mr.I,mr.expected,vals,row);
check('p Monte Carlo validi',ps.every(v=>v>=1/12 && v<=1));
check('varianza costante gestita',!loc.local(Array(16).fill(2),sp.weights(4,4,'rook','binary')).valid);
console.log('\n'+ok+' test LISA superati, '+bad+' falliti');process.exit(bad?1:0);

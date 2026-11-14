global.window=global;
for(const file of ['dist.js','rng.js','spatial.js','spatial-areal.js'])require('../src/core/'+file);
const SA=global.SA,sp=SA.spatial,ar=SA.spatialAreal;
let ok=0,ko=0;
function check(label,p){(p?ok++:ko++);console.log((p?'OK  ':'FAIL ')+label);}
function near(a,b,eps=1e-10){return Math.abs(a-b)<eps;}
const W=sp.weights(4,4,'rook','row');
const patterns=['blocks','checker','iid','trend','sar'];
for(const k of patterns){let data=ar.generate(4,4,k,2026,0.6),m=ar.moran(data.x,W);check(k+': I finito',m.valid&&Number.isFinite(m.I));check(k+': E[I] esatto',near(m.expected,-1/15));}
check('griglia 4x4 checker: Moran I = -1',near(ar.moran(ar.generate(4,4,'checker',9).x,W).I,-1));
check('griglia 4x4 blocks: Moran I = 17/24 (row)',near(ar.moran(ar.generate(4,4,'blocks',9).x,W).I,17/24));
const x=ar.generate(8,8,'iid',2026).x;
for(const kind of ['rook','queen'])for(const style of ['row','binary']){
  const w=sp.weights(8,8,kind,style),res=ar.moran(x,w),z=res.z;
  let s0=0,cross=0;for(let i=0;i<64;i++)for(const q of w[i]){s0+=q.w;cross+=q.w*z[i]*z[q.j];}
  check(kind+' '+style+': identita bilineare',near(res.I,64*cross/(s0*res.ss)));
}
const z=ar.generate(8,8,'sar',2026,0.7),zs=sp.lag(z.W,z.x);
check('DGP SAR: (I-rho W)z = epsilon',z.x.every((v,i)=>near(v-0.7*zs[i],z.noise[i],1e-8)));
const order=new SA.RRNG(222),a=ar.shuffled([0,1,2,3,4,5],order);
check('permutazione: multinsieme invariato',a.slice().sort().join(',')==='0,1,2,3,4,5');
let r1=new SA.RRNG(3),r2=new SA.RRNG(3);
// Confronto diretto dei primi 20 passi
r1=new SA.RRNG(3);r2=new SA.RRNG(3);
check('seed riproduce ogni passo',Array.from({length:20},()=>ar.permuteOnce(x,sp.weights(8,8,'rook','row'),r1)).join()===Array.from({length:20},()=>ar.permuteOnce(x,sp.weights(8,8,'rook','row'),r2)).join());
check('valori costanti: I indefinito',!ar.moran(Array(16).fill(2),W).valid);
check('p-value con correzione +1 (right)',near(ar.pMonteCarlo(1,[-1,0,1,2],'greater'),3/5));
check('p-value con correzione +1 (left)',near(ar.pMonteCarlo(-1,[-2,-1,1,2],'less'),3/5));
// Enumerazione esaustiva 6!: sotto la permutazione E[I] = -1/(n-1).
const Wx=sp.weights(2,3,'rook','binary');let perm=[1,2,3,4,5,6],total=0,count=0;
function scan(i){if(i===perm.length){total+=ar.moran(perm,Wx).I;count++;return;}for(let j=i;j<perm.length;j++){[perm[i],perm[j]]=[perm[j],perm[i]];scan(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}}
scan(0);check('enumerazione esatta 6! E[I]=-1/5',count===720&&near(total/count,-0.2));
console.log('\n'+ok+' superati, '+ko+' falliti');process.exit(ko?1:0);

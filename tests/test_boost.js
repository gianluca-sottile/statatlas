/* StatAtlas — test numerici indipendenti del motore gradient boosting. */
const fs = require('fs'), vm = require('vm');
const C = { window: {} }; C.window.window = C.window;
for (const file of ['src/core/rng.js', 'src/core/boost.js']) vm.runInNewContext(fs.readFileSync(file,'utf8'), C.window, {filename:file});
const A = C.window.SA.boost, RRNG = C.window.SA.RRNG;
let ok = 0, ko = 0;
function ck(msg, test) { if (test) {console.log('OK ', msg);ok++;} else {console.log('FAIL ',msg);ko++;} }
function near(a,b,t=1e-10) {return Math.abs(a-b) <= t;}
let x=[1,2,3,4,5,6], y=[0,0,0,3,3,3];
let t=A.tree1D(x,y,2,1);
ck('split al punto medio: 3,5',!t[0].leaf && t[0].thr===3.5);
ck('foglie con le medie corrette',near(A.treePredict(t,2),0) && near(A.treePredict(t,5),3));
ck('foglie pure, SSE nulla',t.filter(v=>v.leaf).every(v=>near(v.sse,0)));
t=A.tree1D(x,y,0,1); ck('profondità 0: solo la radice',t.length===1 && near(t[0].value,1.5));
t=A.tree1D([1,1,1,1],[1,2,3,4],3,1); ck('x costante: nessuno split',t.length===1);
t=A.tree1D(x,y,4,4); ck('vincolo minLeaf impedisce split',t.length===1);
let fail=false;try{A.tree1D([0,1],[1],2,1);}catch(e){fail=true;} ck('dimensioni incompatibili sollevano eccezione',fail);
for(const z of [-30,-5,0,2,30]) ck('sigmoid stabile z='+z,near(A.sigmoid(z),1/(1+Math.exp(-z)),1e-13));
ck('intercetta gaussiana', near(A.intercept([2,4,6],'gaussian'),4));
ck('intercetta binaria',near(A.intercept([1,0,1,0],'binary'),0));
function deriv(y,f) {let h=1e-5;return (A.loss([y],[f+h],'binary')-A.loss([y],[f-h],'binary'))/(2*h);}
for(let z of [-2,0,1.8]) for(let c of [0,1]) ck('gradiente logistico y='+c+', f='+z,near(-deriv(c,z),c-A.sigmoid(z),1e-9));
ck('MSE noto',near(A.loss([0,3],[1,5],'gaussian'),2.5));
let g=new RRNG(2026), xx=Array.from({length:110},()=>-2+4*g.unif());
let yy=xx.map(q=>1.4*Math.sin(1.6*q)+.25*q+.3*g.norm());
let pred=Array(110).fill(A.intercept(yy,'gaussian'));
let loss=[A.loss(yy,pred,'gaussian')], structure=true;
for(let i=0;i<80;i++){
 const res=A.pseudo(yy,pred,'gaussian'), tree=A.tree1D(xx,res,2,8);
 structure=structure&&tree.every(z=>z.leaf?z.n>=8:z.gain>0&&tree[z.l].n+tree[z.r].n===z.n);
 A.update(pred,tree,xx,.1);loss.push(A.loss(yy,pred,'gaussian'));
}
ck('invarianti CART (n, minLeaf, gain)',structure);
ck('loss training non crescente per questo scenario',loss.every((v,i)=>i===0||v<=loss[i-1]+1e-11));
ck('fit riduce MSE di almeno 50%',loss.at(-1)<.5*loss[0]);
g=new RRNG(2026);let xb=Array.from({length:100},()=>-2+4*g.unif()), yb=xb.map(q=>+(g.unif()<A.sigmoid(2.5*Math.sin(1.5*q)+.45*q)));
let raw=Array(100).fill(A.intercept(yb,'binary')), losses=[A.loss(yb,raw,'binary')];
for(let i=0;i<100;i++){const tree=A.tree1D(xb,A.pseudo(yb,raw,'binary'),2,8);A.update(raw,tree,xb,.1);losses.push(A.loss(yb,raw,'binary'));}
ck('log loss binaria non crescente',losses.every((v,i)=>i===0||v<=losses[i-1]+1e-11));
ck('log loss binaria migliora sul training',losses.at(-1)<losses[0]);
console.log(`\n${ok} superati, ${ko} falliti`);process.exit(ko?1:0);

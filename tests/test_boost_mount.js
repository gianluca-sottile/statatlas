/* Smoke test indipendente da jsdom: verifica che il laboratorio possa essere montato
 * e disegnato su API DOM/plot sostitutive. NON sostituisce un collaudo browser reale. */
const fs=require('fs'),vm=require('vm');
class E {
  constructor(tag='div') {this.tag=tag;this.children=[];this.attrs={};this.nodeType=1;this._html='';}
  append(...x){this.children.push(...x);return this;}
  appendChild(x){this.children.push(x);return x;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(){}
  querySelector(){return new E('svg');}
  querySelectorAll(){return [];}
  set innerHTML(x){this._html=x;this.children=[];}
  get innerHTML(){return this._html;}
}
const C={window:{}};C.window.window=C.window;
for(const f of ['src/core/rng.js','src/core/boost.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),C.window,{filename:f});
const SA=C.window.SA;
SA.fmt=(v,d=3)=>Number(v).toFixed(d);
SA.theme=()=>({c1:'#3675a1',c2:'#d18550',c3:'#8a65b5',c_theory:'#182736',accent:'#468284',ink:'#111',ink_2:'#333',rule_2:'#bbb',card:'#fff'});
SA.plot={frame:(box,o)=>({g:new E('g'),m:{l:40,t:15},W:o.W,H:o.H,x:x=>40+(x-o.x[0])*620/(o.x[1]-o.x[0]),y:y=>o.H-42-(y-o.y[0])*(o.H-60)/(o.y[1]-o.y[0]),t:SA.theme()}),
 svg:()=>new E('svg'),dots:()=>new E('path'),curve:()=>new E('path'),text:()=>new E('text'),path:pts=>pts.map(q=>q.join(',')).join(' '),legendSwatch:()=>new E('svg')};
let runnerMock=null;
SA.ui={el:(name,attrs,...kids)=>new E(name).append(...(attrs&&attrs.nodeType?[attrs,...kids]:kids)),
 button:()=>new E('button'),step:()=>({body:new E('div')}),badge:()=>new E('span'),icon:()=>new E('svg'),slider:()=>new E('input'),
 runner:o=>(runnerMock={frame:0,running:false,stop:()=>{},controls:()=>[],refresh:()=>{},key:()=>{},step:o.step}),
 codeBlock:fn=>{const e=new E('pre');e.refresh=()=>{e.code=fn();};e.refresh();return e;},
 openDrawer:()=>{},csv:()=>'',download:()=>{},exportPNG:()=>{}};
SA.labs={}; SA.registerLab=(id,lab)=>{SA.labs[id]=lab;};
C.window.document={addEventListener:()=>{},removeEventListener:()=>{}};
vm.runInNewContext(fs.readFileSync('src/labs/21-gradient-boosting.js','utf8'),C.window,{filename:'21-gradient-boosting.js'});
let count=0;
try {
 const page=new E('div');
 SA.labs.boost.mount(page,{part:{part:'VI',title:'Apprendimento supervisionato'},lab:{num:'21',title:'Gradient boosting'}});
 count=page.children.length;
 if(count!==7) throw Error('Sezioni attese: 6, effettive: '+count);
 for(let i=0;i<110;i++){runnerMock.frame=i;runnerMock.step();if(i%10===0)SA.labs.boost.redraw();}
 SA.labs.boost.redraw();SA.labs.boost.unmount();
 console.log('OK: mount, render, 110 iterazioni, redraw, unmount e 6 sezioni didattiche senza eccezioni');
}catch(e){console.log('FAIL:',e.stack);process.exit(1);}

/* StatAtlas · Macrofase D — versioned offline experiment snapshots.
 * JSON only: no eval, no remote storage, no private Challenge answers.
 */
var SA = window.SA || (window.SA = {});
SA.experiments = (function () {
  'use strict';
  var FORMAT = 'statatlas.experiment', VERSION = 1, MAX_BYTES = 160000, MAX_URL = 1900;
  var restoring = false;
  function isEN() { return !!(SA.i18n && SA.i18n.isEnglish()); }
  function tr(it,en) { return isEN() ? en : it; }
  function pageNow() { return document.querySelector('#main .page'); }
  function eligibleFields(page) {
    return Array.prototype.filter.call(page.querySelectorAll('.controls input, .controls select, .controls textarea'), function (f) {
      return !f.closest('.experiment-panel') && f.type !== 'hidden' && f.getAttribute('aria-label') !== 'Versione dei dati spaziali';
    });
  }
  function readFields(page) {
    return eligibleFields(page).map(function (f) { return {
      tag:f.tagName.toLowerCase(), type:f.type||'', value:f.value,
      checked:f.type==='checkbox'||f.type==='radio' ? !!f.checked : null
    }; });
  }
  function readSegments(page) {
    return Array.prototype.map.call(page.querySelectorAll('.controls .seg'), function (group) {
      var buttons=group.querySelectorAll('button');
      return Array.prototype.findIndex.call(buttons,function (b) {
        return b.getAttribute('aria-pressed')==='true'||b.classList.contains('on')||b.classList.contains('is-active');
      });
    });
  }
  function capture() {
    if (restoring) throw Error('An experiment is being restored');
    var lab=SA.currentLab, page=pageNow();
    if (!lab||!SA.labs[lab]||!page) throw Error('Open a laboratory first');
    var runner=SA.ui.activeRunner, adapter=SA.labs[lab];
    var checkpoint=runner&&runner.experimentCheckpoint?runner.experimentCheckpoint():(adapter.experimentCheckpoint?adapter.experimentCheckpoint():null);
    return {
      format:FORMAT,version:VERSION,engine:SA.buildId||'development-unversioned',
      lab:lab,created:new Date().toISOString(),
      configuration:{fields:readFields(page),segments:readSegments(page)},
      checkpoint:checkpoint,
      spatial:adapter.exportExperimentState?adapter.exportExperimentState():null,
      manualData:adapter.exportManualExperimentData?adapter.exportManualExperimentData():null
    };
  }
  function validate(data) {
    if(!data||typeof data!=='object'||Array.isArray(data)||data.format!==FORMAT||data.version!==VERSION)
      throw Error('Unsupported experiment format/version');
    if(!SA.labs[data.lab]||!SA.findLab(data.lab))throw Error('Unknown laboratory id');
    if(typeof data.engine!=='string'||data.engine!==SA.buildId)
      throw Error('Different engine build: identical reproduction cannot be certified');
    var cfg=data.configuration;
    if(!cfg||!Array.isArray(cfg.fields)||cfg.fields.length>120||!Array.isArray(cfg.segments)||cfg.segments.length>80)
      throw Error('Invalid control configuration');
    cfg.fields.forEach(function(f){
      if(!f||!['input','select','textarea'].includes(f.tag)||typeof f.value!=='string'||f.value.length>250||
        !['string','boolean'].includes(typeof f.checked)&&f.checked!==null)
        throw Error('Invalid control value');
    });
    cfg.segments.forEach(function(i){if(!Number.isInteger(i)||i< -1||i>30)throw Error('Invalid segment selection');});
    if(data.checkpoint!==null && data.checkpoint!==undefined){
      if(!data.checkpoint||!Number.isSafeInteger(data.checkpoint.steps)||data.checkpoint.steps<0||data.checkpoint.steps>100000||
        typeof data.checkpoint.progress!=='number'||!Number.isFinite(data.checkpoint.progress)||
        data.checkpoint.progress<0||data.checkpoint.progress>1||typeof data.checkpoint.finished!=='boolean')
        throw Error('Invalid checkpoint');
    }
    if(data.manualData!==null&&data.manualData!==undefined){
      if(!SA.labs[data.lab].importManualExperimentData || !data.manualData ||
        data.manualData.kind!=='manual-xy-v1' || data.manualData.manual!==true ||
        !Array.isArray(data.manualData.points) || data.manualData.points.length<3 ||
        data.manualData.points.length>500 ||
        !data.manualData.points.every(function (pt) {
          return Array.isArray(pt)&&pt.length===2&&pt.every(function(x){return typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1000000;});
        })) throw Error('Invalid or unsupported manually edited observations');
    }
    if(data.spatial!==null&&data.spatial!==undefined){
      if(!data.spatial||data.spatial.kind!=='spatial-points-v1'||!Array.isArray(data.spatial.points)||data.spatial.points.length>175)
        throw Error('Invalid spatial data');
    }
    return data;
  }
  function parse(text) {
    if(typeof text!=='string'||text.length>MAX_BYTES)throw Error('Experiment JSON exceeds size limit');
    return validate(JSON.parse(text));
  }
  function restoreControls(page,config) {
    config.fields.forEach(function(saved,i){
      var field=eligibleFields(page)[i];
      if(!field||field.tagName.toLowerCase()!==saved.tag)throw Error('Incompatible control layout at position '+i);
      if(field.type==='radio'||field.type==='checkbox'){
        if(field.checked!==saved.checked){field.checked=saved.checked;field.dispatchEvent(new Event('change',{bubbles:true}));}
      } else if(field.value!==saved.value){
        if(field.tagName==='SELECT'&&!Array.prototype.some.call(field.options,function(o){return o.value===saved.value;}))
          throw Error('Option not supported by this laboratory');
        if(field.type==='number'||field.type==='range'){
          var x=+saved.value,min=field.min===''?-Infinity:+field.min,max=field.max===''?Infinity:+field.max;
          if(!Number.isFinite(x)||x<min||x>max)throw Error('Numerical parameter outside allowed range');
        }
        field.value=saved.value;
        if(field.type==='range')field.dispatchEvent(new Event('input',{bubbles:true}));
        field.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
    config.segments.forEach(function(index,i){
      if(index<0)return;
      var group=page.querySelectorAll('.controls .seg')[i];
      if(!group)throw Error('Missing segmented control');
      var btn=group.querySelectorAll('button')[index];
      if(!btn)throw Error('Incompatible segmented control');
      if(btn.getAttribute('aria-pressed')!=='true' && !btn.classList.contains('is-active') && !btn.classList.contains('on'))btn.click();
    });
  }
  function tell(text) {
    var page=pageNow(), status=page&&page.querySelector('.experiment-status');
    if(status)status.textContent=text;
  }
  function restore(data) {
    validate(data);
    if(restoring)return Promise.reject(Error('Another import is running'));
    restoring=true;
    return new Promise(function(resolve,reject){
      function failed(e){restoring=false;tell(tr('Importazione non riuscita: ','Import failed: ')+e.message);reject(e);}
      function ready(){
        try{
          var page=pageNow();
          if(SA.currentLab!==data.lab||!page)throw Error('Laboratory navigation failed');
          restoreControls(page,data.configuration);
          if(data.spatial){
            if(!SA.labs[data.lab].importExperimentState)throw Error('Spatial adapter unavailable');
            SA.labs[data.lab].importExperimentState(data.spatial);
          }
          function finishRestored() {
            try {
              // A checkpoint replay regenerates its own sample; restore human edits afterwards.
              if(data.manualData) SA.labs[data.lab].importManualExperimentData(data.manualData);
              restoring=false;tell(tr('Esperimento ripristinato.','Experiment restored.'));
              if(SA.i18n&&SA.i18n.isEnglish())SA.i18n.localizeCurrent(page);
              resolve(data);
            }catch(e){failed(e);}
          }
          var runner=SA.ui.activeRunner;
          if(data.checkpoint){
            var restoreCheckpoint=runner&&runner.restoreExperimentCheckpoint?runner.restoreExperimentCheckpoint.bind(runner):
              (SA.labs[data.lab].restoreExperimentCheckpoint?SA.labs[data.lab].restoreExperimentCheckpoint.bind(SA.labs[data.lab]):null);
            if(!restoreCheckpoint)throw Error('Runner adapter unavailable');
            return restoreCheckpoint(data.checkpoint,function(e){
              if(e)return failed(e);
              finishRestored();
            });
          }
          finishRestored();
        }catch(e){failed(e);}
      }
      try{
        if(SA.currentLab===data.lab){window.dispatchEvent(new Event('hashchange'));setTimeout(ready,0);}
        else{location.hash='#/'+data.lab;setTimeout(ready,0);}
      }catch(e){failed(e);}
    });
  }
  function bytes64(text){
    return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function unbytes64(text){
    if(!/^[A-Za-z0-9_-]+$/.test(text))throw Error('Invalid shared-link encoding');
    return decodeURIComponent(escape(atob(text.replace(/-/g,'+').replace(/_/g,'/'))));
  }
  function linkFor(snapshot){
    validate(snapshot);
    var token=bytes64(JSON.stringify(snapshot));
    var url=location.href.split('#')[0]+'#/'+snapshot.lab+'/exp/'+token;
    if(url.length>MAX_URL)throw Error('This experiment is too large for a URL; use the JSON file');
    return url;
  }
  function restoreFromHash(id){
    var hash=location.hash,match=hash.match(/^#\/([^/]+)\/exp\/([A-Za-z0-9_-]+)$/);
    if(!match||match[1]!==id)return;
    if(match[2].length>MAX_URL){tell(tr('Link troppo lungo.','Shared link is too long.'));return;}
    try{var data=parse(unbytes64(match[2]));if(data.lab!==id)throw Error('URL laboratory does not match snapshot');
      // Replace the shared URL with the ordinary lab route to avoid duplicate restores.
      history.replaceState(null,'','#/'+id);
      restore(data).catch(function(){});
    }catch(e){tell(tr('Link non valido: ','Invalid link: ')+e.message);}
  }
  function mount(page,id){
    if(page.querySelector('.experiment-panel'))return;
    var el=SA.ui.el,info=SA.findLab(id),kind=tr('Esperimenti riproducibili','Reproducible experiments');
    var file=el('input',{type:'file',accept:'application/json,.json',style:'display:none','aria-label':tr('Importa file JSON','Import JSON file')});
    file.addEventListener('change',function(){
      var f=file.files&&file.files[0];file.value='';
      if(!f)return;
      if(f.size>MAX_BYTES){tell(tr('File troppo grande.','File too large.'));return;}
      f.text().then(function(t){return restore(parse(t));}).catch(function(e){tell(tr('Importazione non riuscita: ','Import failed: ')+e.message);});
    });
    var p=el('section.experiment-panel',{'aria-label':kind},
      el('div.experiment-panel-header',el('strong',kind),
        el('span',tr('JSON offline · seed e checkpoint','Offline JSON · seed and checkpoint'))),
      el('div.experiment-actions',
        el('button.btn.btn-ghost',{type:'button',onclick:function(){
          try{SA.ui.download('StatAtlas_'+info.lab.num+'_experiment.json',JSON.stringify(capture(),null,2)+'\n','application/json');
            tell(tr('File JSON salvato.','Experiment JSON saved.'));}catch(e){tell(e.message);}
        }},tr('Salva JSON','Save JSON')),
        el('button.btn.btn-ghost',{type:'button',onclick:function(){file.click();}},tr('Apri JSON','Open JSON')),
        el('button.btn.btn-ghost',{type:'button',onclick:function(){
          try{var url=linkFor(capture());SA.ui.copy(url);tell(tr('Link copiato.','Share link copied.'));}
          catch(e){tell(tr('Link non disponibile: ','Cannot share link: ')+e.message);}
        }},tr('Copia link','Copy link'))),
      el('p.experiment-status',{role:'status','aria-live':'polite'},
        tr('I file JSON includono i parametri e, dove disponibile, il checkpoint. Non includono i risultati delle Challenges.',
           'JSON saves parameters and, where supported, the checkpoint. Challenge results are excluded.')),
      file);
    var bridge=page.querySelector('[data-course-bridge]');
    var head=page.querySelector('.lab-head');
    if(bridge)bridge.insertAdjacentElement('afterend',p);
    else if(head)head.insertAdjacentElement('afterend',p);
    else page.insertBefore(p,page.firstChild);
    restoreFromHash(id);
  }
  return {capture:capture,validate:validate,parse:parse,restore:restore,linkFor:linkFor,mount:mount,
    restoreFromHash:restoreFromHash,FORMAT:FORMAT,VERSION:VERSION};
})();

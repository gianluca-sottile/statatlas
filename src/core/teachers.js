/* StatAtlas Macrofase E — Teachers. One-file offline paths, editable JSON projects.
 * No backend, no remote telemetry, no trusted grades or hidden answer keys.
 */
(function () {
  'use strict';
  var SA = window.SA || (window.SA = {});
  var FORMAT = 'statatlas.teaching-path', VERSION = 1, MAX_JSON = 260000, MAX_STEPS = 24;
  var draft = null;
  function en(){return !!(SA.i18n && SA.i18n.isEnglish());}
  function tr(it,english){return en()?english:it;}
  function E(tag,attrs){return SA.ui.el.apply(null,arguments);}
  function find(id){return SA.findLab(id);}
  function allLabs(){return SA.catalog.reduce(function(a,p){return a.concat(p.labs);},[]);}
  function id(){return 'path-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);}
  function defaultProject(){return {format:FORMAT,version:VERSION,engine:SA.buildId,id:id(),
    language:en()?'en':'it',title:'',description:'',audience:'',steps:[]};}
  function taskTitle(lab,challengeId){
    var list=SA.challenges.bank[lab]||[];
    var q=list.filter(function(t){return t.id===challengeId;})[0];
    if(!q)return challengeId;
    var translated=SA.i18n&&SA.i18n.challengeTasks?SA.i18n.challengeTasks(lab,list):list;
    return (translated.filter(function(t){return t.id===challengeId;})[0]||q).title;
  }
  function validate(obj){
    if(!obj||typeof obj!=='object'||Array.isArray(obj)||obj.format!==FORMAT||obj.version!==VERSION)
      throw Error('Unsupported teaching-path format');
    if(obj.engine!==SA.buildId)throw Error('Different StatAtlas engine: presets may not reproduce identically');
    if(typeof obj.id!=='string'||!/^[a-zA-Z0-9_-]{3,90}$/.test(obj.id))throw Error('Invalid path id');
    if(!['it','en'].includes(obj.language))throw Error('Invalid language');
    [['title',140],['description',1600],['audience',160]].forEach(function(k){
      if(typeof obj[k[0]]!=='string'||obj[k[0]].length>k[1])throw Error('Invalid '+k[0]);
    });
    if(!obj.title.trim())throw Error('A path title is required');
    if(!Array.isArray(obj.steps)||!obj.steps.length||obj.steps.length>MAX_STEPS)throw Error('A path needs 1–24 steps');
    var seen=new Set();
    obj.steps.forEach(function(step){
      if(!step||typeof step!=='object'||!find(step.lab)||typeof step.id!=='string'||
        !/^[a-zA-Z0-9_-]{3,90}$/.test(step.id)||seen.has(step.id))throw Error('Invalid or duplicate step');
      seen.add(step.id);
      if(typeof step.title!=='string'||step.title.length>160||typeof step.instructions!=='string'||step.instructions.length>2400)
        throw Error('Invalid step description');
      if(!Number.isInteger(step.minutes)||step.minutes<1||step.minutes>240)throw Error('Invalid duration');
      var allowed=new Set((SA.challenges.bank[step.lab]||[]).map(function(q){return q.id;}));
      if(!Array.isArray(step.challengeIds)||step.challengeIds.length>3||
        new Set(step.challengeIds).size!==step.challengeIds.length||
        !step.challengeIds.every(function(x){return typeof x==='string'&&allowed.has(x);}))throw Error('Invalid challenge selection');
      if(step.preset!=null){
        if(step.preset.lab!==step.lab)throw Error('Experiment preset belongs to a different laboratory');
        SA.experiments.validate(step.preset);
      }
    });
    return obj;
  }
  function parse(text){
    if(typeof text!=='string'||text.length>MAX_JSON)throw Error('Teaching project too large');
    return validate(JSON.parse(text));
  }
  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function persist(){/* Explicit Save JSON is the only durable teacher-project write. */}
  function draftStep(lab,preset){
    var info=find(lab);if(!info)throw Error('Unknown laboratory');
    return {id:'step-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),
      lab:lab,title:info.lab.title,instructions:'',minutes:20,
      challengeIds:(SA.challenges.bank[lab]||[]).map(function(q){return q.id;}),preset:preset||null};
  }
  function addCurrent(){
    var snap=SA.experiments.capture();if(!draft)draft=defaultProject();
    if(draft.steps.length>=MAX_STEPS)throw Error('Maximum 24 steps');
    draft.steps.push(draftStep(snap.lab,snap));
    location.hash='#/teachers';
  }
  function makeDownload(name,text,type){SA.ui.download(name,text,type||'application/json;charset=utf-8');}
  function builder(main){
    if(!draft)draft=defaultProject();
    var area=E('div.teacher-builder');
    main.appendChild(area);
    function status(s){var p=area.querySelector('.teacher-status');if(p)p.textContent=s;}
    function safe(fn){return function(){try{fn.apply(null,arguments);}catch(e){status(tr('Errore: ','Error: ')+e.message);}};}
    function textField(label,value,max,oninput,kind){
      var input=E(kind==='textarea'?'textarea':'input',{maxlength:String(max),'aria-label':label});
      if(kind!=='textarea')input.type='text';
      input.value=value;
      input.addEventListener('input',function(){oninput(input.value);persist();});
      return E('label.teacher-field',E('span',label),input);
    }
    function chooseLab(){
      var selector=E('select',{'aria-label':tr('Laboratorio da aggiungere','Laboratory to add')});
      allLabs().forEach(function(l){selector.appendChild(E('option',{value:l.id},l.num+' · '+l.title));});
      return selector;
    }
    // The quick guide is part of the authoring page (never a remote document).
    // Keep its expanded/collapsed preference when the teacher edits a step.
    var guideExpanded=true;
    function makeGuide(){
      var rows=[
        [tr('Definisci il percorso','Define the path'),
          tr('Apri “Impostazioni del percorso”. Scrivi un titolo obbligatorio, indica destinatari e obiettivi e scegli la lingua degli studenti.',
             'Open “Path settings”. Enter the required title, add the audience and learning goals, and choose the student language.')],
        [tr('Aggiungi le attività','Add activities'),
          tr('Scegli un laboratorio tra i 31 disponibili e premi “Aggiungi laboratorio”. Puoi riutilizzare lo stesso laboratorio con consegne diverse (fino a 24 attività).',
             'Choose one of the 31 laboratories and select “Add laboratory”. You can reuse the same laboratory with different instructions (up to 24 activities).')],
        [tr('Prepara ogni attività','Prepare each activity'),
          tr('Seleziona l’attività dall’elenco; modifica consegna, durata e fino a tre sfide. Riordina le attività con le frecce.',
             'Select an activity from the outline; edit its instructions, duration and up to three challenges. Reorder activities with the arrows.')],
        [tr('Salva uno scenario, se serve','Attach a scenario if needed'),
          tr('Per riprodurre gli stessi parametri, configura un laboratorio e scegli “Aggiungi esperimento al percorso docente”, oppure carica il suo preset JSON nell’attività.',
             'For reproducible parameters, configure a laboratory and select “Add experiment to teaching path”, or upload its JSON preset in the activity.')],
        [tr('Conserva il progetto docente','Keep the editable teacher project'),
          tr('Apri “Esporta / Apri progetto” e salva il JSON: serve per riprendere le modifiche. Il progetto non viene salvato automaticamente.',
             'Open “Export / Open project” and save the JSON to continue editing later. The authoring project is not saved automatically.')],
        [tr('Distribuisci la lezione agli studenti','Share the lesson with students'),
          tr('Dallo stesso pannello esporta l’HTML studenti: è un file autonomo utilizzabile offline. Gli studenti possono esportare report JSON locali; non vengono inviati né certificati voti.',
             'From the same panel export the standalone student HTML, which works offline. Students can export local JSON reports; no grades are uploaded or certified.')]
      ];
      var list=E('ol.teacher-guide-steps');
      rows.forEach(function(row,index){
        list.appendChild(E('li.teacher-guide-step',
          E('span.teacher-guide-index',{'aria-hidden':'true'},String(index+1).padStart(2,'0')),
          E('div',E('strong',row[0]),E('p',row[1]))));
      });
      var guide=E('details.teacher-guide',
        E('summary.teacher-guide-trigger',
          E('span.teacher-guide-heading',
            E('span.teacher-guide-kicker',tr('PER INIZIARE','GETTING STARTED')),
            E('strong',tr('Come funziona StatAtlas for Teachers?','How does StatAtlas for Teachers work?')),
            E('span.teacher-guide-subtitle',tr('Guida rapida in 6 passaggi · clicca per aprire o chiudere',
              'Six-step quick start · select to expand or collapse'))),
          E('span.teacher-guide-caret',{'aria-hidden':'true'},'⌄')),
        E('div.teacher-guide-body',
          E('p.teacher-guide-intro',tr('Non occorre programmare: componi una sequenza di esperimenti, aggiungi le consegne e genera una pagina già pronta per la classe.',
            'No programming required: assemble experiments, add student instructions, and generate a ready-to-use classroom page.')),
          list,
          E('p.teacher-guide-notice',
            E('strong',tr('Da ricordare: ','Remember: ')),
            tr('JSON = progetto modificabile dal docente; HTML = pagina da consegnare agli studenti. Conserva entrambi. Le configurazioni possono richiedere la stessa versione di StatAtlas.',
               'JSON = editable teacher project; HTML = page to hand to students. Keep both. Presets may require the same StatAtlas version.'))));
      guide.open=guideExpanded;
      guide.addEventListener('toggle',function(){guideExpanded=guide.open;});
      return guide;
    }
    var selectedStepId=null;
    function render(){
      if(area._teacherKeys)area.removeEventListener('keydown',area._teacherKeys);
      area.replaceChildren();
      if(draft.steps.length && !draft.steps.some(function(s){return s.id===selectedStepId;}))selectedStepId=draft.steps[0].id;
      var title=E('h1',tr('StatAtlas for Teachers','StatAtlas for Teachers'));
      var intro=E('p.teacher-lead',tr('Costruisci un percorso offline con laboratori, sfide, consegne e configurazioni riproducibili. Il progetto docente resta modificabile in JSON.',
        'Build a standalone offline teaching path with labs, challenges, instructions and reproducible presets. Keep an editable teacher JSON project.'));
      // Only the teaching PATH title is required; activity titles may use their defaults.
      // Keep a single native input so keyboard, screen-reader and project state stay in sync.
      var pathTitleField=textField(tr('Titolo del percorso','Path title'),draft.title,140,function(v){draft.title=v;});
      pathTitleField.classList.add('teacher-path-title-field');
      var pathTitleInput=pathTitleField.querySelector('input');
      pathTitleInput.required=true;
      pathTitleInput.setAttribute('aria-required','true');
      pathTitleInput.setAttribute('aria-describedby','teacher-path-title-hint teacher-path-title-error');
      var titleCaption=pathTitleField.querySelector('span');
      titleCaption.classList.add('teacher-path-title-caption');
      titleCaption.append(E('span.teacher-required-star',{'aria-hidden':'true'},' *'),
        E('small.teacher-required-tag',tr('Obbligatorio','Required')));
      pathTitleField.append(E('small#teacher-path-title-hint.teacher-path-title-hint',
        tr('Necessario per esportare il progetto JSON e il percorso HTML.',
           'Required to export the teacher JSON project and the student HTML.')));
      var titleError=E('span#teacher-path-title-error.teacher-path-title-error',{'role':'alert',hidden:true},
        tr('Inserisci un titolo per continuare con l’esportazione.',
           'Enter a path title before exporting.'));
      pathTitleField.append(titleError);
      pathTitleInput.addEventListener('input',function(){
        if(draft.title.trim()){
          titleError.hidden=true;
          pathTitleInput.removeAttribute('aria-invalid');
          pathTitleField.classList.remove('teacher-field-invalid');
        }
      });
      var hdr=E('section.teacher-card.teacher-path-settings',E('h2',tr('Impostazioni del percorso','Path settings')),
        pathTitleField,
        textField(tr('Destinatari','Audience'),draft.audience,160,function(v){draft.audience=v;}),
        textField(tr('Obiettivi e descrizione','Description and objectives'),draft.description,1600,function(v){draft.description=v;},'textarea'));
      var language=E('select',{'aria-label':tr('Lingua del percorso distribuito','Student path language')},
        E('option',{value:'it'},'Italiano'),E('option',{value:'en'},'English'));
      language.value=draft.language;
      language.addEventListener('change',function(){draft.language=language.value;});
      hdr.appendChild(E('label.teacher-field',E('span',tr('Lingua degli studenti','Student language')),language));
      var select=chooseLab();
      var add=E('button.btn',{type:'button',onclick:safe(function(){
        if(draft.steps.length>=MAX_STEPS)throw Error('Maximum 24 steps');
        var next=draftStep(select.value,null);draft.steps.push(next);selectedStepId=next.id;render();
      })},tr('Aggiungi laboratorio','Add laboratory'));
      var picker=E('section.teacher-card',E('h2',tr('Sequenza didattica','Teaching sequence')),
        E('p',tr('Puoi ripetere un laboratorio con consegne o configurazioni diverse. Usa le frecce per riordinare.',
          'Repeat a laboratory with different instructions or configurations. Reorder with the arrows.')),
        E('div.teacher-actions.teacher-add-row',select,add));
      var outline=E('nav.teacher-outline',{'aria-label':tr('Elenco delle attività','Activity outline')});
      var editor=E('div.teacher-editor-pane');
      draft.steps.forEach(function(step,index){
        var tab=E('button.teacher-outline-item',{type:'button','aria-current':step.id===selectedStepId?'step':null,onclick:function(){selectedStepId=step.id;render();}},
          E('span.teacher-outline-num',String(index+1).padStart(2,'0')),
          E('span.teacher-outline-name',step.title||find(step.lab).lab.title),
          E('span.teacher-outline-meta',step.minutes+' min · '+step.challengeIds.length+' ' + tr('sfide','challenges')));
        outline.appendChild(tab);
        var info=find(step.lab), group=E('article.teacher-step');
        group.hidden=step.id!==selectedStepId;
        var head=E('div.teacher-step-head',E('strong',(index+1)+'. '+info.lab.num+' · '+info.lab.title));
        var up=E('button.btn.btn-ghost',{type:'button','aria-label':tr('Sposta su','Move up'),disabled:index===0,onclick:function(){
          var el=draft.steps.splice(index,1)[0];draft.steps.splice(index-1,0,el);render();
        }},'↑');
        var down=E('button.btn.btn-ghost',{type:'button','aria-label':tr('Sposta giù','Move down'),disabled:index===draft.steps.length-1,onclick:function(){
          var el=draft.steps.splice(index,1)[0];draft.steps.splice(index+1,0,el);render();
        }},'↓');
        var remove=E('button.btn.btn-ghost',{type:'button',onclick:function(){draft.steps.splice(index,1);selectedStepId=null;render();}},tr('Rimuovi','Remove'));
        head.append(E('div.teacher-actions',up,down,remove));group.append(head);
        group.append(textField(tr('Titolo dell’attività','Activity title'),step.title,160,function(v){step.title=v;}));
        group.append(textField(tr('Consegna agli studenti','Instructions for students'),step.instructions,2400,function(v){step.instructions=v;},'textarea'));
        var minutes=E('input',{type:'number',min:'1',max:'240',value:String(step.minutes),
          'aria-label':tr('Durata stimata in minuti','Estimated duration (minutes)')});
        minutes.addEventListener('change',function(){step.minutes=+minutes.value;});
        group.append(E('label.teacher-field.teacher-short',E('span',tr('Minuti previsti','Estimated minutes')),minutes));
        var challenges=E('fieldset.teacher-challenges',E('legend',tr('Challenges da assegnare','Assigned challenges')));
        (SA.challenges.bank[step.lab]||[]).forEach(function(q){
          var checkbox=E('input',{type:'checkbox',value:q.id});checkbox.checked=step.challengeIds.includes(q.id);
          checkbox.addEventListener('change',function(){
            if(checkbox.checked && !step.challengeIds.includes(q.id))step.challengeIds.push(q.id);
            if(!checkbox.checked)step.challengeIds=step.challengeIds.filter(function(x){return x!==q.id;});
          });
          challenges.appendChild(E('label.teacher-check',checkbox,E('span',taskTitle(step.lab,q.id))));
        });
        group.append(challenges);
        var file=E('input',{type:'file',accept:'.json,application/json','aria-label':tr('Carica preset esperimento','Upload experiment preset')});
        file.addEventListener('change',function(){
          var f=file.files&&file.files[0];if(!f)return;
          if(f.size>160000){status('Experiment preset too large');return;}
          f.text().then(function(t){var snap=SA.experiments.parse(t);if(snap.lab!==step.lab)throw Error('Different laboratory');
            step.preset=snap;render();}).catch(function(err){status(err.message);});
        });
        var removePreset=E('button.btn.btn-ghost',{type:'button',onclick:function(){step.preset=null;render();}},tr('Rimuovi preset','Remove preset'));
        removePreset.hidden=!step.preset;
        group.append(E('div.teacher-preset',E('strong',step.preset?tr('Esperimento D associato','D experiment attached'):tr('Nessun preset: impostazioni iniziali del laboratorio','No preset: laboratory defaults')),
          E('div.teacher-actions',file,removePreset)));
        editor.appendChild(group);
      });
      var layout=E('div.teacher-editor-grid',outline,editor);
      picker.appendChild(layout);
      var actions=E('section.teacher-card',E('h2',tr('Esporta o riapri','Export or reopen')),
        E('p',tr('Il progetto JSON serve al docente. Il file HTML è il percorso autonomo per gli studenti; include il motore, ma non invia dati a un server.',
          'Teacher JSON remains editable. The student HTML is fully standalone; it includes the engine and sends no information to a server.')));
      var save=E('button.btn',{type:'button',onclick:safe(function(){if(!requirePathTitle())return;
        validate(draft);
        makeDownload('StatAtlas_Teachers_project.json',JSON.stringify(draft,null,2)+'\n');status(tr('Progetto JSON esportato.','Teacher JSON exported.'));
      })},tr('Salva progetto JSON','Save teacher JSON'));
      var fileProject=E('input',{type:'file',accept:'.json,application/json','aria-label':tr('Apri progetto docente','Open teacher project')});
      fileProject.addEventListener('change',function(){var f=fileProject.files&&fileProject.files[0];if(!f)return;
        if(f.size>MAX_JSON){status('Project too large');return;}
        f.text().then(function(t){draft=clone(parse(t));render();}).catch(function(err){status(err.message);});
      });
      var exportHTML=E('button.btn',{type:'button',onclick:safe(function(){if(!requirePathTitle())return;
        var html=buildStudentHTML(draft);
        makeDownload('StatAtlas_Teachers_'+draft.id+'.html',html,'text/html;charset=utf-8');
        status(tr('Pagina HTML autonoma esportata.','Standalone student HTML exported.'));
      })},tr('Esporta HTML studenti','Export student HTML'));
      actions.append(E('div.teacher-actions',save,fileProject,exportHTML));
      // Modeless editor layout, modal secondary operations. Native fields are MOVED
      // (not replicated), so preset, file and export event handlers remain intact.
      var tools=E('div.teacher-ux-toolbar');
      var settingsBtn=E('button.btn',{type:'button','aria-haspopup':'dialog'},tr('Impostazioni del percorso','Path settings'));
      var exportBtn=E('button.btn.btn-primary',{type:'button','aria-haspopup':'dialog'},tr('Esporta / Apri progetto','Export / Open project'));
      var pathSummary=E('span.teacher-ux-summary',draft.title||tr('Percorso senza titolo','Untitled path'));
      tools.append(settingsBtn,exportBtn,pathSummary);
      var teacherBack=E('button.teacher-ux-backdrop',{type:'button','aria-label':tr('Chiudi il pannello','Close panel'),hidden:true});
      var teacherPanel=E('aside.teacher-ux-panel',{role:'dialog','aria-modal':'true','aria-labelledby':'teacher-ux-panel-title','aria-hidden':'true',hidden:true});
      var panelTitle=E('h2#teacher-ux-panel-title');
      var close=E('button.btn.btn-ghost',{type:'button','aria-label':tr('Chiudi','Close')},'×');
      var panelHead=E('div.teacher-ux-panel-head',panelTitle,close);
      var panelBody=E('div.teacher-ux-panel-body');
      teacherPanel.append(panelHead,panelBody);
      var lastButton=null;
      function openPanel(section,button){
        lastButton=button;panelTitle.textContent=section==='settings'?tr('Impostazioni del percorso','Path settings'):tr('Esporta o riapri','Export or reopen');
        panelBody.replaceChildren(section==='settings'?hdr:actions);
        teacherBack.hidden=false;teacherPanel.hidden=false;teacherPanel.setAttribute('aria-hidden','false');
        document.body.classList.add('ux-modal-open');close.focus();
      }
      function requirePathTitle(){
        if(draft.title.trim())return true;
        // An error only in the page-level status would be hidden behind the export panel.
        // Switch to settings and focus the missing field instead of silently aborting.
        openPanel('settings',settingsBtn);
        pathTitleField.classList.add('teacher-field-invalid');
        pathTitleInput.setAttribute('aria-invalid','true');
        titleError.hidden=false;
        status(tr('Il titolo del percorso è obbligatorio.','A path title is required.'));
        pathTitleInput.focus();
        return false;
      }
      function closePanel(){
        if(teacherPanel.hidden)return;
        teacherPanel.hidden=true;teacherPanel.setAttribute('aria-hidden','true');teacherBack.hidden=true;
        document.body.classList.remove('ux-modal-open');if(lastButton&&lastButton.isConnected)lastButton.focus();
        pathSummary.textContent=draft.title||tr('Percorso senza titolo','Untitled path');
      }
      settingsBtn.addEventListener('click',function(){openPanel('settings',settingsBtn);});
      exportBtn.addEventListener('click',function(){openPanel('export',exportBtn);});
      close.addEventListener('click',closePanel);teacherBack.addEventListener('click',closePanel);
      var teacherKeys=function(e){
        if(teacherPanel.hidden)return;
        if(e.key==='Escape'){e.preventDefault();closePanel();return;}
        if(e.key!=='Tab')return;
        var fields=Array.prototype.filter.call(teacherPanel.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]'),function(n){return !!n.getClientRects().length;});
        if(!fields.length)return;
        if(e.shiftKey&&document.activeElement===fields[0]){e.preventDefault();fields[fields.length-1].focus();}
        else if(!e.shiftKey&&document.activeElement===fields[fields.length-1]){e.preventDefault();fields[0].focus();}
      };
      area._teacherKeys=teacherKeys;area.addEventListener('keydown',teacherKeys);
      area.append(title,intro,tools,makeGuide(),picker,E('p.teacher-status',{role:'status','aria-live':'polite'},
        tr('Nessun dato viene caricato online. I report degli studenti sono locali e non costituiscono voti certificati.',
          'No data is uploaded. Student reports remain local and are not certified exam grades.')),teacherBack,teacherPanel);
    }
    render();
  }
  // Reconstruct a clean offline StatAtlas document from the compiled CSS and JS.
  // Never capture live DOM: it would include mutated charts and classroom state.
  function buildStudentHTML(project){
    validate(project);
    var style=Array.prototype.map.call(document.querySelectorAll('head > style'),function(x){return x.textContent;}).join('\n');
    var core=Array.prototype.find.call(document.scripts,function(x){return x.textContent.includes('window.SA.buildId = ');});
    if(!style||!core||!core.textContent.includes(SA.buildId))throw Error('Standalone compilation source unavailable');
    // Use script JSON text rather than interpolation into executable JS (XSS safety).
    var data=JSON.stringify(project).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
    var studentStyle='.teacher-student-banner{position:sticky;top:0;z-index:25;padding:12px 20px;background:var(--paper,#fff);border-bottom:2px solid var(--accent,#85421a);box-shadow:0 2px 7px #0001}' +
      '.teacher-student-banner h1{font-size:1.12rem;margin:0 0 6px}.teacher-student-banner .teacher-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.teacher-student-banner button{font:inherit;padding:5px 10px;border:1px solid #777;border-radius:6px;background:transparent;color:inherit;cursor:pointer}' +
      '.teacher-student-banner button[aria-current="step"]{background:#245d54;color:white}' +
      '.teacher-student-banner textarea{display:block;width:min(100%,60rem);min-height:60px;margin:6px 0;border:1px solid #888;padding:7px;background:var(--card,#fff);color:inherit}' +
      '.teacher-student-banner .student-status{font-size:.85rem}.sidebar,.topbar{display:none!important}' +
      '.app{display:block!important;margin:0!important;width:100%!important}.app main{width:100%!important;max-width:1200px;margin:auto}' +
      '.challenge-card[hidden],.challenge-section[hidden],.challenge-progress[hidden],.challenge-shortcut[hidden]{display:none!important}@media(max-width:640px){.teacher-student-banner{position:relative;padding:10px}}';
    var head='<!doctype html><html lang="'+project.language+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>StatAtlas for Teachers · Offline</title><style>'+style.replace(/<\/style/gi,'<\\/style')+'\n'+studentStyle+'</style></head><body>';
    var shell='<a class="sr-only" href="#main">Skip to content</a><div class="topbar"><a class="brand" href="#/" id="topBrand"><span class="brand-mark">StatAtlas</span></a>' +
      '<button class="btn btn-ghost btn-icon" id="menuBtn" type="button" aria-label="Open menu"></button></div>' +
      '<section class="teacher-student-banner" id="teacherStudent" aria-label="Teaching path"></section>' +
      '<div class="app"><aside class="sidebar" id="sidebar"></aside><main id="main" tabindex="-1"></main></div>';
    var json='<script id="teacherProject" type="application/json">'+data+'</script>';
    var startup='<script>SA.start();SA.teachers.studentBoot(JSON.parse(document.getElementById("teacherProject").textContent));<\\/script>';
    // The closing script tag is literal only after joining; all source text is escaped.
    startup=startup.replace('<\\/script>','</script>');
    return head+shell+json+'<script>'+core.textContent.replace(/<\/script/gi,'<\\/script')+'</script>'+startup+'</body></html>';
  }
  function studentBoot(project){
    validate(project);
    var box=document.getElementById('teacherStudent');
    if(!box)throw Error('Student path shell missing');
    var i=0, applying=false, records=project.steps.map(function(s){return {step:s.id,completed:false,reflection:'',solved:[]};});
    var storageKey='sa-teachers-report-'+project.id+'-'+SA.buildId;
    try {var stored=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(stored&&Array.isArray(stored.records)&&stored.records.length===records.length)
        stored.records.forEach(function(r,j){
          if(r.step===records[j].step){records[j].completed=!!r.completed;records[j].reflection=String(r.reflection||'').slice(0,3000);
            records[j].solved=Array.isArray(r.solved)?r.solved.filter(function(x){return project.steps[j].challengeIds.includes(x);}):[];}
        });
    }catch(e){}
    function keep(){try{localStorage.setItem(storageKey,JSON.stringify({records:records}));}catch(e){}}
    function make(t,cls,text){var n=document.createElement(t);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
    function labels(it,english){return project.language==='en'?english:it;}
    function observeSolved(){
      var step=project.steps[i],r=records[i],current=document.querySelectorAll('#main .challenge-card.challenge-solved');
      current.forEach(function(el){var id=el.getAttribute('data-challenge-id');if(step.challengeIds.includes(id)&&!r.solved.includes(id))r.solved.push(id);});
      keep();var counter=box.querySelector('.student-status');if(counter)counter.textContent=
        labels('Sfide completate: ','Challenges completed: ')+r.solved.length+'/'+step.challengeIds.length+
        labels(' · attività ',' · activity ')+(r.completed?labels('completata','completed'):labels('in corso','in progress'));
      var shortcut=document.querySelector('#main .challenge-shortcut');
      if(shortcut && step.challengeIds.length){
        shortcut.textContent=labels('Mettiti alla prova · ','Challenges · ')+r.solved.length+'/'+step.challengeIds.length;
        shortcut.setAttribute('aria-label',labels('Apri le sfide assegnate: ','Open assigned Challenges: ')+r.solved.length+'/'+step.challengeIds.length);
      }
    }
    function applyView(){
      if(applying)return;
      var step=project.steps[i];
      if(SA.currentLab!==step.lab){location.hash='#/'+step.lab;return;}
      applying=true;
      var ready=function(){
        var section=document.querySelector('#main .challenge-section');
        if(section){section.hidden=step.challengeIds.length===0;
          var originalProgress=section.querySelector('.challenge-progress');if(originalProgress)originalProgress.hidden=true;
          var originalShortcut=document.querySelector('#main .challenge-shortcut');if(originalShortcut)originalShortcut.hidden=step.challengeIds.length===0;
          section.querySelectorAll('.challenge-card').forEach(function(el){el.hidden=!step.challengeIds.includes(el.getAttribute('data-challenge-id'));});}
        applying=false;observeSolved();
      };
      if(step.preset){SA.experiments.restore(step.preset).then(ready,function(err){applying=false;
        var msg=box.querySelector('.student-error');if(msg)msg.textContent=labels('Preset non ripristinato: ','Preset could not be restored: ')+err.message;
      });}else ready();
    }
    function select(n){
      if(n<0||n>=project.steps.length)return;
      i=n;var s=project.steps[i],r=records[i];
      box.replaceChildren();
      box.append(make('h1','',project.title));
      box.append(make('p','student-current',labels('Attività ' ,'Activity ')+(i+1)+'/'+project.steps.length));
      var description=make('p','',project.description);description.hidden=!project.description;box.append(description);
      var nav=make('nav','teacher-actions');nav.setAttribute('aria-label',labels('Attività del percorso','Path activities'));
      project.steps.forEach(function(st,j){var b=make('button','',String(j+1)+' · '+(st.title||find(st.lab).lab.title));
        b.type='button';if(j===i)b.setAttribute('aria-current','step');b.addEventListener('click',function(){select(j);});nav.append(b);});
      box.append(nav);
      box.append(make('p','student-instruction',labels('Consegna: ','Instructions: ')+(s.instructions||labels('Esplora i risultati e rispondi alle Challenges selezionate.',
        'Explore the results and answer the selected challenges.'))));
      box.append(make('p','student-duration',labels('Durata indicativa: ','Estimated time: ')+s.minutes+' min'));
      var reflection=make('textarea');reflection.maxLength=3000;
      reflection.setAttribute('aria-label',labels('Riflessione sul laboratorio','Lab reflection'));
      reflection.placeholder=labels('Quale conclusione ricavi dall’esperimento?','What do you conclude from this experiment?');
      reflection.value=r.reflection;reflection.addEventListener('input',function(){r.reflection=reflection.value;keep();});
      var workspace=make('section','student-reflection-panel');workspace.hidden=true;
      workspace.setAttribute('aria-label',labels('Riflessione e report','Reflection and report'));
      var workspaceBack=make('button','student-workspace-backdrop');workspaceBack.type='button';
      workspaceBack.setAttribute('aria-label',labels('Chiudi il pannello','Close panel'));workspaceBack.hidden=true;
      var workspaceHead=make('div','student-workspace-head');
      workspaceHead.append(make('h2','',labels('Riflessione e report','Reflection and report')));
      var dismiss=make('button','btn btn-ghost');dismiss.type='button';dismiss.textContent='×';
      dismiss.setAttribute('aria-label',labels('Chiudi','Close'));workspaceHead.append(dismiss);
      workspace.append(workspaceHead,reflection);
      var buttons=make('div','teacher-actions');
      var complete=make('button','',labels('Segna attività completata','Mark activity completed'));
      complete.addEventListener('click',function(){r.completed=!r.completed;keep();observeSolved();});
      var dl=make('button','',labels('Esporta report JSON','Export report JSON'));
      dl.addEventListener('click',function(){observeSolved();var data={format:'statatlas.student-report',version:1,
        path:project.id,pathTitle:project.title,engine:SA.buildId,exported:new Date().toISOString(),
        records:project.steps.map(function(st,j){return {stepId:st.id,lab:st.lab,completed:records[j].completed,
          reflection:records[j].reflection,challengeIds:st.challengeIds.slice(),solved:records[j].solved.slice()};})};
        SA.ui.download('StatAtlas_student_report_'+project.id+'.json',JSON.stringify(data,null,2)+'\n','application/json;charset=utf-8');});
      var reset=make('button','',labels('Cancella avanzamento locale','Clear local progress'));
      reset.addEventListener('click',function(){
        if(!window.confirm(labels('Cancellare risposte e riflessioni salvate in questo browser?',
          'Clear answers and reflections stored in this browser?')))return;
        records.forEach(function(entry){entry.completed=false;entry.reflection='';entry.solved=[];});
        try{localStorage.removeItem(storageKey);}catch(e){}
        select(i);
      });
      var jump=make('button','',labels('Vai alle Challenges assegnate','Go to assigned Challenges'));
      jump.hidden=!s.challengeIds.length;
      jump.addEventListener('click',function(){
        // Challenges are displayed in the original non-reflow workbench drawer.
        // Do not scroll the laboratory to a section now moved into that drawer.
        if(SA.workbench && SA.workbench.open){SA.workbench.open('challenges',jump);return;}
        var target=document.querySelector('#main .challenge-section');
        if(target)target.scrollIntoView({behavior:'auto',block:'start'});
      });
      buttons.append(complete,dl,reset);workspace.append(buttons);
      workspace.append(make('p','',labels('Le riflessioni restano in questo browser fino alla cancellazione. Il report è formativo e può essere modificato: non è un voto certificato.',
        'Reflections remain in this browser until cleared. The formative report is editable and is not a certified grade.')));
      var openWorkspace=make('button','student-reflection-toggle');openWorkspace.type='button';
      openWorkspace.textContent=labels('Riflessione e report','Reflection and report');
      openWorkspace.setAttribute('aria-expanded','false');
      var aux=make('div','student-quick-actions');aux.append(jump,openWorkspace);
      box.append(aux,make('p','student-status'),make('p','student-error'),workspaceBack,workspace);
      function toggleWorkspace(open){workspace.hidden=!open;workspaceBack.hidden=!open;
        openWorkspace.setAttribute('aria-expanded',String(open));
        document.body.classList.toggle('student-workspace-open',open);
        if(open)dismiss.focus();else openWorkspace.focus();}
      openWorkspace.addEventListener('click',function(){toggleWorkspace(true);});
      dismiss.addEventListener('click',function(){toggleWorkspace(false);});
      workspaceBack.addEventListener('click',function(){toggleWorkspace(false);});
      workspace.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();toggleWorkspace(false);}});
      document.body.classList.remove('student-workspace-open');
      var next=make('button','student-next',labels('Attività successiva →','Next activity →'));next.hidden=i===project.steps.length-1;
      next.addEventListener('click',function(){select(i+1);});aux.append(next);
      if(SA.currentLab!==s.lab)location.hash='#/'+s.lab;
      else window.dispatchEvent(new Event('hashchange'));
      setTimeout(applyView,0);
    }
    var observer=new MutationObserver(function(mutations){
      if(mutations.some(function(m){return m.type==='attributes'&&m.attributeName==='class'&&m.target.classList&&m.target.classList.contains('challenge-card');}))
        observeSolved();
    });
    observer.observe(document.getElementById('main'),{subtree:true,attributes:true,attributeFilter:['class']});
    // Restore the locale without persisting a preference to the student's browser.
    if(SA.i18n.isEnglish()!==(project.language==='en'))SA.i18n.setLanguage(project.language,SA.catalog);
    window.addEventListener('hashchange',function(){if(applying)return;
      var want=project.steps[i].lab;
      if(location.hash.split('/')[1]!==want){location.hash='#/'+want;return;}
      setTimeout(function(){if(!applying)applyView();},0);
    });
    select(0);
  }
  SA.teachers={FORMAT:FORMAT,VERSION:VERSION,validate:validate,parse:parse,builder:builder,
    buildStudentHTML:buildStudentHTML,studentBoot:studentBoot,addCurrent:addCurrent,
    getDraft:function(){return draft;},setDraft:function(obj){draft=clone(validate(obj));},draftStep:draftStep};
})();

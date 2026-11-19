/* StatAtlas UX — scientific-first workbench.
 * Presentation only: never writes RNG state, input values or model parameters.
 * Auxiliary material lives in a keyboard-accessible, non-reflowing dialog.
 */
var SA = window.SA || (window.SA = {});
SA.workbench = (function () {
  'use strict';
  var active = null;
  function EN() { return !!(SA.i18n && SA.i18n.isEnglish()); }
  function t(it,en) { return EN() ? en : it; }
  function element(tag,klass,text) {
    var x=document.createElement(tag); if(klass)x.className=klass;
    if(text!==undefined)x.textContent=text;return x;
  }
  function teardown() {
    if(!active)return;
    active.close(false);
    document.removeEventListener('keydown',active.keys);
    active=null;
  }
  function mount(page,id) {
    teardown();
    if(!page || !page.querySelector('.lab-head'))return;
    page.classList.add('ux-workbench');
    var isStudent=!!document.getElementById('teacherStudent');
    var head=page.querySelector('.lab-head');
    var firstStep=page.querySelector('section.step');
    var experimentStep=Array.prototype.find.call(page.querySelectorAll('section.step'),function(s){
      return s.querySelector('.lab-grid, .spatial-studio');
    });
    var bridge=page.querySelector('.course-bridge');
    var share=page.querySelector('.experiment-panel');
    var goals=head.querySelector('.chips');
    var englishCompanion=page.querySelector('.en-companion');
    var cover=head.querySelector('.lab-cover');
    var focus=page.querySelector('.focus-box');
    var guide=page.querySelector('.lab-howto');
    var existingActions=head.querySelector('.head-actions');
    var challengeStep=page.querySelector('section.challenge-section');
    var codeStep=Array.prototype.find.call(page.querySelectorAll('section.step'),function(s){
      var label=s.querySelector('.step-label');
      return label && /riproduci in r|reproduce in r|reproduce with r/i.test(label.textContent) && s.querySelector('.code');
    });
    // Keep the research question visible in the hero. The full lesson stays accessible.
    // Move rather than duplicate DOM nodes to preserve links, download handlers and data.
    var actionbar=element('nav','ux-actions');
    actionbar.setAttribute('aria-label',t('Strumenti del laboratorio','Laboratory tools'));
    var studyGroup=element('div','ux-action-group ux-study-group');
    var rGroup=element('div','ux-action-group ux-r-group');
    var saveGroup=element('div','ux-action-group ux-save-group');
    studyGroup.setAttribute('aria-label',t('Impara e mettiti alla prova','Learn and test yourself'));
    rGroup.setAttribute('aria-label',t('Collegamenti e codice R','R course and code'));
    saveGroup.setAttribute('aria-label',t('Salvataggio e condivisione','Save and share'));
    actionbar.append(studyGroup,rGroup,saveGroup);
    function action(text,kind,fn,group) {
      var b=element('button','btn ux-action ux-action-'+kind,text);
      b.type='button';b.dataset.uxAction=kind;
      b.addEventListener('click',fn);group.appendChild(b);return b;
    }
    // Preserve the native theory action: its drawer provides two depths,
    // exercises and references. It is not a second, duplicated theory engine.
    var theoryButton=existingActions&&existingActions.querySelector(':scope > .btn:first-child');
    var challengeButton=existingActions&&existingActions.querySelector('.challenge-shortcut');
    if(theoryButton){
      theoryButton.classList.add('ux-action','ux-action-theory');
      theoryButton.dataset.uxAction='theory';
      theoryButton.setAttribute('aria-label',t('Approfondisci','Explore theory'));
    }
    var oldCourse=existingActions&&existingActions.querySelector('.course-bridge-jump');
    if(oldCourse)oldCourse.remove();
    var dialog=element('aside','ux-dialog'); dialog.hidden=true;
    dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','ux-dialog-title');dialog.setAttribute('aria-hidden','true');
    var backdrop=element('button','ux-backdrop');backdrop.type='button';backdrop.hidden=true;
    backdrop.setAttribute('aria-label',t('Chiudi il pannello','Close panel'));
    var top=element('div','ux-dialog-head');var title=element('h2','',t('Strumenti','Tools'));title.id='ux-dialog-title';
    var closeBtn=element('button','btn btn-ghost ux-close','×');closeBtn.type='button';
    closeBtn.setAttribute('aria-label',t('Chiudi','Close'));top.append(title,closeBtn);
    var body=element('div','ux-dialog-body');dialog.append(top,body);
    var panes={};
    function pane(key) {var x=element('section','ux-dialog-pane');x.dataset.uxPane=key;x.hidden=true;body.append(x);panes[key]=x;return x;}
    var guidePane=pane('guide'), challengePane=pane('challenges'), coursePane=pane('course'), codePane=pane('code'), sharePane=pane('share');
    if(goals)guidePane.appendChild(goals);
    if(englishCompanion)guidePane.appendChild(englishCompanion);
    if(focus)guidePane.appendChild(focus);
    if(guide) {guide.open=true;guidePane.appendChild(guide);}
    if(firstStep && firstStep!==experimentStep) {
      firstStep.classList.add('ux-original-question');guidePane.appendChild(firstStep);
    }
    if(cover)guidePane.appendChild(cover);
    if(challengeStep){
      challengePane.appendChild(challengeStep);
      // An open challenge is one working item; closing it retains its answer,
      // baseline and progress. No challenge object is recreated here.
      challengeStep.querySelectorAll('.challenge-card').forEach(function(card){
        card.addEventListener('toggle',function(){
          if(!card.open)return;
          challengeStep.querySelectorAll('.challenge-card').forEach(function(other){
            if(other!==card && other.open)other.open=false;
          });
        });
      });
    }
    if(bridge)coursePane.appendChild(bridge);
    if(codeStep)codePane.appendChild(codeStep);
    if(share)sharePane.appendChild(share);
    // Compact instructions preceding the actual interactive controls; no information lost.
    if(experimentStep){
      var expBody=experimentStep.querySelector('.step-body');
      var grid=experimentStep.querySelector('.lab-grid, .spatial-studio');
      if(expBody && grid){
        var extras=[];var before=grid.previousElementSibling;
        while(before && before!==expBody.querySelector(':scope > h2') && !before.classList.contains('step-label')) {
          var previous=before.previousElementSibling;
          if(before.matches('p, ol, ul, .prose, .callout, details:not(.lab-howto)'))extras.unshift(before);
          before=previous;
        }
        if(extras.length){
          var d=element('details','ux-experiment-context');var s=element('summary','',t('Prima di iniziare · indicazioni','Before you begin · guidance'));d.append(s);
          extras.forEach(function(e){d.appendChild(e);});expBody.insertBefore(d,grid);
        }
      }
    }
    var previousFocus=null;
    var headings={guide:t('Guida e obiettivi','Guide and learning goals'),challenges:t('Mettiti alla prova','Challenges'),course:t('Studia con R','Learn with R'),code:t('Codice R dell’esperimento','R code for this experiment'),share:t('Salva e condividi','Save and share')};
    function open(which,trigger){
      if(!panes[which])return;
      if(SA.ui && SA.ui.closeDrawer) SA.ui.closeDrawer();
      previousFocus=trigger||document.activeElement;
      if(which==='code' && codeStep){
        codeStep.querySelectorAll('.code').forEach(function(box){if(typeof box.refresh==='function')box.refresh();});
      }
      title.textContent=headings[which];
      Object.keys(panes).forEach(function(k){panes[k].hidden=k!==which;});
      backdrop.hidden=false;dialog.hidden=false;
      dialog.setAttribute('aria-hidden','false');page.classList.add('ux-dialog-open');
      document.body.classList.add('ux-modal-open');closeBtn.focus();
    }
    function close(refocus){
      if(dialog.hidden)return;
      dialog.hidden=true;dialog.setAttribute('aria-hidden','true');backdrop.hidden=true;
      page.classList.remove('ux-dialog-open');document.body.classList.remove('ux-modal-open');
      if(refocus!==false && previousFocus && previousFocus.isConnected)previousFocus.focus({preventScroll:true});
    }
    function keys(e){
      if(dialog.hidden)return;
      if(e.key==='Escape'){e.preventDefault();close();return;}
      if(e.key!=='Tab')return;
      var list=Array.prototype.filter.call(dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary'),function(n){return !!n.getClientRects().length;});
      if(!list.length)return;
      var first=list[0],last=list[list.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
    closeBtn.addEventListener('click',function(){close();});backdrop.addEventListener('click',function(){close();});
    document.addEventListener('keydown',keys);
    action(t('Guida','Guide'),'guide',function(e){open('guide',e.currentTarget);},studyGroup);
    if(theoryButton)studyGroup.appendChild(theoryButton);
    if(challengeButton && challengeStep){
      challengeButton.classList.add('ux-action','ux-action-challenges');
      challengeButton.dataset.uxAction='challenges';
      // The historical shortcut scrolls to a section. Capture the activation
      // before its original onclick and open that very section in the drawer.
      challengeButton.addEventListener('click',function(e){
        e.preventDefault();e.stopImmediatePropagation();open('challenges',challengeButton);
      },true);
      studyGroup.appendChild(challengeButton);
    }
    if(bridge)action(t('Corso R','R course'),'course',function(e){open('course',e.currentTarget);},rGroup);
    if(codeStep)action(t('Codice R','R code'),'code',function(e){open('code',e.currentTarget);},rGroup);
    if(share)action(t('Salva / Condividi','Save / Share'),'share',function(e){open('share',e.currentTarget);},saveGroup);
    if(!rGroup.children.length)rGroup.remove();
    if(!saveGroup.children.length)saveGroup.remove();
    // Move the teacher shortcut out of the large D panel: keep it explicit in author mode.
    var teach=share&&share.querySelector('.ux-teacher-add');
    if(teach && !isStudent){teach.classList.add('ux-teacher-in-panel');sharePane.appendChild(teach);}
    if(experimentStep)page.insertBefore(actionbar,experimentStep);
    else head.insertAdjacentElement('afterend',actionbar);
    // The action bar belongs directly after the title, not after a long question.
    head.insertAdjacentElement('afterend',actionbar);
    page.append(backdrop,dialog);
    // Update active helper buttons used in older scripts and keyboard shortcuts.
    active={close:close,keys:keys,open:open,isOpen:function(which){return !dialog.hidden && (!which || !panes[which].hidden);}};
  }
  return {
    mount:mount,teardown:teardown,
    open:function(which,trigger){if(active)active.open(which,trigger);},
    close:function(){if(active)active.close();},
    isOpen:function(which){return !!(active&&active.isOpen(which));}
  };
})();

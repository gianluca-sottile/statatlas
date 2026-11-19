/* StatAtlas UX: contextual mobile transport, presentation only.
 * Proxy the existing transport/map buttons; never create another runner,
 * mutate numerical state, or duplicate the simulation's event handlers.
 */
var SA = window.SA || (window.SA = {});
SA.mobileTransport = (function () {
  'use strict';
  var active = null;
  function en() { return !!(SA.i18n && SA.i18n.isEnglish()); }
  function tr(it,english) { return en() ? english : it; }
  function newElement(tag,cls) {
    var node=document.createElement(tag);
    if(cls)node.className=cls;
    return node;
  }
  function teardown() {
    if(!active)return;
    active.destroy();active=null;
  }
  function mount(page) {
    teardown();
    if(!page || !page.classList.contains('ux-workbench'))return;
    var standard=page.querySelector('.lab-grid');
    var spatial=page.querySelector('.spatial-studio');
    if(!standard && !spatial)return;
    var match=window.matchMedia('(max-width: 640px)');
    var bar=newElement('nav','sa-mobile-transport');
    bar.hidden=true;
    bar.setAttribute('aria-label',tr('Azioni della simulazione sempre disponibili','Persistent experiment actions'));
    bar.setAttribute('data-transport-mode','none');
    var buttons=[];
    var disposed=false, frame=0, observer=null, visibilityObserver=null, observed=null, lastMode='none';
    page.appendChild(bar);
    var names={
      play:['Avvia','Start'], step:['Passo','Step'], finish:['Completa','Finish'], reset:['Reset','Reset'],
      params:['Strumenti','Tools']
    };
    function proxy(key,label,source,icon) {
      var b=newElement('button','sa-mobile-transport-btn');
      b.type='button';b.dataset.transportAction=key;
      b.dataset.sourceAction=key;
      if(icon){var symbol=SA.ui.icon(icon);if(symbol) b.appendChild(symbol);}
      var span=newElement('span','sa-mobile-transport-text');span.textContent=label;b.appendChild(span);
      b.setAttribute('aria-label',source && (source.getAttribute('aria-label')||source.getAttribute('title')) || label);
      b.addEventListener('click',function(){
        if(key==='params'){
          var panel=spatial&&spatial.querySelector('.spatial-studio-panel');
          if(panel)panel.scrollIntoView({behavior:'auto',block:'start'});
        }else{
          var target=targetFor(key);
          if(target && target.isConnected && !target.disabled)target.click();
        }
        schedule();
      });
      bar.appendChild(b);buttons.push({key:key,node:b,label:span});
    }
    function targetFor(key) {
      if(lastMode==='spatial'){
        if(key==='reset')return spatial.querySelector('.spatial-studio-reset');
        if(key.indexOf('tool-')===0)return spatial.querySelector('.spatial-studio-tools [data-tool="'+key.slice(5)+'"]');
        return null;
      }
      var native=standard&&standard.querySelector('.controls .transport');
      if(!native)return null;
      var items=native.querySelectorAll(':scope > button');
      return items[{play:0,step:1,finish:2,reset:3}[key]]||null;
    }
    function compactMapLabel(source) {
      var kind=source.dataset.tool;
      if(kind==='high')return tr('+ Alto','+ High');
      if(kind==='low')return tr('+ Basso','+ Low');
      if(kind==='cluster')return tr('+ Gruppo','+ Group');
      if(kind==='move')return tr('Sposta','Move');
      return source.textContent.trim();
    }
    function setup(mode) {
      if(lastMode===mode)return;
      lastMode=mode;buttons.length=0;bar.replaceChildren();bar.dataset.transportMode=mode;
      if(mode==='runner'){
        proxy('play',tr('Avvia','Start'),targetFor('play'),'play');
        proxy('step',tr('Passo','Step'),targetFor('step'),'step');
        proxy('finish',tr('Completa','Finish'),targetFor('finish'),'fast');
        proxy('reset',tr('Reset','Reset'),targetFor('reset'),'reset');
      } else if(mode==='spatial'){
        var tools=spatial.querySelectorAll('.spatial-studio-tools [data-tool]');
        Array.prototype.slice.call(tools,0,2).forEach(function(source){
          proxy('tool-'+source.dataset.tool,compactMapLabel(source),source,null);
        });
        proxy('params',tr('Strumenti','Tools'),null,'step');
        proxy('reset',tr('Reset','Reset'),targetFor('reset'),'reset');
      }
      observeControls(mode);
    }
    function observeControls(mode) {
      if(observer)observer.disconnect();observer=null;observed=null;
      var target=mode==='runner' ? standard&&standard.querySelector('.controls') :
        mode==='spatial' ? spatial&&spatial.querySelector('.spatial-studio-panel') : null;
      if(!target)return;
      observed=target;
      observer=new MutationObserver(schedule);
      observer.observe(target,{childList:true,subtree:true,characterData:true,attributes:true,
        attributeFilter:['disabled','aria-pressed','data-busy','class']});
    }
    function sync() {
      buttons.forEach(function(item){
        if(item.key==='params')return;
        var src=targetFor(item.key),b=item.node;
        b.disabled=!src || !!src.disabled;
        if(!src)return;
        var activeState=src.getAttribute('aria-pressed');
        if(activeState!==null)b.setAttribute('aria-pressed',activeState);
        else b.removeAttribute('aria-pressed');
        b.classList.toggle('is-active',activeState==='true');
        b.classList.toggle('is-busy',src.getAttribute('data-busy')==='1');
        if(item.key==='play'){
          var raw=src.textContent.trim();
          var txt=raw;
          // The runner redraws this label in IT; the original remains the sole state source.
          if(en())txt=({'Avvia':'Start','Pausa':'Pause','Riprendi':'Resume','Riavvia':'Restart'})[raw]||raw;
          if(item.label.textContent!==txt)item.label.textContent=txt;
          var svg=b.querySelector('svg');
          var expected=/Pausa|Pause/.test(raw)?'pause':'play';
          if(svg && svg.dataset.transportIcon!==expected){
            var fresh=SA.ui.icon(expected);fresh.dataset.transportIcon=expected;
            svg.replaceWith(fresh);
          }
          b.setAttribute('aria-label',txt);
        } else if(item.key.indexOf('tool-')===0){
          var text=compactMapLabel(src);
          if(item.label.textContent!==text)item.label.textContent=text;
          b.setAttribute('aria-label',src.getAttribute('aria-label')||src.textContent.trim());
        } else b.setAttribute('aria-label',src.getAttribute('aria-label')||src.getAttribute('title')||item.label.textContent);
      });
    }
    function visibleSurface(node,top,bottom) {
      if(!node)return false;
      var r=node.getBoundingClientRect();
      return r.bottom>top+30 && r.top<bottom-15;
    }
    function visibleControls(node,top,bottom) {
      if(!node)return false;
      var r=node.getBoundingClientRect();
      return r.top>=top-5 && r.bottom<=bottom+5;
    }
    function blocked() {
      if(document.body.classList.contains('ux-modal-open') ||
        document.body.classList.contains('mobile-menu-open') ||
        document.documentElement.classList.contains('zoom-open') ||
        document.querySelector('.drawer.open, .modal:not([hidden]), .fig-modal:not([hidden])'))return true;
      var focus=document.activeElement;
      if(focus && page.contains(focus) && /^(INPUT|SELECT|TEXTAREA)$/.test(focus.tagName))return true;
      if(window.visualViewport && window.visualViewport.height<window.innerHeight*.72)return true;
      return false;
    }
    function update() {
      frame=0;if(disposed)return;
      var mode='none';
      var bottom=window.visualViewport?Math.min(innerHeight,window.visualViewport.height):innerHeight;
      var top=72,usableBottom=bottom-80;
      if(match.matches && !blocked()){
        var map=spatial&&spatial.querySelector('.spatial-studio-map');
        var panel=spatial&&spatial.querySelector('.spatial-studio-panel');
        var native=standard&&standard.querySelector('.controls .transport');
        if(map && visibleSurface(map,top,usableBottom) && !visibleControls(panel,top,usableBottom))mode='spatial';
        else if(native && visibleSurface(standard,top,usableBottom) && !visibleControls(native,top,usableBottom))mode='runner';
      }
      if(mode!=='none')setup(mode);
      var show=mode!=='none';
      bar.hidden=!show;
      page.classList.toggle('sa-mobile-transport-active',show);
      if(show)sync();
    }
    function schedule() {
      if(disposed || frame)return;
      frame=requestAnimationFrame(update);
    }
    function resize(){schedule();}
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',resize,{passive:true});
    if(window.visualViewport){window.visualViewport.addEventListener('resize',resize,{passive:true});window.visualViewport.addEventListener('scroll',schedule,{passive:true});}
    if(match.addEventListener)match.addEventListener('change',resize);
    else if(match.addListener)match.addListener(resize);
    // A dialog can change visibility without scrolling. Re-evaluate when it
    // closes, otherwise the transport could remain hidden after Escape.
    visibilityObserver=new MutationObserver(schedule);
    visibilityObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    visibilityObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    var nativeDrawer=document.querySelector('.drawer');
    if(nativeDrawer)visibilityObserver.observe(nativeDrawer,{attributes:true,attributeFilter:['class']});
    active={refresh:schedule,destroy:function(){
      disposed=true;
      if(frame)cancelAnimationFrame(frame);
      if(observer)observer.disconnect();
      if(visibilityObserver)visibilityObserver.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize);
      if(window.visualViewport){window.visualViewport.removeEventListener('resize',resize);window.visualViewport.removeEventListener('scroll',schedule);}
      if(match.removeEventListener)match.removeEventListener('change',resize);
      else if(match.removeListener)match.removeListener(resize);
      page.classList.remove('sa-mobile-transport-active');bar.remove();
    }};
    schedule();
  }
  return {mount:mount,teardown:teardown,refresh:function(){if(active)active.refresh();}};
})();

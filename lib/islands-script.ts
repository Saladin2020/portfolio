/**
 * Tiny non-React behavior for the server-rendered filter, menu, scroll spy,
 * and copy button. Kept out of the client component graph so hero, about,
 * skills, process, contact, and any later copy stay server-rendered.
 * Production analytics scripts are inserted on idle, only when the document
 * asks for them.
 */
export const islandsScript =
  '(function(){' +
  'function boot(){' +
  "document.addEventListener('click',function(e){" +
  "var btn=e.target&&e.target.closest&&e.target.closest('[data-filter]');" +
  'if(!btn)return;var group=btn.closest("[data-work-filter]");if(!group)return;' +
  'var value=btn.getAttribute("data-filter");' +
  'var onCls=["border-light-action-primary-bg","bg-light-action-primary-bg","text-light-action-primary-text","lg:bg-transparent","lg:type-h3","lg:text-light-text-heading"];' +
  'var offCls=["border-light-border-strong","text-light-text-secondary","hover:text-light-text-primary","lg:type-lead"];' +
  'var apply=function(){' +
  'var buttons=group.querySelectorAll("[data-filter]");' +
  'for(var i=0;i<buttons.length;i++){var b=buttons[i];var on=b===btn;b.setAttribute("aria-pressed",on?"true":"false");' +
  'var add=on?onCls:offCls;var remove=on?offCls:onCls;' +
  'for(var r=0;r<remove.length;r++)b.classList.remove(remove[r]);' +
  'for(var a=0;a<add.length;a++)b.classList.add(add[a]);}' +
  'var root=group.closest("[data-work-root]");' +
  'var panel=root&&root.querySelector("[data-active-filter]");' +
  'if(panel)panel.setAttribute("data-active-filter",value);' +
  'var status=root&&root.querySelector("[role=status]");' +
  'if(status)status.textContent=btn.getAttribute("data-count-label")||"";' +
  '};' +
  'var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;' +
  'if(!reduce&&document.startViewTransition)document.startViewTransition(apply);else apply();' +
  '});' +
  'var menuBtn=document.querySelector("[data-nav=menu-button]");' +
  'if(menuBtn){' +
  'var sheet=document.getElementById(menuBtn.getAttribute("aria-controls"));' +
  'var openLabel=menuBtn.getAttribute("data-open-label")||"";' +
  'var closeLabel=menuBtn.getAttribute("data-close-label")||"";' +
  'var setOpen=function(open){menuBtn.setAttribute("aria-expanded",open?"true":"false");menuBtn.setAttribute("aria-label",open?closeLabel:openLabel);};' +
  'menuBtn.addEventListener("click",function(){if(!sheet)return;if(sheet.open)sheet.close();else{sheet.showModal();setOpen(true);var a=sheet.querySelector("a");if(a)a.focus();}});' +
  'if(sheet){' +
  'sheet.addEventListener("close",function(){setOpen(false);menuBtn.focus();});' +
  'sheet.addEventListener("click",function(e){if(e.target===sheet||(e.target.closest&&e.target.closest("[data-menu-close]")))sheet.close();});' +
  'var links=sheet.querySelectorAll("a");for(var i=0;i<links.length;i++)links[i].addEventListener("click",function(){sheet.close();});' +
  'var mq=window.matchMedia("(width >= 1030px)");' +
  'mq.addEventListener("change",function(){if(mq.matches&&sheet.open)sheet.close();});' +
  '}' +
  '}' +
  'if("IntersectionObserver" in window){' +
  'var ids=[],seen={};' +
  'document.querySelectorAll("a[data-nav-link]").forEach(function(a){var id=a.getAttribute("data-nav-link");if(id&&!seen[id]&&document.getElementById(id)){seen[id]=1;ids.push(id);}});' +
  'var visible={};' +
  'var applySpy=function(){var current=null;for(var i=0;i<ids.length;i++)if(visible[ids[i]]){current=ids[i];break;}' +
  'document.querySelectorAll("a[data-nav-link]").forEach(function(a){if(a.getAttribute("data-nav-link")===current)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});};' +
  'var io=new IntersectionObserver(function(entries){entries.forEach(function(en){visible[en.target.id]=en.isIntersecting;});applySpy();},{rootMargin:"-40% 0px -55% 0px"});' +
  'for(var s=0;s<ids.length;s++){var el=document.getElementById(ids[s]);if(el)io.observe(el);}' +
  '}' +
  "document.addEventListener('click',function(e){" +
  "var btn=e.target&&e.target.closest&&e.target.closest('[data-copy-email]');" +
  'if(!btn)return;var email=btn.getAttribute("data-copy-email")||"";' +
  'var status=btn.parentElement&&btn.parentElement.querySelector("[data-copy-status]");' +
  'var toast=Number(btn.getAttribute("data-toast")||"2000");' +
  'var show=function(ok){if(!status)return;status.textContent=ok?(btn.getAttribute("data-copied")||""):(btn.getAttribute("data-fallback")||"");' +
  'window.clearTimeout(btn._copyTimer);btn._copyTimer=window.setTimeout(function(){status.textContent="";},ok?toast:toast*2);};' +
  'var fail=function(){var target=document.getElementById(btn.getAttribute("data-copy-target")||"");' +
  'if(target){var range=document.createRange();range.selectNodeContents(target);var sel=window.getSelection();if(sel){sel.removeAllRanges();sel.addRange(range);}}show(false);};' +
  'if(!navigator.clipboard||!window.isSecureContext){fail();return;}' +
  'navigator.clipboard.writeText(email).then(function(){show(true);},fail);' +
  '});' +
  "document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;document.querySelectorAll('[data-copy-status]').forEach(function(n){n.textContent='';});});" +
  'if(document.documentElement.getAttribute("data-analytics")==="1"){' +
  'var kick=function(){["/_vercel/insights/script.js","/_vercel/speed-insights/script.js"].forEach(function(src){var s=document.createElement("script");s.src=src;s.async=true;document.body.appendChild(s);});};' +
  'if(window.requestIdleCallback)requestIdleCallback(kick,{timeout:3000});else window.setTimeout(kick,1);' +
  '}' +
  '}' +
  'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();' +
  '})();';

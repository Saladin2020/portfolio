/**
 * Filter behavior and production analytics. Menu, scroll spy, and copy stay
 * next to those components. Hero, about, skills, process, contact, and later
 * copy stay server-rendered.
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
  'if(document.documentElement.getAttribute("data-analytics")==="1"){' +
  'var kick=function(){["/_vercel/insights/script.js","/_vercel/speed-insights/script.js"].forEach(function(src){var s=document.createElement("script");s.src=src;s.async=true;document.body.appendChild(s);});};' +
  'if(window.requestIdleCallback)requestIdleCallback(kick,{timeout:3000});else window.setTimeout(kick,1);' +
  '}' +
  '}' +
  'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();' +
  '})();';

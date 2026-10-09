/** Marks the nav link of the section in view with aria-current="true" (wireframes S-0 note 4). */
export function ScrollSpy({ ids }: { ids: string[] }) {
  const list = JSON.stringify(ids);
  const code =
    '(function(){' +
    `var ids=${list};` +
    'function boot(){' +
    'if(!("IntersectionObserver" in window))return;' +
    'var visible={};' +
    'var apply=function(){var current=null;for(var i=0;i<ids.length;i++)if(visible[ids[i]]){current=ids[i];break;}' +
    'document.querySelectorAll("a[data-nav-link]").forEach(function(a){if(a.getAttribute("data-nav-link")===current)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});};' +
    'var io=new IntersectionObserver(function(entries){entries.forEach(function(en){visible[en.target.id]=en.isIntersecting;});apply();},{rootMargin:"-40% 0px -55% 0px"});' +
    'for(var s=0;s<ids.length;s++){var el=document.getElementById(ids[s]);if(el)io.observe(el);}' +
    '}' +
    'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();' +
    '})();';
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

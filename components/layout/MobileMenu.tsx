type Item = { id: string; label: string; href: string };
type Props = { items: Item[]; labels: { open: string; close: string; menu: string; nav: string } };

/**
 * Mobile/tablet menu (< 1030px). Markup matches the previous client menu.
 * Open, focus, Esc, and the lg breakpoint close live in the script below so
 * this file stays a Server Component. ProjectDialogEnhancer is not involved.
 */
const menuScript =
  '(function(){' +
  'var menuBtn=document.querySelector("[data-nav=menu-button]");' +
  'if(!menuBtn||menuBtn.getAttribute("data-menu-wired"))return;' +
  'menuBtn.setAttribute("data-menu-wired","1");' +
  'var sheet=document.getElementById(menuBtn.getAttribute("aria-controls")||"");' +
  'if(!sheet)return;' +
  'var openLabel=menuBtn.getAttribute("data-open-label")||"";' +
  'var closeLabel=menuBtn.getAttribute("data-close-label")||"";' +
  'var setOpen=function(open){menuBtn.setAttribute("aria-expanded",open?"true":"false");menuBtn.setAttribute("aria-label",open?closeLabel:openLabel);};' +
  'menuBtn.addEventListener("click",function(){if(sheet.open)sheet.close();else{sheet.showModal();setOpen(true);var a=sheet.querySelector("a");if(a)a.focus();}});' +
  'sheet.addEventListener("close",function(){setOpen(false);menuBtn.focus();});' +
  'sheet.addEventListener("click",function(e){var t=e.target;if(t===sheet||(t.closest&&t.closest("[data-menu-close]")))sheet.close();});' +
  'var links=sheet.querySelectorAll("a");for(var i=0;i<links.length;i++)links[i].addEventListener("click",function(){sheet.close();});' +
  'var mq=window.matchMedia("(width >= 1030px)");' + // tokens-ignore: mirrors breakpoint.lg for JS
  'mq.addEventListener("change",function(){if(mq.matches&&sheet.open)sheet.close();});' +
  '})();';

export function MobileMenu({ items, labels }: Props) {
  const sheetId = 'mobile-menu';
  return (
    <>
      <button
        type="button"
        className="hidden size-touch items-center justify-center rounded-full bg-light-action-primary-bg text-light-action-primary-text js:inline-flex"
        aria-expanded="false"
        aria-controls={sheetId}
        aria-label={labels.open}
        data-open-label={labels.open}
        data-close-label={labels.close}
        data-nav="menu-button"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog id={sheetId} aria-label={labels.nav} className="menu-sheet fixed inset-x-0 top-0 m-0 w-full max-w-full bg-transparent p-3 backdrop:bg-transparent">
        <div className="mx-auto max-w-nav rounded-panel border border-light-border-subtle bg-light-surface p-3 shadow-high">
          <div className="flex items-center justify-between pb-2">
            <span className="pl-2 type-label text-light-text-secondary">{labels.menu}</span>
            <button
              type="button"
              aria-label={labels.close}
              className="inline-flex size-touch items-center justify-center rounded-full border-2 border-light-action-secondary-border text-light-action-secondary-text"
              data-menu-close
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  data-nav-link={item.id}
                  className="flex min-h-touch items-center rounded-element px-3 type-lead text-light-text-heading no-underline hover:bg-light-muted aria-[current=true]:font-semibold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
      <script dangerouslySetInnerHTML={{ __html: menuScript }} />
    </>
  );
}

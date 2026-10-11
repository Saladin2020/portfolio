import { cx } from './cx';

type Props = {
  email: string;
  label: string;
  copiedLabel: string;
  fallbackLabel: string;
  /** id of the element holding the visible email text (selected in the fallback path). */
  targetId: string;
  scene?: 'light' | 'dark';
  toastMs: number;
};

const copyScript =
  '(function(){' +
  'if(window.__copyEmailWired)return;window.__copyEmailWired=1;' +
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
  '})();';

/** Copy-email button (user-flows §3.2). The address is always visible as text; this only adds a shortcut. */
export function CopyEmailButton({ email, label, copiedLabel, fallbackLabel, targetId, scene = 'light', toastMs }: Props) {
  return (
    <span className="relative inline-flex flex-col items-start gap-1">
      <button
        type="button"
        data-copy-email={email}
        data-copied={copiedLabel}
        data-fallback={fallbackLabel}
        data-copy-target={targetId}
        data-toast={toastMs}
        aria-label={`${label} ${email}`}
        data-cta="contact_copy_email"
        className={cx(
          'motion-hover inline-flex min-h-touch items-center justify-center rounded-full border-2 px-3 py-1 type-label',
          scene === 'light'
            ? 'border-light-action-secondary-border text-light-action-secondary-text hover:bg-light-muted'
            : 'border-dark-action-secondary-border text-dark-action-secondary-text hover:bg-dark-surface',
        )}
      >
        {label}
      </button>
      <span role="status" aria-live="polite" data-copy-status className={cx('type-small', scene === 'light' ? 'text-light-text-secondary' : 'text-dark-text-secondary')} />
      <script dangerouslySetInnerHTML={{ __html: copyScript }} />
    </span>
  );
}

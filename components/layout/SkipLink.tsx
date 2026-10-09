export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="skip-link sr-only z-50 rounded-full bg-light-action-primary-bg type-label text-light-action-primary-text focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}

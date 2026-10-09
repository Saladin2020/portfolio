/** Build a mailto: URL with UTF-8 percent-encoding and CRLF line breaks (user-flows §3.1). */
export const MAILTO_MAX_LENGTH = 1800;

export function buildMailto(to: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  const url = `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
  if (url.length > MAILTO_MAX_LENGTH) {
    // Fall back to subject only rather than ship a URL some clients truncate (K-13).
    return `mailto:${to}?subject=${enc(subject)}`;
  }
  return url;
}

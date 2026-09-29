// Share links carry the sharer's Patient ID (?ref=) so every share is a potential sponsorship.

import { el } from './dom.js';

export function createShare({ brand, referral, ui, track }) {
  function base() {
    if (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)) return location.origin + location.pathname;
    return brand.site?.url || 'https://example.com/';
  }

  /** Absolute share URL. `params` become query params (the app reads them on boot). */
  function url(params = {}, { platform = 'link', hash = '' } = {}) {
    const u = new URL(base());
    u.searchParams.set('ref', referral.patientId());
    for (const [k, v] of Object.entries(params)) if (v != null && v !== '') u.searchParams.set(k, v);
    u.searchParams.set('utm_source', platform);
    u.searchParams.set('utm_medium', 'referral');
    u.searchParams.set('utm_campaign', brand.utm?.campaign || brand.id);
    if (hash) u.hash = hash;
    return u.toString();
  }

  const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const platforms = {
    x: { label: 'X', href: (t, u) => `https://x.com/intent/post?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
    // LinkedIn's share-offsite endpoint takes only a URL, so the post opens empty. On desktop the feed composer
    // takes pre-filled text (undocumented, usually works); phones get share-offsite. Either way the text is on
    // the clipboard first, so it can be pasted if LinkedIn drops it.
    linkedin: {
      label: 'LinkedIn',
      copyFirst: true,
      href: (t, u) =>
        touch()
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`
          : `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${t}\n\n${u}`)}`,
    },
    reddit: { label: 'Reddit', href: (t, u) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
    bluesky: { label: 'Bluesky', href: (t, u) => `https://bsky.app/intent/compose?text=${encodeURIComponent(t + ' ' + u)}` },
    hn: { label: 'HN', href: (t, u) => `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}` },
    email: { label: 'Email', href: (t, u) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(t + '\n\n' + u)}` },
  };

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = el('textarea', { style: { position: 'fixed', opacity: '0' } }, text);
      document.body.append(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  /**
   * Standard share block.
   *   panel({ text, params, kind, title, hint, platforms: ['x','linkedin','reddit','copy'] })
   * `text` is what gets posted. `kind` labels the share for analytics ("diagnosis", "idle", ...).
   */
  function panel({ text, params = {}, kind = 'generic', title = 'Spread the word', hint, platforms: which } = {}) {
    const list = [...(which || ['copy', 'x', 'linkedin', 'reddit', 'bluesky', 'email'])];
    const preview = el('pre.share__preview', text);
    const buttons = el('div.share__buttons');
    if (navigator.share && !list.includes('native')) list.unshift('native');
    for (const p of list) {
      if (p === 'native') {
        buttons.append(
          el('button.btn.btn--cure.btn--sm', {
            type: 'button',
            text: 'Share…',
            onclick: async () => {
              try {
                await navigator.share({ title: brand.site?.name, text, url: url(params, { platform: 'native' }) });
                referral.recordShare('native', kind);
              } catch {
                /* dismissed */
              }
            },
          }),
        );
      } else if (p === 'copy') {
        buttons.append(
          el('button.btn.btn--vital.btn--sm', {
            type: 'button',
            text: 'Copy text + link',
            onclick: async () => {
              const ok = await copy(`${text}\n${url(params, { platform: 'copy' })}`);
              ui?.toast(ok ? 'Copied. Paste it somewhere your coworkers will see it.' : 'Copy failed. Your clipboard may be held hostage.');
              if (ok) referral.recordShare('copy', kind);
            },
          }),
        );
      } else if (platforms[p]) {
        const link = url(params, { platform: p });
        buttons.append(
          el('a.btn.btn--ghost.btn--sm', {
            href: platforms[p].href(text, link),
            target: '_blank',
            rel: 'noopener noreferrer',
            text: platforms[p].label,
            onclick: () => {
              referral.recordShare(p, kind);
              if (!platforms[p].copyFirst) return;
              // Runs inside the click, so the clipboard write is allowed; the link still opens normally.
              copy(`${text}\n\n${link}`).then((ok) => ok && ui?.toast(`Post text copied. If ${platforms[p].label} opens an empty post, paste it in.`));
            },
          }),
        );
      }
    }
    return el(
      'div.share',
      el('div.share__head', el('span.kicker', title), el('span.share__id', 'Your sponsor code: ', el('b', referral.patientId()))),
      preview,
      buttons,
      hint !== false && el('p.share__hint', hint || 'Every link carries your sponsor code. When a friend gets diagnosed through it, you earn a chip.'),
    );
  }

  return { url, copy, panel, platforms };
}

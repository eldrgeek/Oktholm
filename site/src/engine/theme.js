// Applies brand.theme CSS variable overrides to :root.
export function applyTheme(brand) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(brand.theme || {})) {
    if (k.startsWith('--')) root.style.setProperty(k, v);
  }
}

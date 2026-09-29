// End-to-end checks for the admission, Intake, the captor, the records page and the eggs.
//   npm run build && node tests/experience.mjs            (production build; captor checks need a dev build)
//   OUTDIR=dist-dev node build.mjs --dev && node tests/experience.mjs dist-dev/index.html
import { launch, open } from './pw.mjs';
import path from 'node:path';
import { existsSync } from 'node:fs';

const target = path.resolve(process.argv[2] || 'dist/index.html');
if (!existsSync(target)) {
  console.error(`${target} missing: build first`);
  process.exit(1);
}
const browser = await launch();
let failures = 0;
const check = (ok, label, extra = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${extra ? ' — ' + extra : ''}`);
};
const noErrors = (page, label) => check(page.__errors.length === 0, `${label}: no console errors`, page.__errors.join(' | '));

for (const [width, height] of [
  [1280, 800],
  [390, 844],
]) {
  const tag = `${width}px`;

  // 1. Admission: fresh visitor on the bare home page.
  let page = await open(browser, target, { width, height });
  const overlay = await page.waitForSelector('.adm-overlay', { timeout: 3000 }).catch(() => null);
  check(Boolean(overlay), `${tag} admission mounts on a first visit`);
  if (overlay) {
    await page.keyboard.press('Escape');
    const gone = await page.waitForSelector('.adm-overlay', { state: 'detached', timeout: 4000 }).then(() => true).catch(() => false);
    check(gone, `${tag} Esc skips the admission`);
    const tv = await page.waitForSelector('.channel', { timeout: 4000 }).then(() => true).catch(() => false);
    check(tv, `${tag} the lobby TV starts after the admission`);
    // Every load of the bare home page admits again; a returning visitor gets the next scene.
    await page.reload();
    const again = await page.waitForSelector('.adm-overlay', { timeout: 3000 }).then(() => true).catch(() => false);
    check(again, `${tag} a reload replays the admission`);
  }
  noErrors(page, `${tag} admission`);
  await page.close();

  // 2. Intake, the tour, commands, distress.
  page = await open(browser, target + '?admit=0', { width, height });
  const replies = await page.waitForSelector('.hero__intake .in-replies button', { timeout: 12000 }).then(() => true).catch(() => false);
  check(replies, `${tag} Intake greets in the hero with quick replies`);
  const tourBtn = page.locator('.hero__intake .in-replies button', { hasText: /tour/i }).first();
  if (await tourBtn.count()) {
    await tourBtn.click();
    const card = await page.waitForSelector('.in-tour', { timeout: 6000 }).then(() => true).catch(() => false);
    check(card, `${tag} the tour starts`);
    await page.keyboard.press('Escape');
    const ended = await page.waitForSelector('.in-tour', { state: 'detached', timeout: 4000 }).then(() => true).catch(() => false);
    check(ended, `${tag} Esc ends the tour`);
  } else check(false, `${tag} tour reply present`);
  const input = page.locator('.hero__intake .in-input');
  if (await input.count()) {
    await input.fill('sudo make me a sandwich');
    await input.press('Enter');
    const sudo = await page.waitForFunction(() => /sudoers/.test(document.querySelector('.hero__intake')?.innerText || ''), null, { timeout: 5000 }).then(() => true).catch(() => false);
    check(sudo, `${tag} "sudo" gets the sudoers lecture`);
    await input.fill('honestly I am not ok');
    await input.press('Enter');
    const help = await page.waitForFunction(() => /988/.test(document.querySelector('.hero__intake')?.innerText || ''), null, { timeout: 5000 }).then(() => true).catch(() => false);
    check(help, `${tag} distress breaks character with 988`);
  } else check(false, `${tag} Intake input present`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(overflow <= 0, `${tag} lobby has no horizontal overflow`, overflow > 0 ? `${overflow}px` : '');
  noErrors(page, `${tag} Intake`);

  // 3. Records page shows the Patient ID stored in this browser.
  await page.evaluate(() => (location.hash = '#/chart'));
  const pid = await page.evaluate(() => document.querySelector('.wristband span:last-child')?.textContent || '');
  const shown = await page.waitForFunction((pid) => (document.querySelector('.chart__pre')?.textContent || '').includes(pid), pid, { timeout: 4000 }).then(() => true).catch(() => false);
  check(Boolean(pid) && shown, `${tag} records page lists the stored Patient ID`);

  // 4. Konami code.
  for (const k of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) await page.keyboard.press(k);
  check(await page.waitForSelector('.egg-stamp', { timeout: 2000 }).then(() => true).catch(() => false), `${tag} Konami code stamps`);
  noErrors(page, `${tag} records + eggs`);
  await page.close();

  // 5. Captor (dev builds only: ?captor=fast shortens the delays).
  page = await open(browser, target + '?admit=0&captor=fast#/cure', { width, height });
  const dev = await page.evaluate(() => Boolean(window.__captor));
  if (dev) {
    const card = await page.waitForSelector('.cp-card', { timeout: 20000 }).then(() => true).catch(() => false);
    check(card, `${tag} the captor texts on the Cure page`);
    noErrors(page, `${tag} captor`);
  } else console.log(`skip ${tag} captor (production build)`);
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nall clear');
process.exit(failures ? 1 : 0);

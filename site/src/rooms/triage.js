// Triage: 12-question intake -> "lab work" -> diagnosis certificate (DOM + 1200x630 PNG), wristband,
// share (carries the sharer's sponsor code), prescription. Completing triage is the qualifying
// action that credits whoever referred this visitor.

import { el, disposer, fill, sleep } from '../engine/dom.js';
import { ensureFonts, downloadCanvas, roundRect, drawBarcode, wrapLines } from '../engine/canvas.js';

export function scoreTriage(triage, answers) {
  const traits = {};
  let total = 0;
  answers.forEach((ai, qi) => {
    const a = triage.questions[qi]?.a[ai];
    if (!a) return;
    total += a.s;
    if (a.trait) traits[a.trait] = (traits[a.trait] || 0) + a.s + 1;
  });
  const stage = triage.stages.find((st) => total >= st.min) || triage.stages[triage.stages.length - 1];
  const top = Object.entries(traits).sort((x, y) => y[1] - x[1])[0];
  const subtypeId = top && top[1] >= 3 ? top[0] : triage.defaultSubtype;
  return { total, stage, subtypeId, subtype: triage.subtypes[subtypeId], traits };
}

export function renderTriage(root, s, route) {
  const d = disposer();
  const triage = s.brand.content?.triage;
  const store = s.store.scope('triage');
  const wrap = el('div.wrap.triage');
  root.append(wrap);
  if (!triage) {
    wrap.append(el('p', 'Triage is closed.'));
    return;
  }
  let answers = [];

  function screen(...nodes) {
    wrap.innerHTML = '';
    wrap.append(...nodes);
    wrap.scrollIntoView?.({ block: 'start' });
  }

  function intro() {
    const last = store.get('last');
    const fromFriend = s.boot?.dx || s.referral.referredBy();
    screen(
      el(
        'div.triage__intro',
        el('div.kicker', triage.intro.kicker),
        el('h1.page-title', triage.intro.title),
        fromFriend && el('p.triage__friend', '🩺 Someone who cares about you sent you here. Finishing triage earns you both a recovery chip.'),
        el('p.section__body', triage.intro.body),
        el(
          'div.row',
          { style: { marginTop: '18px' } },
          el('button.btn.btn--vital.btn--lg', { type: 'button', text: triage.intro.start, onclick: () => question(0) }),
          last && el('button.btn.btn--ghost.btn--lg', { type: 'button', text: 'View my last diagnosis', onclick: () => diagnosis(last.answers, false) }),
        ),
        el('div.triage__vitals', el('span', `${triage.questions.length} questions`), el('span', '≈ 2 minutes'), el('span', 'No email required'), el('span', 'HIPAA-adjacent*')),
        el('p.faint', { style: { fontSize: '12px', marginTop: '8px' } }, '*Not actually HIPAA anything. Nothing you answer leaves your browser.'),
      ),
    );
    s.track('triage_intro');
  }

  function question(i) {
    if (i === 0) {
      answers = [];
      s.track('triage_start');
    }
    const q = triage.questions[i];
    const pct = Math.round((i / triage.questions.length) * 100);
    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.a.length) choose(n - 1);
      if (e.key === 'Backspace' && i > 0) question(i - 1);
    };
    document.addEventListener('keydown', onKey);
    const cleanupKey = () => document.removeEventListener('keydown', onKey);
    const choose = (ai) => {
      cleanupKey();
      s.sfx.click();
      answers[i] = ai;
      if (i + 1 < triage.questions.length) question(i + 1);
      else labWork();
    };
    d(cleanupKey);
    screen(
      el(
        'div.triage__card.card.card--raised',
        el('div.triage__progress', el('div.triage__bar', el('span', { style: { width: pct + '%' } })), el('span.mono.faint', `Q${i + 1}/${triage.questions.length}`)),
        el('h2.triage__q', q.q),
        el(
          'div.triage__answers',
          q.a.map((a, ai) =>
            el('button.triage__answer', { type: 'button', onclick: () => choose(ai), class: answers[i] === ai ? 'is-picked' : '' }, el('span.kbd', String(ai + 1)), el('span', a.t)),
          ),
        ),
        el(
          'div.row',
          { style: { justifyContent: 'space-between', marginTop: '14px' } },
          i > 0 ? el('button.btn.btn--ghost.btn--sm', { type: 'button', text: '← Back', onclick: () => (cleanupKey(), question(i - 1)) }) : el('span'),
          el('span.faint.mono', { style: { fontSize: '12px' } }, 'Keys 1–4 to answer'),
        ),
      ),
    );
  }

  async function labWork() {
    const steps = ['Cross-referencing HR roster…', 'Counting your AD groups… (still counting)', 'Reading your renewal quote… (sedating reader)', 'Contacting your identity provider… (on hold)', 'Consulting the DSM-IT-5…'];
    const list = el('ul.lab__steps');
    screen(el('div.lab.card.card--raised', el('div.kicker', 'Lab work in progress'), el('h2.display', { style: { fontSize: 'clamp(30px,5vw,48px)' } }, 'Analyzing sample'), el('div.lab__ecg'), list));
    for (const st of steps) {
      const li = el('li', st);
      list.append(li);
      s.sfx.ecg();
      await sleep(430);
      li.classList.add('is-done');
    }
    await sleep(300);
    store.set('last', { answers, at: Date.now() });
    diagnosis(answers, true);
  }

  function diagnosis(ans, fresh) {
    const r = scoreTriage(triage, ans);
    const facts = s.brand.sponsor?.facts || {};
    const pid = s.referral.patientId();
    const date = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    const worst = ans
      .map((ai, qi) => ({ q: triage.questions[qi], a: triage.questions[qi]?.a[ai] }))
      .filter((x) => x.a && x.a.s >= 2)
      .sort((x, y) => y.a.s - x.a.s)
      .slice(0, 3);
    const stamp = el('div.stamp.stamp--diagnosed.cert__stamp', 'Diagnosed');
    const cert = el(
      'article.cert.paper',
      el('div.cert__head', el('div', el('div.cert__org', s.brand.site?.hospital), el('div.cert__dept', 'Department of Identity Medicine · Night Shift')), el('div.cert__rx', '℞')),
      el('div.cert__row', el('span', `Patient ${pid}`), el('span', date)),
      el('div.cert__label', 'Diagnosis'),
      el('h2.cert__stage', r.stage.name),
      el('div.cert__stagecode', `${r.stage.stage} · score ${r.total}/36`),
      el('div.cert__subtype', el('span.cert__emoji', r.subtype.emoji), el('div', el('div.cert__label', 'Subtype'), el('div.cert__subname', r.subtype.name))),
      el('p.cert__blurb', r.subtype.blurb),
      el('div.cert__label', 'Prognosis'),
      el('p.cert__text', r.stage.prognosis),
      worst.length && el('div.cert__label', 'Symptoms observed'),
      worst.length && el('ul.cert__list', worst.map((w) => el('li', w.a.t))),
      el('div.cert__label', 'Prescription'),
      el('ul.cert__list', (r.subtype.treat || []).map((k) => facts[k]).filter(Boolean).map((t) => el('li', t))),
      el('div.cert__sig', el('div', el('div.cert__signature', 'D. Provision'), el('div.cert__label', 'Attending, Night Shift')), el('div.cert__barcode')),
      stamp,
    );
    const shareText = fill(triage.shareTemplate, { stageName: r.stage.name, stage: r.stage.stage, subtype: r.subtype.name, emoji: r.subtype.emoji });
    const pngBtn = el('button.btn.btn--paper', { type: 'button', text: 'Download certificate (PNG)' });
    pngBtn.addEventListener('click', async () => {
      pngBtn.disabled = true;
      const canvas = await renderCertificatePng({ brand: s.brand, r, pid, date });
      await downloadCanvas(canvas, `oktholm-diagnosis-${pid}.png`);
      pngBtn.disabled = false;
      s.track('certificate_download', { stage: r.stage.stage, subtype: r.subtypeId });
    });
    screen(
      el(
        'div.dx',
        el(
          'div.dx__left',
          el('div.kicker.kicker--alarm', fresh ? 'Results are in' : 'Your last diagnosis'),
          el('h1.page-title', { style: { fontSize: 'clamp(40px,6.5vw,76px)' } }, `${r.stage.stage}.`),
          el('p.section__body', `${r.subtype.emoji} ${r.subtype.name}. ${r.stage.prognosis}`),
          el(
            'div.wristband.dx__wristband',
            el('span.wristband__dot'),
            el('span', `${pid} · ${r.stage.stage.toUpperCase()} · ${r.subtype.name.replace(/^The /, '').toUpperCase()}`),
          ),
          el('div.row', { style: { margin: '18px 0' } }, pngBtn, el('a.btn.btn--amber', { href: '#/intervention', text: 'Stage an intervention for a coworker' }), el('button.btn.btn--ghost', { type: 'button', text: 'Retake', onclick: () => question(0) })),
          s.share.panel({ text: shareText, params: { dx: `${r.stage.stage}|${r.subtypeId}` }, kind: 'diagnosis', title: 'Tell your people' }),
          el('div', { style: { marginTop: '18px' } }, s.cta.card({ kicker: 'Prescription', title: `Treatment for ${r.subtype.name.replace(/^The /, '')}s`, body: (r.subtype.treat || []).map((k) => facts[k]).filter(Boolean).join(' '), label: s.brand.sponsor?.ctaLabel, content: `dx-${r.subtypeId}`, secondary: { kind: 'demo', label: 'Book a treatment session' } })),
        ),
        el('div.dx__right', cert),
      ),
    );
    requestAnimationFrame(() => stamp.classList.add('is-slam'));
    s.sfx.stamp();
    // Decorative barcode on the DOM certificate.
    const bc = cert.querySelector('.cert__barcode');
    const c = el('canvas', { width: 220, height: 44 });
    drawBarcode(c.getContext('2d'), pid, 0, 0, 220, 44, '#16181d');
    bc.append(c, el('div.cert__label', pid));
    if (fresh) {
      s.referral.grantChip('admitted');
      s.referral.qualify('diagnosis');
      s.ticker?.push(`Patient ${pid} diagnosed: ${r.stage.name}. Thoughts, prayers and budget requested.`);
      s.track('triage_complete', { stage: r.stage.stage, subtype: r.subtypeId, score: r.total });
    }
  }

  if (route?.query?.q === 'start') question(0);
  else intro();
  return () => d.run();
}

/** 1200x630 social card of the diagnosis. Drawn on canvas (no DOM screenshots). */
export async function renderCertificatePng({ brand, r, pid, date }) {
  await ensureFonts(['40px Anton', '700 20px "IBM Plex Mono"', '400 22px "Special Elite"', '800 28px "Plus Jakarta Sans"', '400 30px "Permanent Marker"']);
  const W = 1200;
  const H = 630;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  // Night-shift background with ECG grid
  g.fillStyle = '#070a0f';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(54,245,154,0.07)';
  for (let x = 0; x < W; x += 20) g.strokeRect(x, 0, 0.5, H);
  for (let y = 0; y < H; y += 20) g.strokeRect(0, y, W, 0.5);
  // Paper certificate
  g.save();
  g.translate(56, 44);
  g.rotate(-0.012);
  g.fillStyle = '#f4efe4';
  roundRect(g, 0, 0, 720, 542, 14);
  g.fill();
  g.fillStyle = '#16181d';
  g.font = '400 30px Anton';
  g.fillText((brand.site?.hospital || '').toUpperCase(), 36, 58);
  g.font = '700 14px "IBM Plex Mono"';
  g.fillStyle = '#545a66';
  g.fillText('DEPARTMENT OF IDENTITY MEDICINE · NIGHT SHIFT', 36, 84);
  g.fillRect(36, 100, 648, 3);
  g.fillText(`PATIENT ${pid}`, 36, 130);
  g.textAlign = 'right';
  g.fillText(date.toUpperCase(), 684, 130);
  g.textAlign = 'left';
  g.fillStyle = '#0b6b3f';
  g.fillText('DIAGNOSIS', 36, 172);
  g.fillStyle = '#16181d';
  g.font = '400 58px Anton';
  const stageLines = wrapLines(g, r.stage.name.toUpperCase(), 640);
  let y = 232;
  for (const line of stageLines.slice(0, 2)) {
    g.fillText(line, 36, y);
    y += 62;
  }
  g.font = '700 16px "IBM Plex Mono"';
  g.fillStyle = '#545a66';
  g.fillText(`${r.stage.stage.toUpperCase()} · SCORE ${r.total}/36`, 36, y - 20);
  y += 22;
  g.font = '48px serif';
  g.fillText(r.subtype.emoji, 36, y + 34);
  g.fillStyle = '#0b6b3f';
  g.font = '700 14px "IBM Plex Mono"';
  g.fillText('SUBTYPE', 102, y + 8);
  g.fillStyle = '#16181d';
  g.font = '800 30px "Plus Jakarta Sans"';
  g.fillText(r.subtype.name, 102, y + 42);
  g.font = '400 19px "Special Elite"';
  g.fillStyle = '#2a2d33';
  y += 84;
  for (const line of wrapLines(g, r.subtype.blurb, 640).slice(0, 3)) {
    g.fillText(line, 36, y);
    y += 26;
  }
  drawBarcode(g, pid, 36, 480, 220, 36, '#16181d');
  g.font = '400 30px "Permanent Marker"';
  g.fillStyle = '#1c3fd1';
  g.fillText('D. Provision', 470, 505);
  g.restore();
  // Stamp
  g.save();
  g.translate(480, 262);
  g.rotate(-0.2);
  g.strokeStyle = 'rgba(179,0,27,0.85)';
  g.lineWidth = 6;
  roundRect(g, 0, 0, 250, 76, 10);
  g.stroke();
  g.lineWidth = 2;
  roundRect(g, 8, 8, 234, 60, 8);
  g.stroke();
  g.fillStyle = 'rgba(179,0,27,0.85)';
  g.font = '400 44px Anton';
  g.textAlign = 'center';
  g.fillText('DIAGNOSED', 125, 56);
  g.restore();
  // Right column
  g.fillStyle = '#36f59a';
  g.font = '700 15px "IBM Plex Mono"';
  g.fillText('● LIVE FROM ' + (brand.site?.hospital || '').toUpperCase(), 820, 90);
  g.fillStyle = '#e9f0f7';
  g.font = '400 54px Anton';
  let ry = 170;
  for (const line of ['IT’S NOT ME.', 'IT’S MY', 'IDENTITY', 'PROVIDER.']) {
    g.fillText(line, 820, ry);
    ry += 60;
  }
  g.fillStyle = '#a3b3c5';
  g.font = '600 18px "Plus Jakarta Sans"';
  g.fillText('Get screened in two minutes:', 820, 450);
  g.fillStyle = '#36f59a';
  g.font = '700 20px "IBM Plex Mono"';
  g.fillText((brand.site?.url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''), 820, 480);
  g.fillStyle = '#6b86ff';
  g.font = '600 15px "Plus Jakarta Sans"';
  g.fillText(`Treatment sponsored by ${brand.sponsor?.name || ''}`, 820, 560);
  // ECG line
  g.strokeStyle = '#36f59a';
  g.lineWidth = 3;
  g.beginPath();
  const base = 600;
  g.moveTo(800, base);
  for (let x = 800; x < 1180; x += 76) {
    g.lineTo(x + 20, base);
    g.lineTo(x + 26, base - 6);
    g.lineTo(x + 32, base + 6);
    g.lineTo(x + 38, base - 28);
    g.lineTo(x + 44, base + 14);
    g.lineTo(x + 50, base);
    g.lineTo(x + 76, base);
  }
  g.stroke();
  return c;
}

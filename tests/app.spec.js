const { test, expect } = require('@playwright/test');
const { watchErrors, go, currentQuestion } = require('./helpers');

const TRACKS = ['saa', 'sap'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('home lists both tracks and every tool', async ({ page }) => {
  const check = watchErrors(page);
  await expect(page.locator('.track-card')).toHaveCount(2);
  const toolCount = await page.evaluate(() => window.Tools.list.length);
  await expect(page.locator('.tool-card')).toHaveCount(toolCount);
  check();
});

test('all lesson, question and flashcard HTML is well formed', async ({ page }) => {
  const problems = await page.evaluate(() => {
    const out = [];
    const count = list => list.reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {});
    const check = (label, html) => {
      const src = count((html.match(/<([a-z][a-z0-9]*)\b/gi) || []).map(t => t.slice(1).toLowerCase()));
      const d = document.createElement('div');
      d.innerHTML = html;
      const dom = count([...d.querySelectorAll('*')].map(e => e.tagName.toLowerCase()));
      for (const t of new Set([...Object.keys(src), ...Object.keys(dom)])) {
        if ((src[t] || 0) !== (dom[t] || 0)) out.push(`${label}: <${t}> ${src[t] || 0} in source, ${dom[t] || 0} parsed`);
      }
    };
    for (const [k, t] of Object.entries(window.TRACKS)) {
      t.domains.forEach(d => d.lessons.forEach(l => {
        l.sections.forEach((s, i) => check(`${k}/${l.id}#${i}`, s.html));
        [...l.keyPoints, ...l.examTips].forEach((x, i) => check(`${k}/${l.id}/note${i}`, x));
      }));
      t.questions.forEach(q => [q.question, q.explanation, ...q.options].forEach((x, i) => check(`${k}/${q.id}/${i}`, x)));
      t.flashcards.forEach((c, i) => [c.front, c.back].forEach(x => check(`${k}/card${i}`, x)));
    }
    return out;
  });
  expect(problems).toEqual([]);
});

for (const track of TRACKS) {
  test(`${track}: every lesson renders and can be completed`, async ({ page }) => {
    const check = watchErrors(page);
    const lessons = await page.evaluate(t => window.TRACKS[t].domains.flatMap(d => d.lessons.map(l => ({ id: l.id, title: l.title, sections: l.sections.length }))), track);
    for (const l of lessons) {
      await go(page, `#/${track}/lesson/${l.id}`);
      await expect(page.locator('main h1')).toHaveText(l.title);
      await expect(page.locator('.prose h2')).toHaveCount(l.sections);
    }
    await go(page, `#/${track}/lesson/${lessons[0].id}`);
    await page.click('#doneBtn');
    await expect(page).toHaveURL(new RegExp(`lesson/${lessons[1].id}$`));
    await go(page, `#/${track}`);
    await expect(page.locator('.check.done')).toHaveCount(1);
    check();
  });

  test(`${track}: practice grades every question correctly`, async ({ page }) => {
    const check = watchErrors(page);
    const total = await page.evaluate(t => window.TRACKS[t].questions.length, track);
    await go(page, `#/${track}/practice?domain=all&filter=all`);
    for (let i = 0; i < total; i++) {
      const q = await currentQuestion(page, track);
      expect(q, 'question on screen should exist in the data').toBeTruthy();
      // Answer every third question wrong to exercise both paths.
      const wrong = i % 3 === 0;
      // A wrong pick must still select the required number of options, so pad with correct ones.
      const wrongOpts = [...Array(q.options.length).keys()].filter(x => !q.answer.includes(x));
      const picks = wrong ? [...wrongOpts, ...q.answer].slice(0, q.answer.length) : q.answer;
      for (const p of picks) await page.locator('.opt').nth(p).click();
      if (q.multi) await page.click('#checkBtn');
      await expect(page.locator('.explain')).toHaveClass(wrong ? /bad/ : /ok/);
      const marked = await page.locator('.opt.correct').evaluateAll(els => els.map(e => +e.dataset.i).sort());
      expect(marked).toEqual([...q.answer].sort());
      await page.click('#nextBtn');
    }
    await expect(page.locator('main')).toContainText('Set complete');
    await go(page, `#/${track}/practice?domain=all&filter=missed`);
    await expect(page.locator('.q-meta .pill').first()).toContainText(`of ${Math.ceil(total / 3)}`);
    check();
  });

  test(`${track}: mock exam scores, flags and reviews`, async ({ page }) => {
    const check = watchErrors(page);
    await go(page, `#/${track}/exam`);
    await page.locator('[data-k="0"]').click();
    let expected = 0;
    for (let i = 0; i < 10; i++) {
      const q = await currentQuestion(page, track);
      if (i % 2 === 0) { for (const p of q.answer) await page.locator('.opt').nth(p).click(); expected++; }
      if (i === 1) await page.click('#flagBtn');
      if (i < 9) await page.click('#nextBtn');
    }
    await expect(page.locator('.qnav button').nth(1)).toHaveClass(/flagged/);
    page.once('dialog', d => d.accept());
    await page.click('#endBtn');
    await expect(page.locator('main')).toContainText(`${expected} of 10 correct`);
    await expect(page.locator('.bar-row')).toHaveCount(4);
    await page.click('[data-r="all"]');
    await expect(page.locator('.stack > .card')).toHaveCount(10);
    await go(page, '#/progress');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    check();
  });

  test(`${track}: exam auto-submits when time runs out`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/#/${track}/exam`);
    await page.locator('[data-k="0"]').click();
    await page.clock.runFor(60 * 60 * 1000);
    await expect(page.locator('main')).toContainText('Exam results');
  });

  test(`${track}: flashcards flip and move between boxes`, async ({ page }) => {
    const check = watchErrors(page);
    await go(page, `#/${track}/flashcards`);
    await page.keyboard.press('Space');
    await expect(page.locator('#flash')).toHaveClass(/flipped/);
    await page.keyboard.press('3');
    await expect(page.locator('main')).toContainText('1 reviewed');
    await expect(page.locator('.boxes')).toContainText('Box 2: 1');
    await page.click('#flipBtn');
    await page.click('[data-g="again"]');
    await expect(page.locator('main')).toContainText('2 reviewed');
    check();
  });
}

test('practice keyboard shortcuts answer and advance', async ({ page }) => {
  await go(page, '#/saa/practice?domain=all&filter=all');
  while (await page.locator('#checkBtn').count()) await page.click('#skipBtn');
  const stem = await page.locator('.q-stem').textContent();
  await page.keyboard.press('b');
  await expect(page.locator('.explain')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.q-stem')).not.toHaveText(stem);
});

test('progress export, import and reset', async ({ page }) => {
  await go(page, '#/saa/practice?domain=all&filter=all');
  await page.locator('.opt').first().click();
  if (await page.locator('#checkBtn').count()) { await page.locator('.opt').nth(1).click(); await page.click('#checkBtn'); }
  await go(page, '#/progress');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#expBtn')]);
  const path = await download.path();
  page.once('dialog', d => d.accept());
  await page.click('#resetBtn');
  expect(await page.evaluate(() => Object.keys(window.Store.state.q).length)).toBe(0);
  await page.setInputFiles('#impFile', path);
  await expect.poll(() => page.evaluate(() => Object.keys(window.Store.state.q).length)).toBe(1);
});

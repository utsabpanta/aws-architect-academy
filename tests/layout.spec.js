const { test, expect } = require('@playwright/test');
const { go } = require('./helpers');

// No page should scroll sideways, on desktop or phone.
test('no page overflows horizontally', async ({ page }) => {
  await page.goto('/');
  const routes = await page.evaluate(() => {
    const r = ['#/', '#/progress', '#/tools'];
    for (const [k, t] of Object.entries(window.TRACKS)) {
      r.push(`#/${k}`, `#/${k}/practice`, `#/${k}/exam`, `#/${k}/flashcards`);
      t.domains.forEach(d => d.lessons.forEach(l => r.push(`#/${k}/lesson/${l.id}`)));
    }
    window.Tools.list.forEach(t => r.push(`#/tools/${t.id}`));
    return r;
  });
  const overflowing = [];
  for (const r of routes) {
    await go(page, r);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (wide) overflowing.push(r);
  }
  expect(overflowing).toEqual([]);
});

test('navigation menu opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'menu button only shows on small screens');
  await page.goto('/');
  await page.click('#menuBtn');
  await expect(page.locator('body')).toHaveClass(/nav-open/);
  await page.click('#sidebar a[href="#/tools/dr"]');
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
  await expect(page.locator('main h1')).toContainText('DR strategy explorer');
});

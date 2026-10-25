const { expect } = require('@playwright/test');

// Fails the test on any uncaught page error or console error.
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

// Navigates within the single-page app and waits for the router to render.
async function go(page, hash) {
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(h => location.hash === h, hash);
}

// Looks up the question currently shown, using its stem text.
async function currentQuestion(page, track) {
  return page.evaluate(t => {
    const stem = document.querySelector('.q-stem').textContent.trim().slice(0, 80);
    return window.TRACKS[t].questions.find(q => q.question.replace(/<[^>]+>/g, '').trim().slice(0, 80) === stem);
  }, track);
}

module.exports = { watchErrors, go, currentQuestion };

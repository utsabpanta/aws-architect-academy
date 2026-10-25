#!/usr/bin/env node
// Checks every track data file for schema mistakes before deploy.
// Usage: node scripts/validate.js
const path = require('path');
global.window = {};
for (const f of ['saa.js', 'sap.js']) require(path.join(__dirname, '..', 'data', f));

let errors = 0;
const fail = msg => { errors++; console.error('✗ ' + msg); };

for (const [key, t] of Object.entries(window.TRACKS)) {
  const domainIds = new Set(t.domains.map(d => d.id));
  const lessonIds = new Set();
  let weight = 0;
  for (const d of t.domains) {
    weight += d.weight;
    for (const l of d.lessons) {
      if (lessonIds.has(l.id)) fail(`${key}: duplicate lesson id ${l.id}`);
      lessonIds.add(l.id);
      if (!l.sections || !l.sections.length) fail(`${key}: lesson ${l.id} has no sections`);
    }
  }
  if (weight !== 100) fail(`${key}: domain weights sum to ${weight}, expected 100`);

  const qIds = new Set();
  for (const q of t.questions) {
    if (qIds.has(q.id)) fail(`${key}: duplicate question id ${q.id}`);
    qIds.add(q.id);
    if (!domainIds.has(q.domain)) fail(`${key}: ${q.id} has unknown domain ${q.domain}`);
    if (q.lesson && !lessonIds.has(q.lesson)) fail(`${key}: ${q.id} references unknown lesson ${q.lesson}`);
    if (!Array.isArray(q.answer) || !q.answer.length) fail(`${key}: ${q.id} has no answer`);
    else if (q.answer.some(a => a < 0 || a >= q.options.length)) fail(`${key}: ${q.id} answer index out of range`);
    if (q.multi && q.answer.length < 2) fail(`${key}: ${q.id} is multi but has <2 answers`);
    if (!q.multi && q.answer.length !== 1) fail(`${key}: ${q.id} is single but has ${q.answer.length} answers`);
    if (!q.explanation) fail(`${key}: ${q.id} has no explanation`);
  }
  for (const c of t.flashcards) if (!domainIds.has(c.domain)) fail(`${key}: flashcard "${c.front}" has unknown domain`);

  console.log(`✓ ${t.code}: ${t.domains.length} domains, ${lessonIds.size} lessons, ${t.questions.length} questions, ${t.flashcards.length} flashcards`);
}

if (errors) { console.error(`\n${errors} problem(s) found.`); process.exit(1); }

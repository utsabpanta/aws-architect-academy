/* AWS Architect Academy — hash-routed single page app. No build step. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const app = $('#app');
  const TRACKS = window.TRACKS || {};
  const TRACK_ORDER = ['saa', 'sap'].filter(k => TRACKS[k] && Array.isArray(TRACKS[k].domains));
  TRACK_ORDER.forEach(k => { TRACKS[k].questions = TRACKS[k].questions || []; TRACKS[k].flashcards = TRACKS[k].flashcards || []; });
  const LETTERS = 'ABCDEFGH';

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  // Each view may register a cleanup (timers, key handlers) that runs on navigation.
  let cleanup = null;
  const onLeave = fn => { cleanup = fn; };

  // ---------- Helpers over track data ----------
  const allLessons = t => t.domains.flatMap(d => d.lessons.map(l => Object.assign({ domain: d.id }, l)));
  const domainName = (t, id) => (t.domains.find(d => d.id === id) || {}).name || id;
  function trackProgress(t) {
    const lessons = allLessons(t);
    const done = lessons.filter(l => Store.isLessonDone(l.id)).length;
    const attempted = t.questions.filter(q => Store.questionStat(q.id));
    const correctLast = attempted.filter(q => Store.questionStat(q.id).last).length;
    return { lessons: lessons.length, done, attempted: attempted.length, correctLast, total: t.questions.length };
  }

  // ---------- Sidebar ----------
  function renderSidebar(path) {
    // `also` is an extra path prefix that should highlight the link (e.g. lessons under a track).
    const link = (href, ico, label, also) => {
      const active = path === href.slice(1) || (also && path.startsWith(also));
      return `<a href="${href}" class="${active ? 'active' : ''}"><span class="ico">${ico}</span>${label}</a>`;
    };
    let html = link('#/', '⌂', 'Home');
    TRACK_ORDER.forEach(k => {
      const t = TRACKS[k];
      html += `<h4>${esc(t.code)}</h4>` +
        link(`#/${k}`, '📘', 'Lessons', `/${k}/lesson/`) +
        link(`#/${k}/practice`, '✎', 'Practice questions') +
        link(`#/${k}/exam`, '⏱', 'Exam simulator') +
        link(`#/${k}/flashcards`, '🃏', 'Flashcards');
    });
    html += `<h4>Interactive tools</h4>`;
    window.Tools.list.forEach(tool => { html += link(`#/tools/${tool.id}`, tool.icon, tool.name); });
    html += `<h4>You</h4>` + link('#/progress', '📈', 'My progress');
    $('#sidebar').innerHTML = html;
  }

  // ---------- Router ----------
  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [p, qs] = raw.split('?');
    const parts = p.split('/').filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    return { path: '/' + parts.join('/'), parts, query };
  }

  function route() {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    document.body.classList.remove('nav-open');
    const { path, parts, query } = parseHash();
    renderSidebar(path);
    const [a, b, c] = parts;
    let title = 'AWS Architect Academy';
    if (!a) viewHome();
    else if (TRACK_ORDER.includes(a)) {
      const t = TRACKS[a];
      title = `${t.code} · AWS Architect Academy`;
      if (!b) viewTrack(t);
      else if (b === 'lesson' && c) viewLesson(t, c);
      else if (b === 'practice') viewPractice(t, query);
      else if (b === 'exam') viewExam(t);
      else if (b === 'flashcards') viewFlashcards(t, query);
      else notFound();
    } else if (a === 'tools') {
      const tool = window.Tools.list.find(x => x.id === b);
      if (tool) { title = `${tool.name} · AWS Architect Academy`; viewTool(tool); } else viewToolsIndex();
    } else if (a === 'progress') viewProgress();
    else notFound();
    document.title = title;
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function notFound() {
    app.innerHTML = `<div class="wrap empty"><h1>Page not found</h1><p><a href="#/">Back to home</a></p></div>`;
  }

  const footer = () => `<div class="footer">Independent, community study material — not affiliated with or endorsed by Amazon Web Services. AWS services change often; always confirm details in the official AWS documentation and exam guide.</div>`;

  // ---------- Home ----------
  function viewHome() {
    const cards = TRACK_ORDER.map(k => {
      const t = TRACKS[k], p = trackProgress(t);
      return `<div class="card track-card">
        <span class="code">${esc(t.code)}</span>
        <h3>${esc(t.name)}</h3>
        <p class="muted" style="margin:0">${esc(t.tagline || '')}</p>
        <div class="stats">
          <span><b>${t.domains.length}</b> domains</span><span><b>${p.lessons}</b> lessons</span>
          <span><b>${t.questions.length}</b> questions</span><span><b>${t.flashcards.length}</b> flashcards</span>
        </div>
        <div class="progress"><span style="width:${pct(p.done, p.lessons)}%"></span></div>
        <span class="small muted">${p.done}/${p.lessons} lessons complete</span>
        <div class="row" style="margin-top:6px">
          <a class="btn primary" href="#/${k}">Start learning</a>
          <a class="btn" href="#/${k}/exam">Take a mock exam</a>
        </div>
      </div>`;
    }).join('');

    const tools = window.Tools.list.map(tool => `
      <a class="card tool-card" href="#/tools/${tool.id}">
        <span class="emoji">${tool.icon}</span><strong>${esc(tool.name)}</strong>
        <span class="small muted">${esc(tool.blurb)}</span>
      </a>`).join('');

    app.innerHTML = `<div class="wrap">
      <section class="hero">
        <h1>Learn to think like an AWS Solutions Architect.</h1>
        <p>Free, interactive study materials for the AWS Certified Solutions Architect – Associate and Professional exams. Read focused lessons, drill scenario questions with full explanations, and test yourself under real exam timing.</p>
        <div class="row">
          ${TRACK_ORDER.map((k, i) => `<a class="btn ${i === 0 ? 'primary' : ''}" href="#/${k}">${esc(TRACKS[k].code)} track →</a>`).join('')}
        </div>
      </section>

      <div class="grid two">${cards}</div>

      <h2 style="margin-top:36px">How to use this site</h2>
      <div class="grid three">
        <div class="card"><h3>1 · Learn</h3><p class="muted small" style="margin:0">Work through lessons domain by domain. Each ends with key points and exam tips. Mark lessons complete to track progress.</p></div>
        <div class="card"><h3>2 · Drill</h3><p class="muted small" style="margin:0">Practice questions give instant feedback and explain why each wrong answer is wrong — that's where most learning happens.</p></div>
        <div class="card"><h3>3 · Remember</h3><p class="muted small" style="margin:0">Flashcards use a 5-box spaced-repetition system: cards you miss come back more often.</p></div>
        <div class="card"><h3>4 · Simulate</h3><p class="muted small" style="margin:0">Timed mock exams weighted by domain, with a per-domain breakdown so you know what to review.</p></div>
      </div>

      <h2 style="margin-top:36px">Interactive architecture tools</h2>
      <div class="grid three">${tools}</div>
      ${footer()}
    </div>`;
  }

  // ---------- Track overview ----------
  function viewTrack(t) {
    const p = trackProgress(t);
    const domains = t.domains.map((d, i) => {
      const done = d.lessons.filter(l => Store.isLessonDone(l.id)).length;
      const qs = t.questions.filter(q => q.domain === d.id).length;
      return `<div class="card">
        <div class="domain-head">
          <h2 style="margin:0">Domain ${i + 1}: ${esc(d.name)}</h2>
          <span class="weight">${d.weight}% of exam</span>
        </div>
        <p class="muted small">${esc(d.summary || '')}</p>
        <div class="row small">
          <div class="progress ok" style="flex:1;min-width:120px"><span style="width:${pct(done, d.lessons.length)}%"></span></div>
          <span class="muted">${done}/${d.lessons.length} done</span>
          <a class="btn sm" href="#/${t.id}/practice?domain=${d.id}">Practice ${qs} questions</a>
          <a class="btn sm ghost" href="#/${t.id}/flashcards?domain=${d.id}">Flashcards</a>
        </div>
        <ul class="lesson-list">
          ${d.lessons.map(l => `<li><a href="#/${t.id}/lesson/${l.id}">
            <span class="check ${Store.isLessonDone(l.id) ? 'done' : ''}">${Store.isLessonDone(l.id) ? '✓' : ''}</span>
            <span style="flex:1"><strong>${esc(l.title)}</strong><br><span class="small muted">${esc(l.summary || '')}</span></span>
            <span class="small muted">${l.minutes || ''} min</span></a></li>`).join('')}
        </ul>
      </div>`;
    }).join('');

    const e = t.exam;
    app.innerHTML = `<div class="wrap">
      <div class="breadcrumb"><a href="#/">Home</a> / ${esc(t.code)}</div>
      <h1>${esc(t.name)} <span class="pill accent">${esc(t.code)}</span></h1>
      <p class="muted">${esc(t.tagline || '')}</p>
      <div class="grid three" style="margin:20px 0">
        <div class="card"><div class="muted small">Exam format</div><strong>${e.questions} questions · ${e.minutes} min</strong><div class="small muted">${esc(e.format || '')}</div></div>
        <div class="card"><div class="muted small">Passing score</div><strong>${e.passing} / 1000</strong><div class="small muted">Scaled score ${esc(e.scale || '')}</div></div>
        <div class="card"><div class="muted small">Your progress</div><strong>${p.done}/${p.lessons} lessons · ${p.attempted}/${p.total} questions tried</strong>
          <div class="progress" style="margin-top:8px"><span style="width:${pct(p.done, p.lessons)}%"></span></div></div>
      </div>
      <div class="row" style="margin-bottom:24px">
        <a class="btn primary" href="#/${t.id}/practice">Practice questions</a>
        <a class="btn" href="#/${t.id}/exam">Timed exam simulator</a>
        <a class="btn" href="#/${t.id}/flashcards">Flashcards</a>
      </div>
      <div class="stack">${domains}</div>
      ${footer()}
    </div>`;
  }

  // ---------- Lesson ----------
  function viewLesson(t, id) {
    const lessons = allLessons(t);
    const idx = lessons.findIndex(l => l.id === id);
    if (idx < 0) return notFound();
    const l = lessons[idx], prev = lessons[idx - 1], next = lessons[idx + 1];
    const relatedQs = t.questions.filter(q => q.lesson === l.id).length;

    app.innerHTML = `<div class="wrap narrow">
      <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/${t.id}">${esc(t.code)}</a> / ${esc(domainName(t, l.domain))}</div>
      <h1>${esc(l.title)}</h1>
      <div class="row small muted"><span>⏱ ${l.minutes || '?'} min read</span><span>·</span><span>${esc(domainName(t, l.domain))}</span></div>
      <div class="svc-tags">${(l.services || []).map(s => `<span class="pill">${esc(s)}</span>`).join('')}</div>
      <article class="prose">
        ${l.sections.map(s => `<h2>${esc(s.heading)}</h2>${s.html}`).join('')}
      </article>
      ${l.keyPoints && l.keyPoints.length ? `<div class="keybox"><h3>🔑 Key points</h3><ul>${l.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul></div>` : ''}
      ${l.examTips && l.examTips.length ? `<div class="keybox tips"><h3>🎯 Exam tips</h3><ul>${l.examTips.map(k => `<li>${k}</li>`).join('')}</ul></div>` : ''}
      <div class="row" style="margin-top:24px">
        <button class="btn ${Store.isLessonDone(l.id) ? '' : 'primary'}" id="doneBtn">${Store.isLessonDone(l.id) ? '✓ Completed — mark as not done' : 'Mark lesson complete'}</button>
        ${relatedQs ? `<a class="btn" href="#/${t.id}/practice?lesson=${l.id}">Practice ${relatedQs} related question${relatedQs > 1 ? 's' : ''}</a>` : `<a class="btn" href="#/${t.id}/practice?domain=${l.domain}">Practice this domain</a>`}
      </div>
      <div class="lesson-nav">
        ${prev ? `<a class="btn ghost" href="#/${t.id}/lesson/${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="btn ghost" href="#/${t.id}/lesson/${next.id}">${esc(next.title)} →</a>` : `<a class="btn ghost" href="#/${t.id}/exam">Ready? Take a mock exam →</a>`}
      </div>
      ${footer()}
    </div>`;
    $('#doneBtn').onclick = () => {
      const wasDone = Store.isLessonDone(l.id);
      Store.toggleLesson(l.id);
      if (!wasDone && next) location.hash = `#/${t.id}/lesson/${next.id}`; else route();
    };
  }

  // ---------- Question rendering (shared by practice + exam review) ----------
  function questionHTML(t, q, { selected = [], reveal = false, number, total } = {}) {
    const need = q.multi ? q.answer.length : 1;
    const opts = q.options.map((o, i) => {
      let cls = 'opt';
      if (reveal) {
        if (q.answer.includes(i)) cls += ' correct';
        else if (selected.includes(i)) cls += ' wrong';
      } else if (selected.includes(i)) cls += ' selected';
      return `<button class="${cls}" data-i="${i}" ${reveal ? 'disabled' : ''}><span class="letter">${LETTERS[i]}</span><span>${o}</span></button>`;
    }).join('');
    return `<div class="q-meta">
        ${number ? `<span class="pill">Question ${number}${total ? ' of ' + total : ''}</span>` : ''}
        <span class="pill accent">${esc(domainName(t, q.domain))}</span>
        ${q.multi ? `<span class="pill">Select ${need}</span>` : ''}
      </div>
      <div class="q-stem">${q.question}</div>
      <div class="options">${opts}</div>`;
  }

  function explanationHTML(q, selected) {
    const ok = sameSet(selected, q.answer);
    return `<div class="explain ${ok ? 'ok' : 'bad'}">
      <h4>${ok ? '✅ Correct' : '❌ Not quite'} — answer: ${q.answer.map(i => LETTERS[i]).join(', ')}</h4>
      <div>${q.explanation}</div>
    </div>`;
  }

  // ---------- Practice ----------
  function viewPractice(t, query) {
    const domain = query.domain || 'all';
    const filter = query.filter || 'all';
    let pool = t.questions.filter(q => domain === 'all' || q.domain === domain);
    if (query.lesson) pool = t.questions.filter(q => q.lesson === query.lesson);
    if (filter === 'new') pool = pool.filter(q => !Store.questionStat(q.id));
    if (filter === 'missed') pool = pool.filter(q => { const s = Store.questionStat(q.id); return s && !s.last; });
    pool = shuffle(pool);

    const setQuery = changes => {
      const next = Object.assign({ domain, filter }, changes);
      delete next.lesson;
      location.hash = `#/${t.id}/practice?` + new URLSearchParams(next).toString();
    };

    let i = 0, selected = [], answered = false, right = 0, done = 0;

    function render() {
      const head = `<div class="breadcrumb"><a href="#/">Home</a> / <a href="#/${t.id}">${esc(t.code)}</a> / Practice</div>
        <h1>Practice questions</h1>
        <div class="row" style="margin-bottom:18px">
          <select id="domSel" style="max-width:340px" aria-label="Domain">
            <option value="all">All domains</option>
            ${t.domains.map(d => `<option value="${d.id}" ${d.id === domain && !query.lesson ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}
          </select>
          <div class="seg" role="group" aria-label="Filter">
            ${[['all', 'All'], ['new', 'Unseen'], ['missed', 'Missed last time']].map(([v, l]) => `<button data-f="${v}" class="${filter === v ? 'on' : ''}">${l}</button>`).join('')}
          </div>
          <span class="spacer"></span>
          <span class="small muted">Session: <b>${right}/${done}</b> correct</span>
        </div>
        ${query.lesson ? `<div class="callout small">Showing questions for one lesson. <a href="#/${t.id}/practice">Show all questions</a></div>` : ''}`;

      if (!pool.length) {
        app.innerHTML = `<div class="wrap narrow">${head}<div class="card empty">
          <p>${filter === 'missed' ? 'No missed questions here — nice work! 🎉' : filter === 'new' ? "You've seen every question in this set." : 'No questions in this set yet.'}</p>
          <button class="btn" id="allBtn">Show all questions</button></div></div>`;
        bindHead(); $('#allBtn').onclick = () => setQuery({ filter: 'all' });
        return;
      }
      if (i >= pool.length) {
        app.innerHTML = `<div class="wrap narrow">${head}<div class="card center">
          <h2>Set complete</h2><p class="muted">You answered ${right} of ${done} correctly (${pct(right, done)}%).</p>
          <div class="row" style="justify-content:center">
            <button class="btn primary" id="againBtn">Go again (reshuffled)</button>
            <button class="btn" id="missedBtn">Retry what I missed</button>
          </div></div></div>`;
        bindHead();
        $('#againBtn').onclick = () => route();
        $('#missedBtn').onclick = () => setQuery({ filter: 'missed' });
        return;
      }

      const q = pool[i];
      const stat = Store.questionStat(q.id);
      app.innerHTML = `<div class="wrap narrow">${head}
        <div class="progress" style="margin-bottom:16px"><span style="width:${pct(i, pool.length)}%"></span></div>
        <div class="card">
          ${questionHTML(t, q, { selected, reveal: answered, number: i + 1, total: pool.length })}
          ${stat && !answered ? `<p class="small muted" style="margin:12px 0 0">You've answered this ${stat.a}× before (${stat.c} correct).</p>` : ''}
          <div class="row" style="margin-top:16px">
            ${q.multi && !answered ? `<button class="btn primary" id="checkBtn" ${selected.length === q.answer.length ? '' : 'disabled'}>Check answer</button>` : ''}
            ${answered ? `<button class="btn primary" id="nextBtn">Next question →</button>` : ''}
            ${!answered ? `<button class="btn ghost" id="skipBtn">Skip</button>` : ''}
          </div>
          ${answered ? explanationHTML(q, selected) : ''}
        </div>
        <p class="small muted center" style="margin-top:12px">Tip: press A–${LETTERS[q.options.length - 1]} to choose, Enter to continue.</p>
      </div>`;
      bindHead();

      $$('.opt').forEach(btn => btn.onclick = () => choose(+btn.dataset.i));
      const check = $('#checkBtn'); if (check) check.onclick = submit;
      const nextB = $('#nextBtn'); if (nextB) nextB.onclick = advance;
      const skip = $('#skipBtn'); if (skip) skip.onclick = advance;
    }

    function choose(idx) {
      if (answered) return;
      const q = pool[i];
      if (q.multi) {
        selected = selected.includes(idx) ? selected.filter(x => x !== idx) : selected.length < q.answer.length ? selected.concat(idx) : selected;
        render();
      } else { selected = [idx]; submit(); }
    }
    function submit() {
      const q = pool[i];
      answered = true; done++;
      const ok = sameSet(selected, q.answer);
      if (ok) right++;
      Store.recordAnswer(q.id, ok);
      render();
    }
    function advance() { i++; selected = []; answered = false; render(); }
    function bindHead() {
      $('#domSel').onchange = e => setQuery({ domain: e.target.value });
      $$('[data-f]').forEach(b => b.onclick = () => setQuery({ filter: b.dataset.f }));
    }
    function onKey(e) {
      if (e.target.matches('input, select, textarea')) return;
      const q = pool[i]; if (!q) return;
      const k = e.key.toUpperCase();
      const idx = LETTERS.indexOf(k);
      if (idx >= 0 && idx < q.options.length && k.length === 1) choose(idx);
      else if (e.key === 'Enter') {
        if (answered) advance(); else if (q.multi && selected.length === q.answer.length) submit();
      }
    }
    document.addEventListener('keydown', onKey);
    onLeave(() => document.removeEventListener('keydown', onKey));
    render();
  }

  // ---------- Exam simulator ----------
  function pickExamQuestions(t, count) {
    const out = [];
    const byDomain = t.domains.map(d => shuffle(t.questions.filter(q => q.domain === d.id)));
    t.domains.forEach((d, k) => {
      const n = Math.round(count * d.weight / 100);
      out.push(...byDomain[k].splice(0, n));
    });
    const rest = shuffle(byDomain.flat());
    while (out.length < count && rest.length) out.push(rest.pop());
    return shuffle(out.slice(0, count));
  }

  function viewExam(t) {
    const e = t.exam;
    const full = Math.min(e.questions, t.questions.length);
    const presets = [
      { label: 'Quick check', count: Math.min(10, full) },
      { label: 'Half exam', count: Math.min(Math.round(e.questions / 2), full) },
      { label: 'Full length', count: full }
    ];
    // Same minutes-per-question pace as the real exam.
    const minutesFor = n => Math.round(n * e.minutes / e.questions);

    app.innerHTML = `<div class="wrap narrow">
      <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/${t.id}">${esc(t.code)}</a> / Exam simulator</div>
      <h1>${esc(t.code)} exam simulator</h1>
      <p class="muted">Questions are drawn in proportion to the official domain weights. Answers are hidden until you submit, just like the real exam. You can flag questions and come back to them.</p>
      <div class="grid three" style="margin:20px 0">
        ${presets.map((p, k) => `<button class="card opt" data-k="${k}" style="flex-direction:column;align-items:flex-start">
          <strong>${p.label}</strong><span class="small muted">${p.count} questions · ${minutesFor(p.count)} min</span></button>`).join('')}
      </div>
      ${t.questions.length < e.questions ? `<div class="callout small">This question bank has ${t.questions.length} questions, so a "full length" run uses all of them at real exam pace (the real exam has ${e.questions}).</div>` : ''}
      <div class="callout warn small">Scores here are an approximation of AWS's scaled scoring (100–1000, pass at ${e.passing}). AWS uses a compensatory model and may include unscored questions.</div>
      ${footer()}
    </div>`;
    $$('[data-k]').forEach(b => b.onclick = () => {
      const p = presets[+b.dataset.k];
      runExam(t, pickExamQuestions(t, p.count), minutesFor(p.count));
    });
  }

  function runExam(t, qs, minutes) {
    const answers = qs.map(() => []);
    const flagged = new Set();
    let cur = 0;
    const endAt = Date.now() + minutes * 60000;
    let timer = null, submitted = false;

    function remaining() { return Math.max(0, Math.round((endAt - Date.now()) / 1000)); }
    function fmt(s) { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }

    function render() {
      const q = qs[cur];
      const need = q.multi ? q.answer.length : 1;
      const answeredCount = answers.filter(a => a.length).length;
      app.innerHTML = `<div class="wrap narrow">
        <div class="quiz-bar">
          <strong>${esc(t.code)} mock exam</strong>
          <span class="spacer"></span>
          <span class="small muted">${answeredCount}/${qs.length} answered</span>
          <span class="timer" id="timer">${fmt(remaining())}</span>
        </div>
        <div class="card">
          ${questionHTML(t, q, { selected: answers[cur], number: cur + 1, total: qs.length })}
          <div class="row" style="margin-top:18px">
            <button class="btn" id="prevBtn" ${cur === 0 ? 'disabled' : ''}>← Previous</button>
            <button class="btn ghost" id="flagBtn">${flagged.has(cur) ? '⚑ Unflag' : '⚐ Flag for review'}</button>
            <span class="spacer"></span>
            ${cur < qs.length - 1 ? `<button class="btn primary" id="nextBtn">Next →</button>` : `<button class="btn primary" id="endBtn">Review & submit</button>`}
          </div>
          <div class="qnav" aria-label="Question navigator">
            ${qs.map((_, k) => `<button data-n="${k}" class="${answers[k].length ? 'answered' : ''} ${flagged.has(k) ? 'flagged' : ''} ${k === cur ? 'current' : ''}" aria-label="Question ${k + 1}">${k + 1}</button>`).join('')}
          </div>
        </div>
        <div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn ghost sm" id="submitNow">Submit exam now</button></div>
      </div>`;

      $$('.opt').forEach(btn => btn.onclick = () => {
        const i = +btn.dataset.i;
        let a = answers[cur];
        if (q.multi) a = a.includes(i) ? a.filter(x => x !== i) : a.length < need ? a.concat(i) : a;
        else a = [i];
        answers[cur] = a; render();
      });
      $('#prevBtn').onclick = () => { cur--; render(); };
      $('#flagBtn').onclick = () => { flagged.has(cur) ? flagged.delete(cur) : flagged.add(cur); render(); };
      const n = $('#nextBtn'); if (n) n.onclick = () => { cur++; render(); };
      const en = $('#endBtn'); if (en) en.onclick = confirmSubmit;
      $('#submitNow').onclick = confirmSubmit;
      $$('[data-n]').forEach(b => b.onclick = () => { cur = +b.dataset.n; render(); });
    }

    function confirmSubmit() {
      const un = answers.filter(a => !a.length).length;
      const msg = (un ? `You have ${un} unanswered question(s). ` : '') + (flagged.size ? `${flagged.size} flagged. ` : '') + 'Submit the exam?';
      if (confirm(msg)) finish();
    }

    function tick() {
      const el = $('#timer'); const r = remaining();
      if (el) { el.textContent = fmt(r); el.classList.toggle('low', r < 300); }
      if (r <= 0) finish();
    }

    function finish() {
      if (submitted) return; submitted = true;
      clearInterval(timer);
      const results = qs.map((q, k) => ({ q, sel: answers[k], ok: sameSet(answers[k], q.answer) }));
      results.forEach(r => Store.recordAnswer(r.q.id, r.ok));
      const correct = results.filter(r => r.ok).length;
      const ratio = correct / qs.length;
      const scaled = Math.round(100 + 900 * ratio);
      const byDomain = t.domains.map(d => {
        const rs = results.filter(r => r.q.domain === d.id);
        return { id: d.id, name: d.name, total: rs.length, correct: rs.filter(r => r.ok).length };
      }).filter(d => d.total);
      Store.addExam({ track: t.id, date: Date.now(), total: qs.length, correct, scaled, passed: scaled >= t.exam.passing, byDomain, seconds: minutes * 60 - remaining() });
      showResults(t, results, scaled, byDomain);
    }

    timer = setInterval(tick, 1000);
    const beforeUnload = e => { if (!submitted) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    onLeave(() => { clearInterval(timer); window.removeEventListener('beforeunload', beforeUnload); });
    render();
  }

  function scoreRing(value, max, passed) {
    const r = 70, c = 2 * Math.PI * r, frac = Math.max(0, Math.min(1, (value - 100) / (max - 100)));
    return `<div class="score-ring"><svg viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="14"/>
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="${passed ? 'var(--ok)' : 'var(--bad)'}" stroke-width="14" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}"/></svg><span class="val">${value}</span></div>`;
  }

  function showResults(t, results, scaled, byDomain) {
    const passed = scaled >= t.exam.passing;
    const correct = results.filter(r => r.ok).length;
    let reviewFilter = 'wrong';

    function render() {
      const list = results.map((r, k) => ({ r, k })).filter(({ r }) => reviewFilter === 'all' || !r.ok);
      app.innerHTML = `<div class="wrap narrow">
        <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/${t.id}">${esc(t.code)}</a> / Exam results</div>
        <div class="card center">
          ${scoreRing(scaled, 1000, passed)}
          <h2>${passed ? 'Pass 🎉' : 'Not yet — keep going'}</h2>
          <p class="muted">${correct} of ${results.length} correct (${pct(correct, results.length)}%) · approx. scaled score ${scaled} / 1000 · pass mark ${t.exam.passing}</p>
          <div class="row" style="justify-content:center">
            <a class="btn primary" href="#/${t.id}/exam">New exam</a>
            <a class="btn" href="#/${t.id}/practice?filter=missed">Practice missed questions</a>
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <h3>Score by domain</h3>
          ${byDomain.map(d => `<div class="bar-row"><span>${esc(d.name)}</span>
            <div class="progress ${pct(d.correct, d.total) >= 72 ? 'ok' : ''}"><span style="width:${pct(d.correct, d.total)}%"></span></div>
            <span class="mono small">${d.correct}/${d.total}</span></div>`).join('')}
          <p class="small muted" style="margin:10px 0 0">Below ~72% in a domain? Revisit that domain's lessons before your next attempt.</p>
        </div>
        <div class="row" style="margin:28px 0 12px">
          <h2 style="margin:0">Review</h2><span class="spacer"></span>
          <div class="seg"><button data-r="wrong" class="${reviewFilter === 'wrong' ? 'on' : ''}">Incorrect only</button><button data-r="all" class="${reviewFilter === 'all' ? 'on' : ''}">All questions</button></div>
        </div>
        <div class="stack">
          ${list.length ? list.map(({ r, k }) => `<div class="card">${questionHTML(t, r.q, { selected: r.sel, reveal: true, number: k + 1 })}
            ${r.sel.length ? '' : '<p class="small muted" style="margin:10px 0 0">Not answered.</p>'}${explanationHTML(r.q, r.sel)}</div>`).join('') : '<div class="card empty">No incorrect answers. Outstanding!</div>'}
        </div>
      </div>`;
      $$('[data-r]').forEach(b => b.onclick = () => { reviewFilter = b.dataset.r; render(); });
    }
    onLeave(null);
    render();
    window.scrollTo(0, 0);
  }

  // ---------- Flashcards (Leitner boxes 1–5) ----------
  function viewFlashcards(t, query) {
    const domain = query.domain || 'all';
    const cards = t.flashcards.map((c, i) => Object.assign({ key: `${t.id}:${i}` }, c))
      .filter(c => domain === 'all' || c.domain === domain);
    let current = null, flipped = false, seen = 0;

    // Lower boxes are weighted more heavily so weak cards come back sooner.
    function draw() {
      const weights = cards.map(c => Math.pow(2, 5 - Store.cardBox(c.key)));
      let total = weights.reduce((a, b) => a + b, 0), r = Math.random() * total;
      for (let k = 0; k < cards.length; k++) { r -= weights[k]; if (r <= 0) { if (cards[k] !== current || cards.length === 1) return cards[k]; } }
      return cards.find(c => c !== current) || cards[0];
    }

    function render() {
      const counts = [1, 2, 3, 4, 5].map(b => cards.filter(c => Store.cardBox(c.key) === b).length);
      app.innerHTML = `<div class="wrap narrow">
        <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/${t.id}">${esc(t.code)}</a> / Flashcards</div>
        <h1>Flashcards</h1>
        <div class="row" style="margin-bottom:6px">
          <select id="domSel" style="max-width:340px" aria-label="Domain">
            <option value="all">All domains</option>
            ${t.domains.map(d => `<option value="${d.id}" ${d.id === domain ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}
          </select>
          <span class="spacer"></span><span class="small muted">${seen} reviewed this session</span>
        </div>
        <div class="boxes">${counts.map((n, k) => `<span title="Box ${k + 1}">Box ${k + 1}: <b>${n}</b></span>`).join('')}</div>
        ${cards.length ? `
        <div class="flash-stage">
          <div class="flash ${flipped ? 'flipped' : ''}" id="flash" role="button" tabindex="0" aria-label="Flip card">
            <div class="face front"><div>${current.front}</div><span class="hint">Click or press Space to flip</span></div>
            <div class="face back"><div>${current.back}</div><span class="hint">${esc(domainName(t, current.domain))} · box ${Store.cardBox(current.key)}</span></div>
          </div>
          <div class="flash-actions">
            ${flipped ? `
              <button class="btn" data-g="again">1 · Again</button>
              <button class="btn" data-g="hard">2 · Hard</button>
              <button class="btn primary" data-g="good">3 · Got it</button>` :
              `<button class="btn primary" id="flipBtn">Show answer</button>`}
          </div>
        </div>
        <p class="small muted center" style="margin-top:18px">"Again" sends a card back to box 1; "Got it" moves it up a box. Cards in low boxes appear more often.</p>
        ` : '<div class="card empty">No flashcards in this set yet.</div>'}
      </div>`;
      $('#domSel').onchange = e => { location.hash = `#/${t.id}/flashcards?domain=${e.target.value}`; };
      if (!cards.length) return;
      $('#flash').onclick = flip;
      const fb = $('#flipBtn'); if (fb) fb.onclick = flip;
      $$('[data-g]').forEach(b => b.onclick = () => grade(b.dataset.g));
    }
    function flip() { flipped = !flipped; render(); }
    function grade(g) {
      const box = Store.cardBox(current.key);
      Store.setCardBox(current.key, g === 'again' ? 1 : g === 'good' ? box + 1 : box);
      seen++; current = draw(); flipped = false; render();
    }
    function onKey(e) {
      if (e.target.matches('input, select, textarea') || !cards.length) return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      else if (flipped && e.key === '1') grade('again');
      else if (flipped && e.key === '2') grade('hard');
      else if (flipped && e.key === '3') grade('good');
    }
    document.addEventListener('keydown', onKey);
    onLeave(() => document.removeEventListener('keydown', onKey));
    if (cards.length) current = draw();
    render();
  }

  // ---------- Tools ----------
  function viewToolsIndex() {
    app.innerHTML = `<div class="wrap"><h1>Interactive tools</h1>
      <p class="muted">Hands-on helpers for the decisions the exams test most.</p>
      <div class="grid three">${window.Tools.list.map(tool => `
        <a class="card tool-card" href="#/tools/${tool.id}"><span class="emoji">${tool.icon}</span><strong>${esc(tool.name)}</strong>
        <span class="small muted">${esc(tool.blurb)}</span></a>`).join('')}</div></div>`;
  }
  function viewTool(tool) {
    app.innerHTML = `<div class="wrap narrow tool">
      <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/tools">Tools</a> / ${esc(tool.name)}</div>
      <h1>${tool.icon} ${esc(tool.name)}</h1>
      <p class="muted">${esc(tool.blurb)}</p>
      <div id="toolRoot"></div>
      ${footer()}
    </div>`;
    tool.render($('#toolRoot'));
  }

  // ---------- Progress ----------
  function viewProgress() {
    const sections = TRACK_ORDER.map(k => {
      const t = TRACKS[k], p = trackProgress(t);
      const exams = Store.state.exams.filter(x => x.track === k);
      const weak = t.domains.map(d => {
        const qs = t.questions.filter(q => q.domain === d.id && Store.questionStat(q.id));
        const ok = qs.filter(q => Store.questionStat(q.id).last).length;
        return { d, n: qs.length, ok };
      });
      return `<div class="card">
        <h2>${esc(t.code)} · ${esc(t.name)}</h2>
        <div class="grid three" style="margin-bottom:14px">
          <div><div class="muted small">Lessons</div><strong>${p.done}/${p.lessons}</strong><div class="progress ok"><span style="width:${pct(p.done, p.lessons)}%"></span></div></div>
          <div><div class="muted small">Questions attempted</div><strong>${p.attempted}/${p.total}</strong><div class="progress"><span style="width:${pct(p.attempted, p.total)}%"></span></div></div>
          <div><div class="muted small">Correct on last try</div><strong>${pct(p.correctLast, p.attempted)}%</strong><div class="progress ok"><span style="width:${pct(p.correctLast, p.attempted)}%"></span></div></div>
        </div>
        <h3>Accuracy by domain</h3>
        ${weak.map(w => `<div class="bar-row"><span>${esc(w.d.name)}</span>
          <div class="progress ${pct(w.ok, w.n) >= 72 ? 'ok' : ''}"><span style="width:${pct(w.ok, w.n)}%"></span></div>
          <span class="mono small">${w.n ? pct(w.ok, w.n) + '%' : '—'}</span></div>`).join('')}
        <h3 style="margin-top:18px">Exam history</h3>
        ${exams.length ? `<div class="prose"><table>
          <thead><tr><th>Date</th><th>Score</th><th>Correct</th><th>Result</th></tr></thead>
          <tbody>${exams.map(x => `<tr><td>${new Date(x.date).toLocaleString()}</td><td class="mono">${x.scaled}</td><td>${x.correct}/${x.total}</td>
            <td>${x.passed ? '<span class="pill ok">Pass</span>' : '<span class="pill bad">Below pass mark</span>'}</td></tr>`).join('')}</tbody></table></div>`
          : `<p class="muted small">No mock exams yet. <a href="#/${k}/exam">Take one</a>.</p>`}
      </div>`;
    }).join('');

    app.innerHTML = `<div class="wrap narrow">
      <h1>My progress</h1>
      <p class="muted">Progress is saved in this browser only. Export it to move it to another device.</p>
      <div class="stack">${sections}</div>
      <div class="card" style="margin-top:16px">
        <h3>Backup</h3>
        <div class="row">
          <button class="btn" id="expBtn">Export progress</button>
          <label class="btn" style="cursor:pointer">Import progress<input type="file" id="impFile" accept="application/json" hidden></label>
          <span class="spacer"></span>
          <button class="btn ghost" id="resetBtn">Reset everything</button>
        </div>
      </div>
    </div>`;
    $('#expBtn').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'aws-academy-progress.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#impFile').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(txt => { try { Store.importJSON(txt); route(); } catch (err) { alert('That file is not a valid progress export.'); } });
    };
    $('#resetBtn').onclick = () => { if (confirm('Delete all saved progress in this browser?')) { Store.reset(); route(); } };
  }

  // ---------- Boot ----------
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  $('#themeBtn').onclick = () => {
    const cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    Theme.set(cur === 'dark' ? 'light' : 'dark');
  };
  window.addEventListener('hashchange', route);
  route();
})();

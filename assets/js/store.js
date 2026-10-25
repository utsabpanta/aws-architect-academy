/* Progress persistence. Everything lives in this browser's localStorage;
   reads and writes are guarded so the site still works when storage is blocked. */
(function () {
  const KEY = 'aws-academy-progress-v1';
  const empty = () => ({ lessons: {}, q: {}, cards: {}, exams: [] });

  let state = empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(empty(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: keep in-memory state */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  window.Store = {
    get state() { return state; },

    isLessonDone: id => !!state.lessons[id],
    toggleLesson(id) {
      if (state.lessons[id]) delete state.lessons[id]; else state.lessons[id] = Date.now();
      save();
    },

    recordAnswer(qid, correct) {
      const s = state.q[qid] || { a: 0, c: 0 };
      s.a += 1; if (correct) s.c += 1; s.last = correct;
      state.q[qid] = s; save();
    },
    questionStat: qid => state.q[qid],

    cardBox: key => state.cards[key] || 1,
    setCardBox(key, box) { state.cards[key] = Math.max(1, Math.min(5, box)); save(); },

    addExam(result) { state.exams.unshift(result); state.exams = state.exams.slice(0, 30); save(); },

    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON(text) {
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object' || Array.isArray(data) || !['lessons', 'q', 'cards', 'exams'].some(k => k in data)) {
        throw new Error('Not a progress export');
      }
      state = Object.assign(empty(), data); save();
    },
    reset() { state = empty(); save(); }
  };

  // Theme preference is a per-viewer convenience.
  window.Theme = {
    get() { try { return localStorage.getItem('aws-academy-theme'); } catch (e) { return null; } },
    set(v) {
      document.documentElement.setAttribute('data-theme', v);
      try { localStorage.setItem('aws-academy-theme', v); } catch (e) { /* ignore */ }
    }
  };
  const t = window.Theme.get();
  if (t) document.documentElement.setAttribute('data-theme', t);
})();

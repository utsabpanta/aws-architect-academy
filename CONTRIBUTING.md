# Contributing

Thanks for helping other people pass their AWS exams! Content fixes and new questions are the most valuable contributions.

## Content schema

Each track is a plain script in `data/` that assigns `window.TRACKS.<id>`:

```js
window.TRACKS.saa = {
  id, code, name, tagline,
  exam: { questions, minutes, passing, scale, cost, format },
  domains: [{
    id, name, weight, summary,
    lessons: [{
      id, title, minutes, summary,
      sections: [{ heading, html }],   // HTML: p, ul/li, strong, code, table, <div class="callout">, <div class="callout warn">
      keyPoints: [], examTips: [], services: []
    }]
  }],
  flashcards: [{ domain, front, back }],
  questions: [{
    id, domain, lesson,                // lesson is optional
    multi,                             // true for "Choose TWO/THREE"
    question, options: [], answer: [], // answer = zero-based option indexes
    explanation                        // explain the right answer AND each distractor
  }]
};
```

## Style guide

- **Write original questions.** Never copy questions from real exams or paid question banks.
- Scenario stems should read like the exam: a company, a constraint ("LEAST operational overhead", "MOST cost-effective"), and plausible distractors.
- Explanations must say why each wrong option is wrong — that's where learning happens.
- Prefer stable, well-documented facts. Link to AWS docs in explanations when a number or limit matters.
- Lesson IDs must be unique within a track; question IDs must be unique.

## Before opening a pull request

```bash
node scripts/validate.js
npm test                      # browser tests (first run: npm install && npx playwright install chromium)
python3 -m http.server 8000   # then click through your changes
```

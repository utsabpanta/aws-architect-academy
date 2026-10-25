# AWS Architect Academy

Free, interactive study materials for the **AWS Certified Solutions Architect – Associate (SAA-C03)** and **Professional (SAP-C02)** exams, published as a static GitHub Pages site.

## What's inside

| Feature | Description |
| --- | --- |
| 📘 **Lessons** | Organized by the official exam domains and weights. Each lesson explains the *why*, includes comparison tables, key points and exam tips. |
| ✎ **Practice questions** | Scenario-style questions with instant feedback and explanations of why every distractor is wrong. Filter by domain, unseen, or missed. |
| ⏱ **Exam simulator** | Timed mock exams drawn in proportion to domain weights, with flagging, a question navigator, an approximate scaled score and per-domain breakdown. |
| 🃏 **Flashcards** | 5-box spaced repetition (Leitner system) — cards you miss come back more often. |
| 🛠 **Interactive tools** | DR strategy explorer (RTO/RPO), S3 storage class picker, VPC subnet calculator, database chooser, EC2 pricing advisor, security group vs NACL packet simulator, data transfer calculator (network vs Snowball), Route 53 routing game. |
| 📈 **Progress** | Saved in your browser's localStorage, with export/import to move between devices. |

No accounts, no tracking, no build step — just HTML, CSS and vanilla JavaScript.

## Run locally

Any static file server works:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which validates the content, runs the browser test suite, and deploys the site. Pull requests run the same checks without deploying.

## Project structure

```
index.html            App shell
assets/css/style.css  Styles (light + dark themes)
assets/js/app.js      Router and views: lessons, practice, exam, flashcards, progress
assets/js/tools.js    Interactive architecture tools
assets/js/store.js    localStorage progress persistence
data/saa.js           SAA-C03 lessons, questions and flashcards
data/sap.js           SAP-C02 lessons, questions and flashcards
scripts/validate.js   Content schema checks (runs in CI)
tests/                Playwright browser tests for every feature and tool
```

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

The suite renders every lesson, answers every practice question, runs mock exams (including timer expiry), exercises flashcards, progress export/import, every interactive tool, and checks for horizontal overflow on desktop and phone widths.

## Contributing content

All study content lives in `data/*.js`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the schema and style guide, then run:

```bash
node scripts/validate.js
```

## Disclaimer

This is independent community material and is not affiliated with or endorsed by Amazon Web Services. AWS services and exam guides change — always confirm details against the [official AWS documentation](https://docs.aws.amazon.com/) and [exam guides](https://aws.amazon.com/certification/). These are original practice questions, not real exam questions.

## License

[MIT](LICENSE)

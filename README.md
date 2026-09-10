# Software Engineer Programme — Coding Assessment

A self-contained coding assessment platform: candidates work through a series
of timed JavaScript coding challenges in an in-browser editor, get an
auto-graded pass/fail per challenge, and receive a shareable completion
certificate at the end.

## Features

- **Coding challenges** — in-browser code editor with instructions, expected
  input/output, and an automated test runner per challenge
  ([app/challenges/[slug]](app/challenges/%5Bslug%5D)).
- **Progress tracking** — code, test results, and completion state are saved
  automatically as the candidate works.
- **Anti-cheat protections** — clipboard (copy/cut), right-click, and
  tab-switch/focus-loss are detected and warned on; the assessment locks
  after repeated violations. See [hooks/use-anti-cheat.ts](hooks/use-anti-cheat.ts)
  for exactly what is (and isn't) detectable from a browser tab, and why.
- **Results dashboard** — a scoring breakdown of completed tasks, pass rates,
  and time spent ([app/dashboard](app/dashboard)).
- **Certificates** — a public, shareable certificate page once the course is
  completed and the candidate's name is confirmed
  ([app/certificate/[id]](app/certificate/%5Bid%5D)).
- **Legal pages** — Terms and Privacy Policy templates
  ([app/terms](app/terms), [app/privacy](app/privacy)).

## Tech stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS + [shadcn](https://ui.shadcn.com)-based UI components
- No authentication and no external database — see [Data storage](#data-storage) below

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Data storage

This app has no authentication — every visitor shares one implicit "guest"
progress record — and no database is configured. Progress and certificates
are held in an in-memory store on the server
([lib/progress-store.ts](lib/progress-store.ts)).

This means state resets on every server restart/redeploy and isn't shared
across multiple serverless instances. That's a deliberate trade-off for
running with zero external services configured, not a bug. Wiring up a real
database is a drop-in replacement for the three functions in
`lib/progress-store.ts` if persistence is needed.

## Project structure

```text
app/
  page.tsx                 Landing page
  programme/                Programme overview + progress summary
  challenges/[slug]/        Challenge workspace (editor, tests, anti-cheat)
  coding-assessment/         Assessment start/continue/completion screen
  dashboard/                 Results dashboard
  certificate/[id]/         Public certificate page
  api/progress/              Progress read/write endpoint
  terms/, privacy/           Legal page templates
lib/
  challenges/                 Challenge definitions and test cases
  progress.ts                 Progress state shape and helpers
  progress-store.ts           In-memory progress/certificate storage
  assessment-results.ts       Score/results calculation
hooks/
  use-progress.ts             Loads/saves progress via the API route
  use-anti-cheat.ts           Copy/context-menu/tab-switch detection
```

## Deploying

This project has no environment variable requirements and deploys as a
standard Next.js app (e.g. to [Vercel](https://vercel.com/new)):

```bash
npm run build
```

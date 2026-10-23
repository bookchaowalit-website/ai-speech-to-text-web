# Voice Booth (speech to text)

A one-take dictation page over the browser's own Web Speech API: start, stop, watch the transcript and word count
update, copy or clear it. No transcription service or key of its own; works where the browser ships
`SpeechRecognition` (Chrome, Edge).

Live: https://speech-to-text.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does not do

- No language choice, punctuation, export, recording, storage or account. Nothing is saved.
- Audio is not kept on the device: Chrome and similar engines process it in their own cloud service.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: transcript logic, MCP route, home page render, Sentry scrubbing
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (with a line-coverage gate) and the shared security
scan on every push and PR to `main`.

## Code map

- `lib/speech.ts`: recognition constructor lookup, transcript joining, word count and status rules (used by the page).
- `app/api/mcp/route.ts`: stateless JSON-RPC endpoint; `initialize` and an empty `tools/list`, every call refused.
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped; off when
  `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `app/more-projects/page.tsx`: shared portfolio link page (copied per repository, not a package).

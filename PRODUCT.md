# Voice Booth (speech to text) — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `speech-to-text`) on 2026-10-23.

## What it is

A client-only page that wires the browser's own Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
to a transcript area. There is no transcription service, API key or backend of its own.

## Who it is for

A portfolio visitor on Chrome or Edge who wants to see one take of live dictation in a small, calm UI.

## What works today

1. Start a recognition session (continuous, with interim results) and Stop it. The status reads READY,
   LISTENING, STOPPED, ERROR or UNAVAILABLE (browser without the API).
2. The transcript updates while you speak; the word count follows it.
3. Copy the transcript to the clipboard, or clear it.
4. `/api/mcp` answers JSON-RPC `initialize` and `tools/list` with an empty tool list: the app keeps no data on a
   server, so any `tools/call` is refused with an error.
5. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No language selection, auto-punctuation, markdown export or word boosting (removed from the portfolio card in the
  2026-10 review).
- It does not keep audio on the device: browser engines such as Chrome send the audio to their own cloud speech
  service. "No cloud key" in the UI only means this app has no key or service of its own.
- No recording, upload, storage, account or history; nothing survives a reload. Firefox and Safari without the API
  show UNAVAILABLE.

## Live URL and deploy state

- Live: https://speech-to-text.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-speech-to-text-frontend` is deployed only by CLI. Its last production deploy is
  the CVE patch (2026-10-23, CLI, commit c17717b). Its Git link names the old repository
  `bookchaowalit/bookchaowalit-speech-to-text-frontend`, so a push to `main` does not deploy: the L2 work (tests,
  Sentry, truthful MCP route) stays undeployed until the owner reconnects Vercel Git to this repository (owner
  action D9). `NEXT_PUBLIC_SENTRY_DSN` is already set on the Vercel project (Sentry project `ai-speech-to-text-web`,
  org `personal-yu0`).

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route.

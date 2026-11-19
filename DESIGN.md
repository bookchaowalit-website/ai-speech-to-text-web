# Speech to Text — Design

Since 2026-11-19 the booth uses the shared **App shell** (see `APP-SHELL.md`; `app/app-shell.css` and
`components/app-shell.tsx` are copied byte for byte from productivity-ideas-web). It replaced the earlier dark
"voice booth" look, whose 9–10px mono text, transcript-paper text under 4.5:1, 2.2:1 pill and box edges, 30px
Copy button, padding-less Clear link, 36%-opacity Stop, blank cleared paper, tall phone hero, unused Geist
fonts behind Georgia/Courier and mismatched title/og:title failed the design floor (review 2026-11-11).

- **Recorder** card: status pill (Ready / Listening / Stopped / Error / Not supported here), **Start recording**
  (Record again after a take) and a bordered 44px **Stop** that stays readable when disabled. Unsupported
  browsers and recognition errors get a plain callout instead of text dropped into the transcript.
- **Transcript** card: the text, or an empty state that says what to do; word count, Copy transcript and Clear
  (both 44px, disabled while there is nothing to copy).
- Honesty: no API key is used; the note says some browsers (Chrome) send audio to their own speech service, and
  nothing is stored. Title and og:title are both "Speech to Text | Bookchaowalit".

Floor: Geist via `next/font` (variable on `<html>`), text ≥ 12px, controls ≥ 44px, 4.5:1 text contrast in
light and dark, 3px focus ring, forced-colors support, no horizontal scroll at 320px. `/more-projects`
redirects (308) to https://bookchaowalit.com/ and the footer links there. Canonical domain, robots.txt and
sitemap.xml: https://speech-to-text.bookchaowalit.com.

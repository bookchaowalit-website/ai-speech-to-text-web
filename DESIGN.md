# DESIGN.md

## Overview

Voice / Booth frames browser speech recognition as a recording take: a console for capture and a warm transcript paper for the result.

## Colors

- Night `#101927` is the booth ground; navy `#17273b` is the recording console.
- Paper `#f4ebd8` holds the transcript.
- Sky `#9cd5d2` is the ready signal and waveform ink.
- Coral `#ef765f` is the recording action and transcript rule.

## Typography

- Georgia gives the booth and transcript a calm spoken/editorial character.
- Courier New handles take numbers, status, method, and capability notes.
- Large spoken copy uses generous line height and a narrow measure so it remains a readable transcript.

## Layout

- The hero names the recording scene and exposes the current status.
- The console holds waveform, take metadata, and start/stop controls; transcript paper follows as the primary output.
- Mobile preserves the same capture-to-paper sequence and keeps controls reachable.

## Elevation & Depth

Depth comes from the navy console against night and paper against night. No artificial glow or glass layer is required.

## Shapes

Straight-edged console and paper, horizontal waveform bars, and thin coral/sky rules. Controls are compact rectangular booth switches.

## Components

- Browser-native SpeechRecognition start/stop flow.
- Status indicator with ready, listening, error, and unavailable states.
- Authored waveform field that communicates the recording scene without claiming live audio analysis.
- Transcript copy and clear actions with word count.

## Do's and Don'ts

- Do state browser support and microphone permission limits near the action.
- Do keep transcript content visible even when recognition is unavailable.
- Don't imply cloud transcription, saved recordings, or audio upload.
- Don't replace the transcript with an audio-player or fake waveform metric.


---

## Storybook

Storybook 10 (`@storybook/nextjs-vite`) shows this design system with the app's real CSS, tokens and fonts.

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # static build in storybook-static/ (CI: .github/workflows/storybook.yml)
```

- **Foundations/Tokens** reads every CSS custom property the app defines at runtime, so it never drifts from the code.
- **Design/DESIGN.md** renders this file.
- **Components/**, **Sections/** and **Pages/** show the UI with mock data only (no network, analytics off).
- Toolbar: locale, theme (light / dark, when the app has a dark theme), viewports 320 / 375 / 768 / 1440. The a11y panel runs axe (WCAG 2.2 AA).
- Rule: a new shared component or page section ships with a story in `stories/`.

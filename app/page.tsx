"use client";

import { useRef, useState } from "react";
import { AppFoot, AppTop, Pill, type Tone } from "@/components/app-shell";
import {
  INITIAL_TRANSCRIPT,
  UNAVAILABLE_TRANSCRIPT,
  countWords,
  getRecognitionConstructor,
  joinTranscript,
  statusAfterEnd,
  type Recognition,
  type Status,
} from "@/lib/speech";

const SOURCE = "https://github.com/bookchaowalit-website/ai-speech-to-text-web";
const STATUS: Record<Status, { tone: Tone; text: string }> = {
  READY: { tone: "grey", text: "Ready" },
  LISTENING: { tone: "green", text: "Listening" },
  STOPPED: { tone: "grey", text: "Stopped" },
  ERROR: { tone: "red", text: "Error" },
  UNAVAILABLE: { tone: "amber", text: "Not supported here" },
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<Status>("READY");
  const [note, setNote] = useState("");
  // Bumped by every transcript change and every copy: a change cancels the copy status, and only the latest copy reports.
  const copyEpoch = useRef(0);
  const cancelCopy = () => {
    copyEpoch.current += 1;
    setNote("");
  };
  const recognition = useRef<Recognition | null>(null);
  const isListening = status === "LISTENING";
  const words = countWords(transcript);

  function start() {
    const Constructor = getRecognitionConstructor(window);
    if (!Constructor) {
      setStatus("UNAVAILABLE");
      return;
    }
    const nextRecognition = new Constructor();
    nextRecognition.continuous = true;
    nextRecognition.interimResults = true;
    nextRecognition.onresult = (event) => {
      cancelCopy();
      setTranscript(joinTranscript(event.results));
    };
    nextRecognition.onerror = () => setStatus("ERROR");
    nextRecognition.onend = () => setStatus(statusAfterEnd);
    recognition.current = nextRecognition;
    cancelCopy();
    nextRecognition.start();
    setStatus("LISTENING");
  }

  function stop() {
    recognition.current?.stop();
    setStatus("STOPPED");
  }

  async function copyTranscript() {
    const mine = ++copyEpoch.current;
    let message = "Transcript copied.";
    try {
      await navigator.clipboard.writeText(transcript);
    } catch {
      message = "Copy was blocked by the browser. Select the text and copy it manually.";
    }
    if (copyEpoch.current === mine) setNote(message);
  }

  function clear() {
    setTranscript("");
    cancelCopy();
    if (!isListening) setStatus("READY");
  }

  const state = STATUS[status];

  return (
    <div className="as">
      <a className="as-skip" href="#recorder">Skip to the recorder</a>
      <AppTop name="Speech to Text" tagline="Browser speech recognition" />

      <main className="as-page">
        <div className="as-intro">
          <p className="as-eyebrow">One take at a time</p>
          <h1>Let the browser catch the room.</h1>
          <p>Press Start, speak, and your browser&apos;s own speech recognition writes it down. No API key is used.</p>
        </div>

        <section className="as-composer st-card" id="recorder" tabIndex={-1} aria-labelledby="recorder-heading">
          <div className="st-foot">
            <h2 id="recorder-heading">Recorder</h2>
            <span role="status"><Pill tone={state.tone}>{state.text}</Pill></span>
          </div>
          <div className="st-controls">
            <button type="button" className="as-button" onClick={start} disabled={isListening}>{status === "STOPPED" ? "Record again" : "Start recording"}</button>
            <button type="button" className="as-plain st-stop" onClick={stop} disabled={!isListening}>Stop</button>
          </div>
          {/* Always rendered, so the fix (try Chrome or Edge, allow the microphone) is announced with the status. */}
          <div className="st-callouts" aria-live="polite">
            {status === "UNAVAILABLE" ? <p className="st-callout">{UNAVAILABLE_TRANSCRIPT}</p> : null}
            {status === "ERROR" ? <p className="st-callout" data-tone="red">Recognition stopped with an error. Check that the microphone is allowed for this site, then start again.</p> : null}
          </div>
          <p className="st-meta">Allow microphone access when the browser asks. Stop ends the current take. Recognition runs in the browser; some browsers, Chrome for one, send the audio to their own speech service to do it.</p>
        </section>

        <section className="as-composer st-card" aria-labelledby="transcript-heading">
          <h2 id="transcript-heading">Transcript</h2>
          <p className="st-paper" aria-live="polite" data-empty={transcript ? undefined : "true"}>{transcript || (isListening ? "Listening… start speaking." : INITIAL_TRANSCRIPT)}</p>
          <div className="st-foot">
            <span className="st-meta">{words} {words === 1 ? "word" : "words"}</span>
            <div className="st-actions">
              <button type="button" className="as-plain" onClick={copyTranscript} disabled={!transcript}>Copy transcript</button>
              <button type="button" className="as-plain" onClick={clear} disabled={!transcript}>Clear</button>
            </div>
          </div>
          {/* Rendered before the first copy so screen readers announce the result. */}
          <p className="st-meta st-copy-status" role="status">{note}</p>
        </section>

        <p className="as-note">Method: the Web Speech API (SpeechRecognition). Browser support and microphone permission apply. This app stores and sends nothing; the transcript stays only in this tab until you clear it or close the tab.</p>
      </main>
      <AppFoot source={SOURCE} />
    </div>
  );
}

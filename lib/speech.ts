// Pure helpers for the Voice Booth page: no DOM access except through the window object passed in.

export type RecognitionResult = { length: number; [index: number]: { 0: { transcript: string } } };
export type RecognitionEvent = { results: RecognitionResult };
export type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
export type RecognitionConstructor = new () => Recognition;

export type Status = "READY" | "LISTENING" | "STOPPED" | "ERROR" | "UNAVAILABLE";

export const INITIAL_TRANSCRIPT = "Click start, speak a sentence, and let the browser set it down here.";
export const UNAVAILABLE_TRANSCRIPT =
  "SpeechRecognition is not available in this browser. Try Chrome or Edge with microphone permission.";

/** The standard constructor wins over the webkit-prefixed one; undefined when the browser has neither. */
export function getRecognitionConstructor(win: unknown): RecognitionConstructor | undefined {
  const browser = (win ?? {}) as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return browser.SpeechRecognition || browser.webkitSpeechRecognition;
}

/** Joins every recognition result (final and interim) into one transcript line. */
export function joinTranscript(results: RecognitionResult): string {
  const parts: string[] = [];
  for (let index = 0; index < results.length; index += 1) {
    const text = results[index]?.[0]?.transcript?.trim();
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** When the browser ends a session on its own, a live take becomes STOPPED; ERROR and others are kept. */
export function statusAfterEnd(current: Status): Status {
  return current === "LISTENING" ? "STOPPED" : current;
}

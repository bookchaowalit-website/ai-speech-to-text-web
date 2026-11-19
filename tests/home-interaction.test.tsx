// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import type { Recognition, RecognitionEvent } from "@/lib/speech";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;
const made: FakeRecognition[] = [];
const last = () => made[made.length - 1];
const $ = <T extends Element = HTMLElement>(selector: string) => host.querySelector(selector) as T | null;
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith(text)) as HTMLButtonElement;
const press = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });

class FakeRecognition implements Recognition {
  continuous = false;
  interimResults = false;
  onresult: ((event: RecognitionEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  constructor() { made.push(this); }
}

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Home />));
}

beforeEach(() => { made.length = 0; });
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
});

describe("recorder", () => {
  it("says plainly when the browser has no speech recognition", () => {
    mount();
    press(button("Start recording"));
    expect(host.textContent).toContain("Not supported here");
    expect($(".st-callout")!.textContent).toContain("not available in this browser");
  });

  it("records, shows the transcript, stops, copies and clears back to the empty state", async () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    expect(last().start).toHaveBeenCalled();
    expect(host.textContent).toContain("Listening");
    expect($(".st-paper")!.textContent).toContain("start speaking");
    act(() => last().onresult!({ results: { length: 2, 0: { 0: { transcript: "hello there" } }, 1: { 0: { transcript: " friend " } } } }));
    expect($(".st-paper")!.textContent).toBe("hello there friend");
    expect(host.textContent).toContain("3 words");
    press(button("Stop"));
    expect(last().stop).toHaveBeenCalled();
    expect(button("Record again")).toBeTruthy();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(async () => { button("Copy transcript").click(); });
    expect(writeText).toHaveBeenCalledWith("hello there friend");
    expect(host.textContent).toContain("Transcript copied.");
    writeText.mockRejectedValueOnce(new Error("blocked"));
    await act(async () => { button("Copy transcript").click(); });
    expect(host.textContent).toContain("Copy was blocked");

    press(button("Clear"));
    expect($(".st-paper")!.textContent).toContain("No transcript yet");
    expect(host.textContent).toContain("Ready");
  });

  it("reports a recognition error and ends a take the browser closes itself", () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    act(() => last().onend!());
    expect(host.textContent).toContain("Stopped");
    press(button("Record again"));
    act(() => last().onerror!());
    expect(host.textContent).toContain("Recognition stopped with an error");
  });
});

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

  it("announces the fix, not only the status, when the browser cannot record", () => {
    mount();
    const region = $(".st-callouts")!;
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toBe("");
    press(button("Start recording"));
    expect($(".st-callouts")).toBe(region);
    expect(region.textContent).toContain("not available in this browser");
  });

  it("renders the copy status region before the first copy", () => {
    mount();
    const region = $(".st-copy-status")!;
    expect(region.getAttribute("role")).toBe("status");
    expect(region.textContent).toBe("");
  });

  it("drops the Copied state when the transcript keeps changing", async () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    act(() => last().onresult!({ results: { length: 1, 0: { 0: { transcript: "one" } } } }));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(async () => { button("Copy transcript").click(); });
    expect($(".st-copy-status")!.textContent).toBe("Transcript copied.");
    act(() => last().onresult!({ results: { length: 2, 0: { 0: { transcript: "one" } }, 1: { 0: { transcript: " two" } } } }));
    expect($(".st-copy-status")!.textContent).toBe("");
  });

  it("does not show a late copy result for a transcript that has since changed", async () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    act(() => last().onresult!({ results: { length: 1, 0: { 0: { transcript: "one" } } } }));
    let finish!: () => void;
    const writeText = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    act(() => { button("Copy transcript").click(); });
    act(() => last().onresult!({ results: { length: 2, 0: { 0: { transcript: "one" } }, 1: { 0: { transcript: " two" } } } }));
    await act(async () => { finish(); });
    expect($(".st-copy-status")!.textContent).toBe("");
  });

  it("does not promise the transcript is gone when you leave the page", () => {
    mount();
    expect(host.textContent).not.toContain("gone when you leave the page");
    expect($(".as-note")!.textContent).toContain("stores and sends nothing");
  });

  it("does not bring an old Copied back when the same words are dictated after Clear", async () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    const one = { results: { length: 1, 0: { 0: { transcript: "one" } } } };
    act(() => last().onresult!(one));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(async () => { button("Copy transcript").click(); });
    expect($(".st-copy-status")!.textContent).toBe("Transcript copied.");
    press(button("Clear"));
    act(() => last().onresult!(one));
    expect($(".st-copy-status")!.textContent).toBe("");
  });

  it("lets only the latest copy request report", async () => {
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
    mount();
    press(button("Start recording"));
    act(() => last().onresult!({ results: { length: 1, 0: { 0: { transcript: "one" } } } }));
    const finishers: Array<() => void> = [];
    const failers: Array<(e: Error) => void> = [];
    const writeText = vi.fn(() => new Promise<void>((resolve, reject) => { finishers.push(resolve); failers.push(reject); }));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    act(() => { button("Copy transcript").click(); });
    act(() => { button("Copy transcript").click(); });
    await act(async () => { finishers[1](); });
    expect($(".st-copy-status")!.textContent).toBe("Transcript copied.");
    await act(async () => { failers[0](new Error("late")); });
    expect($(".st-copy-status")!.textContent).toBe("Transcript copied.");
  });
});

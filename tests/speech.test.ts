import { describe, expect, it } from "vitest";
import { countWords, getRecognitionConstructor, joinTranscript, statusAfterEnd, type RecognitionResult } from "@/lib/speech";

function results(...texts: string[]): RecognitionResult {
  const list: RecognitionResult = { length: texts.length };
  texts.forEach((transcript, index) => {
    list[index] = { 0: { transcript } };
  });
  return list;
}

describe("getRecognitionConstructor", () => {
  class Standard {}
  class Webkit {}

  it("prefers the standard SpeechRecognition constructor", () => {
    expect(getRecognitionConstructor({ SpeechRecognition: Standard, webkitSpeechRecognition: Webkit })).toBe(Standard);
  });

  it("falls back to the webkit-prefixed constructor", () => {
    expect(getRecognitionConstructor({ webkitSpeechRecognition: Webkit })).toBe(Webkit);
  });

  it("returns undefined when the browser has neither (or no window)", () => {
    expect(getRecognitionConstructor({})).toBeUndefined();
    expect(getRecognitionConstructor(undefined)).toBeUndefined();
  });
});

describe("joinTranscript", () => {
  it("joins every result with single spaces and trims each piece", () => {
    expect(joinTranscript(results("hello there ", " general", "kenobi"))).toBe("hello there general kenobi");
  });

  it("skips empty interim results instead of leaving double spaces", () => {
    expect(joinTranscript(results("one", "  ", "", "two"))).toBe("one two");
  });

  it("returns an empty string for no results", () => {
    expect(joinTranscript(results())).toBe("");
  });
});

describe("countWords", () => {
  it("counts words across any whitespace", () => {
    expect(countWords("  one\ttwo\nthree   four ")).toBe(4);
  });

  it("is zero for blank text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("statusAfterEnd", () => {
  it("turns a live take into STOPPED when the browser ends the session", () => {
    expect(statusAfterEnd("LISTENING")).toBe("STOPPED");
  });

  it("keeps an ERROR (or any other status) so the cause stays visible", () => {
    expect(statusAfterEnd("ERROR")).toBe("ERROR");
    expect(statusAfterEnd("STOPPED")).toBe("STOPPED");
  });
});

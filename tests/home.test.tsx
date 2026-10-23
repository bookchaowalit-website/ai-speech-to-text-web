import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("home page", () => {
  it("renders the booth, the starting transcript and the browser-only limits notice", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Let the browser catch the room.");
    expect(html).toContain("Start recording");
    expect(html).toContain("Click start, speak a sentence");
    expect(html).toContain("BROWSER MICROPHONE · NO CLOUD KEY");
    expect(html).toContain("LIMIT / browser support and microphone permission apply");
  });

  it("starts READY with Stop disabled", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("READY");
    expect(html).toMatch(/<button[^>]*class="voice-stop"[^>]*disabled/);
  });
});

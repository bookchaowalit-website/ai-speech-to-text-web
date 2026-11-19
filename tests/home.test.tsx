import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("home page", () => {
  it("renders the recorder on the App shell, the empty transcript state and the browser-only limits", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Let the browser catch the room.");
    expect(html).toContain('class="as-top"');
    expect(html).toContain("Start recording");
    expect(html).toContain("No transcript yet. Press Start recording");
    expect(html).toContain("No API key is used.");
    expect(html).toContain("Browser support and microphone permission apply.");
    expect(html).toContain('href="https://bookchaowalit.com/"');
  });

  it("starts Ready with Stop, Copy and Clear disabled", () => {
    const html = renderToString(<Home />);
    expect(html).toContain(">Ready<");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Stop</);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Copy transcript</);
  });
});

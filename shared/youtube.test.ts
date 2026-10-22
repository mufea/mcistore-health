import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl, getYouTubeVideoId, isYouTubeUrl } from "./youtube";

describe("YouTube URL helpers", () => {
  it("accepts watch and short YouTube links", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=12")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("rejects non-YouTube hosts and malformed video IDs", () => {
    expect(isYouTubeUrl("https://vimeo.com/123456789")).toBe(false);
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(getYouTubeEmbedUrl("not-a-url")).toBeNull();
  });
});

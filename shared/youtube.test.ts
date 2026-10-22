import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId, isYouTubeUrl } from "./youtube";

describe("YouTube URL helpers", () => {
  it("accepts watch and short YouTube links", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=12")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(getYouTubeThumbnailUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
  });

  it("rejects non-YouTube hosts and malformed video IDs", () => {
    expect(isYouTubeUrl("https://vimeo.com/123456789")).toBe(false);
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(getYouTubeEmbedUrl("not-a-url")).toBeNull();
  });
});

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

function parseYouTubeUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

/** Returns true only for supported YouTube watch, short, embed, or youtu.be links. */
export function isYouTubeUrl(value: string): boolean {
  return Boolean(getYouTubeVideoId(value));
}

export function getYouTubeVideoId(value: string): string | null {
  const url = parseYouTubeUrl(value);
  if (!url) return null;

  const host = url.hostname.toLowerCase();
  let videoId = "";

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "watch") videoId = url.searchParams.get("v") ?? "";
    else if (["shorts", "embed", "live"].includes(segments[0] ?? "")) videoId = segments[1] ?? "";
  }

  return /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? videoId : null;
}

export function getYouTubeEmbedUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

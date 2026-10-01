// Shared helpers for choosing and driving the site's films.

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Pick the smaller export unless the screen actually needs the larger one.
// Conservative by default: only big, high-density screens get 1080p.
export function pickFilm(small: string, large: string, cssWidth = window.innerWidth): string {
  const devicePixels = cssWidth * Math.min(window.devicePixelRatio || 1, 2);
  return devicePixels > 1600 ? large : small;
}

// Keeps at most one seek in flight. Only the latest requested time is applied,
// so fast scrolling never queues up stale seeks.
export function createSeekController(video: HTMLVideoElement) {
  let target: number | null = null;
  let seeking = false;
  let watchdog: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (seeking || target === null || video.readyState < 1) return;
    if (Math.abs(video.currentTime - target) < 0.04) { target = null; return; }
    seeking = true;
    const t = target;
    target = null;
    video.currentTime = t;
    // Recover if a seek never settles (e.g. interrupted load)
    watchdog = setTimeout(onSeeked, 1500);
  };

  function onSeeked() {
    if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    seeking = false;
    flush();
  }

  video.addEventListener("seeked", onSeeked);
  video.addEventListener("loadedmetadata", flush);

  return {
    seekTo(t: number) { target = t; flush(); },
    destroy() {
      if (watchdog) clearTimeout(watchdog);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", flush);
    },
  };
}

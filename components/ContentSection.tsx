"use client";

import { useRef, useEffect, useState } from "react";

const FONT_FAMILY = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_WEIGHT = 400;

const WORDS = ["DEFINE", "DECODE", "DESIGN", "DISCOVER", "DEPLOY", "DEVELOP"];

const DESCRIPTIONS: Record<string, string> = {
  DEFINE:   "FRAME is an applied model of human motivation—a tool for navigating work, life, and relationships with greater clarity and insight. It looks beyond behavior, skills, and strengths to reveal the underlying architecture shaping how you experience the world.",
  DECODE:   "FRAME provides a system for interpreting the recurring patterns that drive how people perceive situations, evaluate decisions, pursue meaning, and engage with others. It doesn't assign labels or prescribe a type. It offers something more useful: a method for making patterns visible, coherent, and actionable.",
  DESIGN:   "FRAME was built to be used. For nearly a decade, it has been implemented in moments that demand more than instinct: what to choose, who to trust, how to lead, when to change, why groups succeed—or don't—and where to aim when the path is unclear.",
  DISCOVER: "FRAME begins with an in-depth assessment that identifies a person's core motivational drivers. The result is an individualized profile—the starting point for applying FRAME across decisions, transitions, friction, and growth.",
  DEPLOY:   "FRAME works one-on-one and at scale. Individual engagements are highly actionable—focused on the questions, roadblocks, and decisions that keep resurfacing. Team and organizational engagements bring that same precision to groups, revealing how motivational differences influence communication, collaboration, and leadership.",
  DEVELOP:  "FRAME evolves with the individuals and organizations it serves, becoming increasingly valuable as circumstances shift, new decisions emerge, and relationships change. Designed to integrate with generative AI, FRAME is an adaptive system that extends beyond the limits of a fixed model.",
};

// Video timestamps (seconds) at each word boundary: [before DEFINE, after DEFINE, after DECODE, ...]
const VIDEO_TIMESTAMPS = [0, 3, 6, 9, 11, 14, 17];

const ACCORDION_START = 1100;
const SEGMENT_SIZE   = 500;
const ZOOM_START     = 4100;   // must match ThirdSection

export default function ContentSection() {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const activeIdxRef   = useRef(-1);
  const timeHandlerRef = useRef<(() => void) | null>(null);
  const [scrollIndex, setScrollIndex] = useState(-1);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale]   = useState(1);

  // The displayed active index: manual click overrides scroll; scroll clears the manual pin
  const activeIndex = manualIndex !== null ? manualIndex : scrollIndex;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playSegment = (idx: number) => {
      if (timeHandlerRef.current) {
        video.removeEventListener("timeupdate", timeHandlerRef.current);
        timeHandlerRef.current = null;
      }

      if (idx < 0) {
        video.pause();
        video.currentTime = 0;
        return;
      }

      const start = VIDEO_TIMESTAMPS[idx];
      const end   = VIDEO_TIMESTAMPS[idx + 1];

      video.currentTime = start;

      const onTimeUpdate = () => {
        if (video.currentTime >= end) {
          video.pause();
          video.currentTime = end;
          video.removeEventListener("timeupdate", onTimeUpdate);
          timeHandlerRef.current = null;
        }
      };

      timeHandlerRef.current = onTimeUpdate;
      video.addEventListener("timeupdate", onTimeUpdate);
      video.playbackRate = 4;
      video.play().catch(() => {});
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const accordionScroll = scrollY - ACCORDION_START;

      const newIndex =
        accordionScroll < 0
          ? -1
          : Math.min(5, Math.floor(accordionScroll / SEGMENT_SIZE));

      if (newIndex !== activeIdxRef.current) {
        activeIdxRef.current = newIndex;
        setScrollIndex(newIndex);
        setManualIndex(null);
        playSegment(newIndex);
      }

      // Zoom into white when accordion finishes
      if (scrollY > ZOOM_START) {
        const zProgress = Math.min(1, (scrollY - ZOOM_START) / 500);
        setZoomScale(1 + zProgress * 2.5);
      } else {
        setZoomScale(1);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeHandlerRef.current) {
        video.removeEventListener("timeupdate", timeHandlerRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();

      const current = activeIdxRef.current;
      const next =
        e.key === "ArrowDown"
          ? Math.min(5, current + 1)
          : Math.max(0, current - 1);

      if (next === current) return;

      const targetY = ACCORDION_START + next * SEGMENT_SIZE + 250;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleWordClick = (i: number) => {
    setManualIndex(prev => prev === i ? null : i);
  };

  const displayIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <section
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        display: "flex",
        height: "100vh",
        background: "#ffffff",
        overflow: "hidden",
        transform: zoomScale > 1 ? `scale(${zoomScale})` : undefined,
        transformOrigin: "center 60%",
      }}
    >
      <style suppressHydrationWarning>{`
        /* ── Mobile: full-bleed video with word overlay at bottom ── */
        @media (max-width: 767px) {
          .cs-left  { display: none !important; }
          .cs-right {
            width: 100% !important;
            position: absolute !important;
            inset: 0 !important;
          }
          .cs-mobile-overlay { display: flex !important; }
          .cs-video-dark { display: block !important; }
        }
      `}</style>

      {/* ── Left half — accordion (desktop only) ─────────────────────── */}
      <div
        className="cs-left"
        style={{
          width: "50%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "16vh 4vw 4vh 4vw",
          overflow: "hidden",
        }}
      >
        <div>
          {WORDS.map((word, i) => (
            <div key={word}>
              <div
                onClick={() => handleWordClick(i)}
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: FONT_WEIGHT,
                  fontSize: "clamp(44px, 5.5vw, 86px)",
                  lineHeight: 0.9,
                  color: activeIndex === i ? "#1a1a1a" : "#c8c8c8",
                  letterSpacing: "-0.01em",
                  userSelect: "none",
                  transition: "color 0.35s ease",
                  cursor: "pointer",
                }}
              >
                {word}
              </div>

              <div
                style={{
                  maxHeight: activeIndex === i ? "300px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: FONT_WEIGHT,
                    fontSize: "clamp(17px, 1.55vw, 25px)",
                    lineHeight: 1.5,
                    color: "#1a1a1a",
                    margin: "0.7em 0 0.5em 0",
                    paddingRight: "1vw",
                    opacity: activeIndex === i ? 1 : 0,
                    transition: "opacity 0.35s ease 0.1s",
                  }}
                >
                  {DESCRIPTIONS[word]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right half — video ──────────────────────────────────────────── */}
      <div className="cs-right" style={{ width: "50%", position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/assets/section2.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay — mobile only, improves text legibility */}
        <div
          className="cs-video-dark"
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Mobile word overlay — bottom of screen ──────────────────────── */}
      <div
        className="cs-mobile-overlay"
        style={{
          display: "none", // shown via CSS on mobile
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "0 1.5rem 2.5rem",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        {/* Word counter */}
        <div style={{
          fontFamily: FONT_FAMILY,
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "0.5rem",
        }}>
          {String(displayIndex + 1).padStart(2, "0")} / 06
        </div>

        {/* Active word */}
        <div style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 300,
          fontSize: "clamp(48px, 14vw, 72px)",
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: "#ffffff",
          lineHeight: 0.9,
          marginBottom: "1rem",
          transition: "opacity 0.3s",
        }}>
          {WORDS[displayIndex]}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 300,
          fontSize: "13px",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.82)",
          maxWidth: "340px",
          transition: "opacity 0.3s",
        }}>
          {DESCRIPTIONS[WORDS[displayIndex]]}
        </div>

        {/* Dot navigation */}
        <div style={{
          position: "absolute",
          right: "1.25rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}>
          {WORDS.map((_, i) => (
            <div
              key={i}
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: i === displayIndex ? "#ffffff" : "rgba(255,255,255,0.3)",
                transform: i === displayIndex ? "scale(1.4)" : "scale(1)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

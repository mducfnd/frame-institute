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

    // Play the video segment for a given word index at natural speed,
    // pausing automatically when the segment ends.
    const playSegment = (idx: number) => {
      // Remove any in-progress timeupdate handler
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

      // Jump to the start of this segment and play
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

      // When scroll-driven index changes, clear manual pin so scroll takes over
      if (newIndex !== activeIdxRef.current) {
        activeIdxRef.current = newIndex;
        setScrollIndex(newIndex);
        setManualIndex(null);
        playSegment(newIndex);
      }

      // Zoom into white when accordion finishes
      if (scrollY > ZOOM_START) {
        const zProgress = Math.min(1, (scrollY - ZOOM_START) / 500);
        setZoomScale(1 + zProgress * 2.5); // 1 → 3.5
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

  // Keyboard navigation: ArrowDown / ArrowUp scroll to the next/prev word
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
      {/* ── Left half ────────────────────────────────────────────────── */}
      <div
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

        {/* Accordion */}
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

              {/* Description — ~2× the previous size */}
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

      {/* ── Right half — segment-played video (one turn per word) ──────── */}
      <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>
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
      </div>
    </section>
  );
}

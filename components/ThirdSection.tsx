"use client";
import { useRef, useEffect, useState } from "react";

const FONT_FAMILY    = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const ZOOM_START     = 6700;
const ZOOM_END       = 7200;
const VIDEO_DURATION = 1.87;
// YOU darkening: relative to when text first appears, not absolute scroll
// 400px grace → gray, then 600px transition → black
const YOU_GRACE   = 400;
const YOU_RANGE   = 600;

export default function ThirdSection() {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const prevYRef     = useRef(0);
  const revRAFRef    = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);

  const textAppearedAtRef = useRef<number | null>(null); // scroll Y when text first appeared
  const [panelOpacity, setPanelOpacity] = useState(0);
  const [vidOpacity,   setVidOpacity]   = useState(1);
  const [textVisible,  setTextVisible]  = useState(false);
  const [youProgress,  setYouProgress]  = useState(0); // 0=gray, 1=black

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const stopReverse = () => {
      if (revRAFRef.current !== null) {
        cancelAnimationFrame(revRAFRef.current);
        revRAFRef.current = null;
      }
    };

    const stepReverse = () => {
      const v = videoRef.current;
      if (!v) return;
      const next = v.currentTime - 0.032;
      if (next <= 0) {
        v.currentTime = 0;
        revRAFRef.current = null;
        setVidOpacity(0);
        setTextVisible(false);
      } else {
        v.currentTime = next;
        revRAFRef.current = requestAnimationFrame(stepReverse);
      }
    };

    // Record scroll position when text first appears so YOU can darken relative to that
    const markTextAppeared = () => {
      if (textAppearedAtRef.current === null) {
        textAppearedAtRef.current = window.scrollY;
      }
      setTextVisible(true);
    };

    // Start fading words in during the last 0.5s of the video
    // so they arrive *with* the ending rather than after it
    video.addEventListener("timeupdate", () => {
      if (video.currentTime >= VIDEO_DURATION - 0.5) {
        markTextAppeared();
      }
    });

    // Video fully done → fade the video out quickly (words already appearing)
    video.addEventListener("ended", () => {
      hasPlayedRef.current = true;
      setVidOpacity(0);
      markTextAppeared();
    });

    const onScroll = () => {
      const y = window.scrollY;
      const prevY = prevYRef.current;
      prevYRef.current = y;
      const goingDown = y > prevY;

      setPanelOpacity(Math.min(1, Math.max(0,
        (y - ZOOM_START) / (ZOOM_END - ZOOM_START)
      )));
      // Darken YOU relative to where text appeared, not absolute scroll
      if (textAppearedAtRef.current !== null) {
        const rel = y - textAppearedAtRef.current;
        setYouProgress(Math.min(1, Math.max(0,
          (rel - YOU_GRACE) / YOU_RANGE
        )));
      } else {
        setYouProgress(0);
      }

      if (y >= ZOOM_END) {
        if (goingDown) {
          stopReverse();
          if (!hasPlayedRef.current && (video.paused || video.ended)) {
            video.currentTime = 0;
            setVidOpacity(1);
            setTextVisible(false);
            video.play().catch(() => {});
          }
        } else {
          if (textVisible) setTextVisible(false);
          if (!video.paused) video.pause();
          if (video.currentTime > 0 && revRAFRef.current === null) {
            setVidOpacity(1);
            revRAFRef.current = requestAnimationFrame(stepReverse);
          }
          if (video.currentTime === 0) hasPlayedRef.current = false;
        }
      } else {
        stopReverse();
        video.pause();
        video.currentTime = 0;
        setVidOpacity(1);
        setTextVisible(false);
        hasPlayedRef.current = false;
        textAppearedAtRef.current = null; // reset so next play is fresh
        setYouProgress(0);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      stopReverse();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        background: "#ffffff",
        opacity: panelOpacity,
        pointerEvents: panelOpacity > 0.05 ? "auto" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/assets/transition.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 2,
          opacity: vidOpacity,
          transition: "opacity 0.25s ease",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.04em",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: "clamp(22px, 3vw, 46px)",
            letterSpacing: "0.14em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#c4c4c4" }}>FRAME MAKES </span>
          <span style={{ color: `rgb(${Math.round(196 * (1 - youProgress))}, ${Math.round(196 * (1 - youProgress))}, ${Math.round(196 * (1 - youProgress))})` }}>YOU</span>
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: "clamp(22px, 3vw, 46px)",
            letterSpacing: "0.14em",
            lineHeight: 1,
            color: "#c4c4c4",
            whiteSpace: "nowrap",
          }}
        >
          MAKE SENSE
        </div>
      </div>
    </div>
  );
}

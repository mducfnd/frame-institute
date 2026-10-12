"use client";

import { useEffect, useRef, useState } from "react";

const FONT_BLACK = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SLT   = "'nitti-grotesk-semilight', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function IntensivePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  if (isMobile) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100svh", overflow: "hidden" }}>
        {/* Full-screen video background on mobile */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          src="/intensive-hero.mp4"
        />
        {/* Semi-transparent overlay + text */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.72)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 1.75rem",
        }}>
          <h1 style={{
            fontFamily: FONT_BLACK,
            fontWeight: 900,
            fontSize: "clamp(42px, 11vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "#1a1a1a",
            margin: 0,
          }}>
            The Intensive.
          </h1>
          <p style={{
            fontFamily: FONT_SLT,
            fontWeight: 300,
            fontSize: "15px",
            lineHeight: 1.55,
            letterSpacing: "0.01em",
            color: "#8c8a8a",
            marginTop: "18px",
            maxWidth: "340px",
          }}>
            Four weeks to identify, apply, and integrate your motivational architecture.
          </p>
        </div>
      </div>
    );
  }

  // Desktop: left text panel + right video panel
  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* Left text panel — ~45% */}
      <div style={{
        width: "45%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: "clamp(48px, 5vw, 88px)",
        paddingRight: "3vw",
        backgroundColor: "#ffffff",
      }}>
        <h1 style={{
          fontFamily: FONT_BLACK,
          fontWeight: 900,
          fontSize: "clamp(52px, 5.2vw, 84px)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: "#1a1a1a",
          margin: 0,
        }}>
          The Intensive.
        </h1>
        <p style={{
          fontFamily: FONT_SLT,
          fontWeight: 300,
          fontSize: "clamp(13px, 1.1vw, 16px)",
          lineHeight: 1.55,
          letterSpacing: "0.01em",
          color: "#8c8a8a",
          marginTop: "clamp(16px, 1.6vw, 24px)",
          maxWidth: "380px",
        }}>
          Four weeks to identify, apply, and integrate your motivational architecture.
        </p>
      </div>

      {/* Right video panel — ~55% */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          src="/intensive-hero.mp4"
        />
      </div>
    </div>
  );
}

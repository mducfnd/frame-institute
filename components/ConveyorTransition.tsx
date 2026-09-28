"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const OLD_LINE1 = "Beyond behavior. Smarter than strengths.";
const OLD_LINE2 = "FRAME reveals the underlying architecture shaping how you experience the world.";
const NEW_TEXT  = "FRAME MAKES YOU MAKE SENSE";

export default function ConveyorTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Slide the entire track one full viewport width to the left.
      // Old text (panel 1) exits left; new text (panel 2) enters from right.
      // ease:"none" + scrub:true = 1:1 with scroll, fully reversible.
      gsap.to(trackRef.current, {
        x: "-100vw",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=900",        // 900px of scroll = one full conveyor pass
          pin: true,           // hold the section in place while track slides
          scrub: true,
          anticipatePin: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const base: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "clamp(28px, 4vw, 60px)",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    whiteSpace: "normal",
  };

  const panel: React.CSSProperties = {
    width: "100vw",
    height: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "flex-start",
    padding: "13vh 8vw 0",
    boxSizing: "border-box",
  };

  return (
    <section
      ref={sectionRef}
      style={{ width: "100%", background: "#ffffff" }}
    >
      {/* overflow:hidden clips both panels so only the active one is visible */}
      <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            width: "200vw",
            height: "100%",
            willChange: "transform",
          }}
        >
          {/* ── Panel 1: old copy ── */}
          <div style={panel}>
            <div style={{ maxWidth: "1100px", width: "100%" }}>
              <p style={{ ...base, color: "#000000", marginBottom: "0.45em" }}>
                {OLD_LINE1}
              </p>
              <p style={{ ...base, color: "#000000" }}>
                {OLD_LINE2}
              </p>
            </div>
          </div>

          {/* ── Panel 2: new copy, starts fully off-screen right ── */}
          <div style={panel}>
            <div style={{ maxWidth: "1100px", width: "100%" }}>
              <p style={{ ...base, color: "#1B2CC1" }}>
                {NEW_TEXT}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

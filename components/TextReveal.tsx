"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const LINE1 = "Beyond behavior. Smarter than strengths.";
const LINE2 = "FRAME reveals the underlying architecture shaping how you experience the world.";

const GRAY_VAL = 200;
function colorAt(t: number): string {
  const v = Math.round(GRAY_VAL * (1 - t));
  return `rgb(${v},${v},${v})`;
}

// Line 1: gray words appear immediately; black reveal starts at L1_REV_START
const L1_REV_START  = 0.00;
const L1_REV_END    = 0.35;

// Line 2: fade in while L1 finishes; then its own word reveal
const L2_FADE_START = 0.30;
const L2_FADE_END   = 0.45;
const L2_REV_START  = 0.43;
const L2_REV_END    = 1.00;

export default function TextReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const line2Ref   = useRef<HTMLParagraphElement>(null);
  const words1Ref  = useRef<HTMLSpanElement[]>([]);
  const words2Ref  = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const w1 = words1Ref.current.filter(Boolean);
    const w2 = words2Ref.current.filter(Boolean);
    const l2 = line2Ref.current;
    if (!w1.length || !w2.length || !l2) return;

    w1.forEach(w => { w.style.color = colorAt(0); });
    w2.forEach(w => { w.style.color = colorAt(0); });
    l2.style.opacity = "0";

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=700",       // 700px explicit scrub — no ambiguity
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Line 1: sit gray until L1_REV_START, then quick reveal
        const p1 = Math.max(0, Math.min(1,
          (p - L1_REV_START) / (L1_REV_END - L1_REV_START)
        ));
        const f1 = p1 * w1.length;
        w1.forEach((w, i) => {
          w.style.color = colorAt(Math.max(0, Math.min(1, f1 - i)));
        });

        // Line 2 fade-in
        const fadeT = Math.max(0, Math.min(1,
          (p - L2_FADE_START) / (L2_FADE_END - L2_FADE_START)
        ));
        l2.style.opacity = String(fadeT);

        // Line 2 word reveal
        const p2 = Math.max(0, Math.min(1,
          (p - L2_REV_START) / (L2_REV_END - L2_REV_START)
        ));
        const f2 = p2 * w2.length;
        w2.forEach((w, i) => {
          w.style.color = colorAt(Math.max(0, Math.min(1, f2 - i)));
        });
      },
    });

    return () => st.kill();
  }, []);

  const sharedStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "clamp(28px, 4vw, 60px)",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    textAlign: "left",
    color: colorAt(0),
  };

  const line1Words = LINE1.split(" ");
  const line2Words = LINE2.split(" ");

  return (
    <section
      ref={sectionRef}
      style={{ position: "relative", height: "180vh", background: "#ffffff" }}
    >
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        padding: "13vh 8vw 0",
      }}>
        <div style={{ maxWidth: "1100px", width: "100%" }}>

          <p style={{ ...sharedStyle, marginBottom: "0.45em" }}>
            {line1Words.map((word, i) => (
              <span key={i}>
                <span ref={el => { if (el) words1Ref.current[i] = el; }}
                  style={{ color: colorAt(0) }}>
                  {word}
                </span>
                {i < line1Words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>

          <p ref={line2Ref} style={{ ...sharedStyle, opacity: 0 }}>
            {line2Words.map((word, i) => (
              <span key={i}>
                <span ref={el => { if (el) words2Ref.current[i] = el; }}
                  style={{ color: colorAt(0) }}>
                  {word}
                </span>
                {i < line2Words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>

        </div>
      </div>
    </section>
  );
}

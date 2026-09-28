"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const LINE1    = "Beyond behavior. Smarter than strengths.";
const LINE2    = "FRAME reveals the underlying architecture shaping how you experience the world.";
const NEW_TEXT = "FRAME MAKES YOU MAKE SENSE";

const GRAY_VAL = 200;
function colorAt(t: number): string {
  const v = Math.round(GRAY_VAL * (1 - t));
  return `rgb(${v},${v},${v})`;
}

// Total pinned scroll: 1500px
// Phase 1 (word reveal): progress 0.00 → 0.40
// Phase 2 (collision):   progress 0.40 → 1.00
const P1_END        = 0.40;
const L1_END        = 0.14;
const L2_FADE_START = 0.12;
const L2_FADE_END   = 0.18;
const L2_REV_START  = 0.17;
const L2_REV_END    = 0.40;

// Phase 2 timing for the collision
// Blue enters immediately; black starts exiting when blue has crossed ~45% of the screen
const BLACK_EXIT_START = 0.45;  // conveyorP when black begins to slide left

export default function TextSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const oldPanelRef = useRef<HTMLDivElement>(null);
  const newPanelRef = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLParagraphElement>(null);
  const words1Ref   = useRef<HTMLSpanElement[]>([]);
  const words2Ref   = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const w1       = words1Ref.current.filter(Boolean);
    const w2       = words2Ref.current.filter(Boolean);
    const l2       = line2Ref.current;
    const oldPanel = oldPanelRef.current;
    const newPanel = newPanelRef.current;
    if (!w1.length || !w2.length || !l2 || !oldPanel || !newPanel) return;

    // Initial state
    w1.forEach(w => { w.style.color = colorAt(0); });
    w2.forEach(w => { w.style.color = colorAt(0); });
    l2.style.opacity = "0";
    newPanel.style.transform = `translateX(${window.innerWidth}px)`;
    oldPanel.style.transform  = "translateX(0px)";
    oldPanel.style.opacity    = "1";

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=1500",
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p  = self.progress;
        const vw = window.innerWidth;

        // ── Phase 1: word-by-word reveal ──────────────────────────────────
        const p1raw = Math.max(0, Math.min(1, p / L1_END));
        const f1    = p1raw * w1.length;
        w1.forEach((w, i) => {
          w.style.color = colorAt(Math.max(0, Math.min(1, f1 - i)));
        });

        const fadeT = Math.max(0, Math.min(1,
          (p - L2_FADE_START) / (L2_FADE_END - L2_FADE_START)
        ));
        l2.style.opacity = String(fadeT);

        const p2raw = Math.max(0, Math.min(1,
          (p - L2_REV_START) / (L2_REV_END - L2_REV_START)
        ));
        const f2 = p2raw * w2.length;
        w2.forEach((w, i) => {
          w.style.color = colorAt(Math.max(0, Math.min(1, f2 - i)));
        });

        // ── Phase 2: collision — blue in from right, black exits left ─────
        const conveyorP = Math.max(0, (p - P1_END) / (1 - P1_END)); // 0→1

        // Blue: sweeps from 100vw → 0 across the full Phase 2
        const blueX = (1 - conveyorP) * vw;
        newPanel.style.transform = `translateX(${blueX}px)`;

        // Black: holds, then starts sliding left once blue has crossed ~45% of screen
        const exitP = Math.max(0, Math.min(1,
          (conveyorP - BLACK_EXIT_START) / (1 - BLACK_EXIT_START)
        ));
        const blackX = -exitP * vw * 0.9;
        oldPanel.style.transform = `translateX(${blackX}px)`;
        // Fade out black as it exits (reaches 0 by the time it's fully off-screen)
        oldPanel.style.opacity = String(Math.max(0, 1 - exitP * 1.4));
      },
    });

    return () => st.kill();
  }, []);

  const line1Words = LINE1.split(" ");
  const line2Words = LINE2.split(" ");

  return (
    <section ref={sectionRef} style={{ width: "100%", background: "#ffffff" }}>
      <div style={{ overflow: "hidden", width: "100vw", height: "100vh", position: "relative" }}>

        {/* ── Old text panel — word reveal, then exits left ── */}
        <div
          ref={oldPanelRef}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100vw", height: "100%",
            display: "flex", alignItems: "flex-start",
            padding: "13vh 8vw 0",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "1100px", width: "100%" }}>
            <p style={{
              margin: 0,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(28px, 4vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: colorAt(0),
              marginBottom: "0.45em",
            }}>
              {line1Words.map((word, i) => (
                <span key={i}>
                  <span
                    ref={el => { if (el) words1Ref.current[i] = el; }}
                    style={{ color: colorAt(0) }}
                  >{word}</span>
                  {i < line1Words.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
            <p
              ref={line2Ref}
              style={{
                margin: 0,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "clamp(28px, 4vw, 60px)",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: colorAt(0),
                opacity: 0,
              }}
            >
              {line2Words.map((word, i) => (
                <span key={i}>
                  <span
                    ref={el => { if (el) words2Ref.current[i] = el; }}
                    style={{ color: colorAt(0) }}
                  >{word}</span>
                  {i < line2Words.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* ── New text panel — sweeps in from right ── */}
        <div
          ref={newPanelRef}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100vw", height: "100%",
            display: "flex", alignItems: "flex-start",
            padding: "29vh 0 0 8vw",
            boxSizing: "border-box",
            willChange: "transform",
          }}
        >
          <p style={{
            margin: 0,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "clamp(52px, 7.5vw, 110px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#1B2CC1",
            whiteSpace: "nowrap",
          }}>
            {NEW_TEXT}
          </p>
        </div>

      </div>
    </section>
  );
}

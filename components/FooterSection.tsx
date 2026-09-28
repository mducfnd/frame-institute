"use client";
import { useEffect, useRef, useState } from "react";

const FONT = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_LIGHT = "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const RISE_START = 7000;
const RISE_END   = 7700;

const LINE1 = "DISCOVER";
const LINE2 = "YOUR FRAME";

const BLINK_DELAY = "0.5s";

export default function FooterSection() {
  const [slideY,    setSlideY]    = useState(100);
  const [arrived,   setArrived]   = useState(false);
  const [animKey,   setAnimKey]   = useState(0);
  const [btnHovered, setBtnHovered] = useState(false);
  const arrivedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0,
        (y - RISE_START) / (RISE_END - RISE_START)
      ));
      const newSlideY = (1 - p) * 100;
      setSlideY(newSlideY);

      if (newSlideY < 2 && !arrivedRef.current) {
        arrivedRef.current = true;
        setArrived(true);
        setAnimKey(k => k + 1);
      } else if (newSlideY > 20 && arrivedRef.current) {
        arrivedRef.current = false;
        setArrived(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleHeadingEnter = () => { if (arrived) setAnimKey(k => k + 1); };
  const charDelay = (i: number) => `${i * 22}ms`;

  return (
    <>
      <style>{`
        @keyframes charLift {
          0%   { transform: translateY(0); }
          38%  { transform: translateY(-0.22em); }
          100% { transform: translateY(0); }
        }
        @keyframes blink {
          0%, 42%, 100% { opacity: 1; }
          50%, 92%      { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          background: "#000000",
          transform: `translateY(${slideY}%)`,
          overflow: "hidden",
          pointerEvents: slideY < 8 ? "auto" : "none",
        }}
      >
        {/* ── DISCOVER YOUR FRAME + START HERE ─────────────────────── */}
        <div
          onMouseEnter={handleHeadingEnter}
          style={{
            position: "absolute",
            top: "calc(9% + 30px)",
            left: "3%",
            cursor: "default",
          }}
        >
          {/* Heading */}
          <div style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "clamp(40px, 4.6vw, 76px)",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}>
            <div>
              {LINE1.split("").map((ch, i) => (
                <span key={`${animKey}-L1-${i}`} style={{
                  display: "inline-block",
                  animation: arrived
                    ? `charLift 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${charDelay(i)} both`
                    : "none",
                }}>{ch}</span>
              ))}
            </div>
            <div>
              {LINE2.split("").map((ch, i) => (
                <span key={`${animKey}-L2-${i}`} style={{
                  display: "inline-block",
                  animation: arrived
                    ? `charLift 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${charDelay(LINE1.length + i)} both`
                    : "none",
                }}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </div>
          </div>

          {/* START HERE button — flips white on hover, text stays blinking */}
          <a
            href="/connect"
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              marginTop: "clamp(20px, 3vh, 40px)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 clamp(24px, 2.2vw, 36px)",
              height: "clamp(46px, 9.1vh, 74px)",
              minWidth: "clamp(170px, 17vw, 270px)",
              background: btnHovered ? "#ffffff" : "transparent",
              border: "1.5px solid #ffffff",
              borderRadius: "5px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "background 0.25s ease",
            }}
          >
            <span style={{
              fontFamily: FONT_LIGHT,
              fontWeight: 400,
              fontSize: "clamp(16px, 1.5vw, 24px)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: btnHovered ? "#000000" : "#ffffff",
              transition: "color 0.25s ease",
              animation: (arrived && !btnHovered)
                ? `blink 1.6s ease-in-out ${BLINK_DELAY} infinite`
                : "none",
            }}>
              Start Here
            </span>
          </a>
        </div>

        {/* ── Bottom section: contact (163px above logo) + FRAME wordmark ── */}
        <div style={{ position: "absolute", bottom: "32px", left: 0, right: 0 }}>
          {/* Contact sits exactly 163px above the top of the FRAME logo */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "3%",
            paddingBottom: "163px",
          }}>
            <div style={{
              fontFamily: "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(19px, 1.95vw, 31px)",
              lineHeight: 1.12,
              color: "#ffffff",
              textAlign: "right",
            }}>
              <div>+1 646 386 0917</div>
              <div>hello@frame.institute</div>
              <div>224 W 35th St Ste 500</div>
              <div>New York, NY 10001</div>
            </div>
          </div>
          {/* FRAME wordmark — 3vw side margins matching the hero */}
          <img
            src="/assets/logo-footer-black.png"
            alt=""
            aria-hidden="true"
            style={{
              display: "block",
              marginLeft: "3vw",
              width: "calc(100% - 6vw)",
              height: "auto",
              filter: "brightness(0) invert(1)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

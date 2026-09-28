// @ts-nocheck
"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function Hero() {
  const sectionRef         = useRef<HTMLElement>(null);
  const logoRef            = useRef<HTMLImageElement>(null);
  const subtitleRef        = useRef<HTMLDivElement>(null);
  const arrowRef           = useRef<HTMLDivElement>(null);
  const videoRef           = useRef<HTMLVideoElement>(null);
  const videoWrapRef       = useRef<HTMLDivElement>(null);
  const maskedVideoRef     = useRef<HTMLVideoElement>(null);
  const maskedVideoWrapRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sequence: FRAME logo → background video + masked video + UI
  useEffect(() => {
    const logoEl          = logoRef.current;
    const video           = videoRef.current;
    const maskedVideo     = maskedVideoRef.current;
    const maskedVideoWrap = maskedVideoWrapRef.current;
    const subtitle        = subtitleRef.current;
    const arrow           = arrowRef.current;

   maskedVideo?.play().catch(() => {});


    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(logoEl, { autoAlpha: 1, duration: 1.1, ease: "power2.out" });
    tl.add(() => {
      video?.play().catch(() => {});
      gsap.to(video,          { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" });
      gsap.to(maskedVideoWrap, { autoAlpha: 0.18, duration: 1.1, ease: "power2.inOut" });
      gsap.to(subtitle,       { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
      gsap.to(arrow,          { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
    }, "+=0.25");

    return () => { tl.kill(); };
  }, []);

  // Scroll: zoom both video layers, fade logo + masked overlay + UI, fade section out
  useEffect(() => {
    const section         = sectionRef.current;
    const videoWrap       = videoWrapRef.current;
    const maskedVideoWrap = maskedVideoWrapRef.current;
    const logoEl          = logoRef.current;
    const subtitle        = subtitleRef.current;
    const arrow           = arrowRef.current;

    const SCROLL_TRAVEL = 900;

    const onScroll = () => {
      const p = Math.min(1, window.scrollY / SCROLL_TRAVEL);

      const scale = `scale(${1 + p * 1.2})`;
      videoWrap.style.transform       = scale;
      maskedVideoWrap.style.transform = scale;

      const textAlpha = Math.max(0, 1 - p / 0.45);
      logoEl.style.opacity            = String(textAlpha);
      maskedVideoWrap.style.opacity   = String(textAlpha * 0.18);
      subtitle.style.opacity          = String(textAlpha);
      arrow.style.opacity             = String(textAlpha);

      const heroAlpha = Math.max(0, 1 - Math.max(0, (p - 0.60) / 0.40));
      section.style.opacity = String(heroAlpha);
      section.style.pointerEvents = heroAlpha < 0.05 ? "none" : "auto";
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: "#d4dadc" }}
    >
      {/* ── Layer 1: Background video ──────────────────────────────────── */}
      <div
        ref={videoWrapRef}
        style={{
          position: "absolute", inset: 0,
          background: "#d4dadc",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        <video
          ref={videoRef}
          muted loop playsInline preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/assets/hero2.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Light overlay to brighten the background video ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(255,255,255,0.25)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* ── Layer 2: Masked video ── */}
      <div
        ref={maskedVideoWrapRef}
        style={{
          position: "absolute", inset: 0, zIndex: 11,
          WebkitMaskImage: "url(/assets/logo4.png)",
          maskImage: "url(/assets/logo4.png)",
          WebkitMaskSize: "calc(100% - 6vw) auto",
          maskSize: "calc(100% - 6vw) auto",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center center",
          maskPosition: "center center",
          transformOrigin: "center center",
          willChange: "transform",
          pointerEvents: "none",
        }}
      >
        <video
          ref={maskedVideoRef}
          muted loop playsInline preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/assets/hero2.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Top bar: subtitle centered ─────────────────────────────────── */}
      <div
        ref={subtitleRef}
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "5rem 2rem" : "1.75rem 2rem",
          pointerEvents: "none",
        }}
      >
        <div style={{
          fontFamily: "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 500,
          fontSize: "clamp(17px, 1.775vw, 25px)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#000000",
          textAlign: "center",
          lineHeight: 0.95,
        }}>
          THE ARCHITECTURE OF<br />HUMAN MOTIVATION
        </div>
      </div>

      {/* ── FRAME wordmark — vertically centered ──────────────────────── */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        padding: "0 3vw",
        pointerEvents: "none",
      }}>
        <div style={{ width: "100%" }}>
          <img
            ref={logoRef}
            src="/assets/logo4.png"
            alt="FRAME"
            style={{ display: "block", width: "100%", height: "auto", filter: "brightness(0)" }}
          />
        </div>
      </div>

      {/* ── Down chevron — bottom center ──────────────────────────────── */}
      <div
        ref={arrowRef}
        style={{
          position: "absolute",
          bottom: "2.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <svg width="28" height="17" viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L14 15.5L27 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── White fade overlay — transitions to ContentSection ────────── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "#ffffff",
          zIndex: 30,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </section>
  );
}

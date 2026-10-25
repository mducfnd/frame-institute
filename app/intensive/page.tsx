"use client";

import { useRef, useEffect, useState } from "react";

const FONT      = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_MED  = "'nitti-grotesk-medium', 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_BOLD = "'nitti-grotesk-bold', 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SLT  = "'nitti-grotesk-semilight', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const BLACK = "#0a0a0a";

const TITLES = ["THE MODEL", "THE INTENSIVE", "THE SESSIONS"];

type Session = { title: string; duration: string; text: string };

const INTRO_BLOCKS: { text: string }[] = [
  {
    text:
      "FRAME is an applied model of human motivation, a tool for navigating work and life with greater clarity and insight. It looks beyond skills, strengths, and behavior to reveal the underlying architecture shaping how you experience the world.",
  },
  {
    text:
      "The program begins with a two-part assessment to identify your FRAME Profile. From there, the focus shifts to interpreting your results, examining how underlying patterns influence your outlook, and applying those findings to your work and life. Each session is iterative and actionable, centered on the choices, challenges, and priorities that matter most.",
  },
];

const SESSIONS: Session[] = [
  {
    title: "Inquiry & Evaluation",
    duration: "Two 90-minute sessions",
    text:
      "Conducted across two virtual meetings, this in-depth assessment explores how you perceive, respond, and engage across contexts. Through discussion, we’ll uncover the core factors that form the basis of your FRAME Profile.",
  },
  {
    title: "Analysis & Discovery",
    duration: "75–90 minutes",
    text:
      "You’ll receive your completed FRAME Profile along with a detailed interpretation of the results. We’ll walk through what your profile reveals, how it informs your judgment, and where it’s most likely to create obstacles and opportunities.",
  },
  {
    title: "Dynamics & Drivers",
    duration: "75–90 minutes",
    text:
      "We’ll examine how your FRAME Profile governs the way you make decisions, pursue goals, and cultivate relationships. Using real-world scenarios, you’ll discover how your profile impacts interactions, responses, and outcomes.",
  },
  {
    title: "Design & Alignment",
    duration: "75–90 minutes",
    text:
      "Drawing on insights from previous sessions, we’ll develop a strategy for integrating FRAME into your daily life. You’ll leave with a structured approach for using the model to more effectively invest your time, energy, attention, and ambition.",
  },
];

// One flat list for the mobile content stack: two intro paragraphs then the
// four sessions, each scrolling in from below and out the top in turn.
type MobileBlock =
  | { kind: "para"; text: string }
  | { kind: "session"; title: string; duration: string; text: string };

const MOBILE_BLOCKS: MobileBlock[] = [
  { kind: "para", text: INTRO_BLOCKS[0].text },
  { kind: "para", text: INTRO_BLOCKS[1].text },
  ...SESSIONS.map((s) => ({ kind: "session" as const, ...s })),
];

// Six scroll stops total: Model (0), Program (1), + 4 session reveals (2,3,4,5)
const STOPS = 6;
const TITLE_H_VH = 12;
const INTRO_H_VH = 78;

// Scroll-section geometry, per breakpoint (all values in vh).
//   preHold - white hold before the black burst starts
//   reveal  - scroll distance the clip-path burst takes
//   stop    - scroll distance per content stop
const LAYOUT = {
  desktop: { preHold: 55, reveal: 145, stop: 100 },
  mobile:  { preHold: 40, reveal: 110, stop: 80 },
};
const sectionHeightVh = (mobile: boolean) => {
  const L = mobile ? LAYOUT.mobile : LAYOUT.desktop;
  return L.preHold + L.reveal + STOPS * L.stop;
};

// Mobile sticky layout: two stacked regions that each clip their own contents.
const M_TITLE_BAND_VH = 25;   // height of the title band
const M_TITLE_H_VH    = 8;    // vertical slot per title

// Blocks sit in normal flow and are spaced by margin, so the gap is literal and
// uniform rather than a by-product of slot height minus content height.
const M_GAP_SECTION_VH = 34;  // after THE MODEL's paragraph (a section break)
const M_GAP_ITEM_VH    = 16;  // THE INTENSIVE's paragraph and between sessions

const mobileGapVh = (i: number) => (i === 0 ? M_GAP_SECTION_VH : M_GAP_ITEM_VH);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// --- Field validation, matching the rules used on michaelparrishdudell.com ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateEmail = (v: string): string | null =>
  EMAIL_RE.test(v.trim()) ? null : "Please enter a valid email address.";

// 7-15 digits, ignoring formatting; rejects runs of a single repeated digit.
const validatePhone = (v: string): string | null => {
  const d = v.replace(/\D/g, "");
  if (d.length < 7 || d.length > 15) return "Please enter a valid phone number.";
  if (/^(\d)\1{6,}$/.test(d)) return "Please enter a valid phone number.";
  return null;
};

const minLength = (n: number, message: string) => (v: string): string | null =>
  v.trim().length >= n ? null : message;

// Bots submit instantly; a real person cannot fill five steps in two seconds.
const MIN_FILL_MS = 2000;

// Fallback only. The NavBar is sized in rem (`top: 1rem`, height `calc(1.3rem + ...)`),
// so it grows with the device's text-size setting. Anything that has to clear it
// is measured from the live element at runtime rather than hardcoded — see
// useNavClearance below. A vh value is wrong for the same reason in reverse:
// it shrinks with the visible viewport while the nav stays put.
const NAV_CLEARANCE_FALLBACK_PX = 72;
const NAV_GAP_PX = 22; // breathing room between the nav and whatever sits under it

// Reveal windows for the four session cells (in progress units, 0..5)
// Grid position: 0=TL, 1=BL, 2=TR, 3=BR
const SESSION_WINDOWS: { start: number; end: number; col: 0 | 1; row: 0 | 1 }[] = [
  { start: 1.7, end: 2.3, col: 0, row: 0 }, // Inquiry — top-left
  { start: 2.5, end: 3.1, col: 0, row: 1 }, // Analysis — bottom-left
  { start: 3.3, end: 3.9, col: 1, row: 0 }, // Dynamics — top-right
  { start: 4.1, end: 4.8, col: 1, row: 1 }, // Design — bottom-right
];

export default function IntensivePage() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const staticSectionRef = useRef<HTMLElement>(null);

  const [progress, setProgress] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [inDark, setInDark] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Re-run on breakpoint change: the mobile and desktop heroes are different
  // <video> elements, so the one mounted after a swap needs its own play() call.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;

    let settled = false;
    const GESTURES = ["touchstart", "pointerdown", "click", "scroll", "keydown"];

    const detach = () => {
      GESTURES.forEach((e) => window.removeEventListener(e, attempt));
    };

    const attempt = () => {
      if (settled) return;
      v.muted = true;
      v.playsInline = true;
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          settled = true;
          detach();
        }).catch(() => {
          /* autoplay refused — a later gesture will retry */
        });
      }
    };

    attempt();
    v.addEventListener("loadeddata", attempt);
    v.addEventListener("canplay", attempt);
    // Some mobile browsers refuse programmatic autoplay but allow playback to
    // start inside a user gesture. Retry on the first interaction, then stop.
    GESTURES.forEach((e) => window.addEventListener(e, attempt, { passive: true }));

    return () => {
      detach();
      v.removeEventListener("loadeddata", attempt);
      v.removeEventListener("canplay", attempt);
    };
  }, [isMobile]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 820px)");
    const sync = () => {
      setReducedMotion(mq.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();
    mq.addEventListener?.("change", sync);
    mqMobile.addEventListener?.("change", sync);
    return () => {
      mq.removeEventListener?.("change", sync);
      mqMobile.removeEventListener?.("change", sync);
    };
  }, []);

  // Toggle NavBar hiding via body attribute while the dark section is in play
  // or when the submission success overlay is up.
  // (navHideReason is read inside the effect below.)

  // ---------- APPLY transition (black -> white, APPLY fades in/out) ----------
  const transitionRef = useRef<HTMLDivElement>(null);
  const [transProgress, setTransProgress] = useState(0); // 0..1

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let running = true;
    let target = 0;
    let current = 0;

    const measure = () => {
      const el = transitionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      target = clamp(-rect.top, 0, total) / total;
    };

    // Smoothed catch-up: visible progress lags behind scroll by a few frames,
    // so fast scrolls still play the APPLY reveal/mask-out instead of jumping past it.
    const tick = () => {
      if (!running) return;
      measure();
      const delta = target - current;
      // Lerp factor: lower = more lag, higher = snappier. 0.07 ~ ~500ms catch-up at 60fps.
      current += delta * 0.07;
      // Snap when extremely close so React stops rerendering endlessly.
      if (Math.abs(delta) < 0.0005) current = target;
      setTransProgress(current);
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // ---------- APPLICATION FORM state ----------
  const FORMSPREE_URL = "https://formspree.io/f/mdeekdey";
  type AppFormData = Record<string, string>;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<AppFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const honeypotRef = useRef<HTMLInputElement>(null);
  const loadTimeRef = useRef<number>(0);

  useEffect(() => {
    loadTimeRef.current = Date.now();
  }, []);

  // Measure the fixed NavBar so everything below it clears it on any device,
  // whatever the user's text-size setting or browser chrome is doing.
  const [navClearance, setNavClearance] = useState(NAV_CLEARANCE_FALLBACK_PX);
  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector("nav");
      if (!nav) return;
      const bottom = nav.getBoundingClientRect().bottom;
      if (bottom > 0) {
        setNavClearance(Math.ceil(bottom) + NAV_GAP_PX);
      }
    };
    measure();
    // Re-measure after webfonts land and whenever the viewport changes.
    const t = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    fonts?.ready?.then(measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const applicationRef = useRef<HTMLDivElement>(null);
  const applySectionRef = useRef<HTMLElement>(null);

  // Swift eased scroll down to the application form (used when APPLY is clicked).
  const scrollToApplication = () => {
    const el = applySectionRef.current;
    if (!el) return;
    const startY = window.scrollY;
    const distance = el.getBoundingClientRect().top;
    if (Math.abs(distance) < 2) return;
    const duration = 750;
    const t0 = performance.now();
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now: number) => {
      const t = clamp((now - t0) / duration, 0, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const setField = (name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name] && value.trim()) {
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  // Human-readable keys so the Formspree email reads as questions, not slugs.
  const FIELD_LABELS: Record<string, string> = {
    full_name: "Full Name",
    email: "Email Address",
    mobile: "Mobile Phone Number",
    company: "Company / Organization",
    role: "Current Role / Title",
    work_description: "What they do",
    discovery: "How they heard about the FRAME Intensive",
    referrer: "Referred by",
    commitment: "Can commit to the full four weeks",
    scheduling: "Scheduling constraints",
    navigating: "Currently navigating",
    interest: "What interests them most",
  };

  useEffect(() => {
    if (reducedMotion) return;
    const L = isMobile ? LAYOUT.mobile : LAYOUT.desktop;
    const SECTION_H = sectionHeightVh(isMobile);
    let raf = 0;
    let running = true;
    // Smoothed (scrubbed) values so a fast scroll still plays the burst
    // instead of flashing straight to full black.
    let revealCur = 0;
    let progressCur = 0;
    let seeded = false;

    const tick = () => {
      if (!running) return;
      const el = scrollSectionRef.current;
      if (!el) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const scrolled = clamp(-rect.top, 0, total);

      const stickyVh = SECTION_H - 100;
      const scrolledVh = (scrolled / total) * stickyVh;

      // --- Reveal/burst target ---
      const revealStart = L.preHold;
      const revealEnd = L.preHold + L.reveal;
      const r = clamp((scrolledVh - revealStart) / (revealEnd - revealStart), 0, 1);
      // Gentler than before (was pow 2.4) so it opens rather than snaps.
      const revealTarget = 1 - Math.pow(1 - r, 1.7);

      // --- Content progression target ---
      const c = clamp((scrolledVh - revealEnd) / (stickyVh - revealEnd), 0, 1);
      const progressTarget = c * (STOPS - 1);

      // On first frame, jump straight to target (e.g. a reload mid-page)
      if (!seeded) {
        revealCur = revealTarget;
        progressCur = progressTarget;
        seeded = true;
      } else {
        // Lerp: lower factor = more lag. Reveal gets the most scrubbing.
        revealCur += (revealTarget - revealCur) * 0.06;
        progressCur += (progressTarget - progressCur) * 0.14;
        if (Math.abs(revealTarget - revealCur) < 0.0005) revealCur = revealTarget;
        if (Math.abs(progressTarget - progressCur) < 0.0008) progressCur = progressTarget;
      }

      setReveal(revealCur);
      setProgress(progressCur);
      setInDark(rect.top < window.innerHeight * 0.4 && rect.bottom > 0);

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isMobile]);

  // Mobile content stack: measure each block's centre so spacing comes from real
  // layout (margins + natural height) instead of assumed slot sizes.
  const mobileBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileCenters, setMobileCenters] = useState<number[]>([]);

  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    const measure = () => {
      setMobileCenters(
        mobileBlockRefs.current.map((el) =>
          el ? el.offsetTop + el.offsetHeight / 2 : 0
        )
      );
    };
    measure();
    // Re-measure once fonts land and after first paint settles.
    const t = window.setTimeout(measure, 250);
    window.addEventListener("resize", measure);
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    fonts?.ready?.then(measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [isMobile, reducedMotion]);

  // Centre offset (px) for a fractional progress value.
  const mobileCenterPx = (p: number) => {
    if (mobileCenters.length === 0) return 0;
    const last = mobileCenters.length - 1;
    const i0 = Math.max(0, Math.min(last, Math.floor(p)));
    const i1 = Math.max(0, Math.min(last, i0 + 1));
    const t = Math.max(0, Math.min(1, p - i0));
    return mobileCenters[i0] + (mobileCenters[i1] - mobileCenters[i0]) * t;
  };

  const titleProgress = Math.min(progress, 2);
  const activeTitleIdx =
    titleProgress < 0.5 ? 0 : titleProgress < 1.5 ? 1 : 2;

  // Intro stack (Model + Program) translation
  const introProgress = Math.min(progress, 2); // after 2, they're gone
  const introStackY = `calc(-${INTRO_H_VH / 2}vh - ${introProgress * INTRO_H_VH}vh)`;

  // Sessions grid opacity (fades in just before cells begin rising)
  const gridOpacity = clamp((progress - 1.4) / 0.3, 0, 1);

  const clipRadius = reveal * 160;

  // ---------- HERO ----------
  const hero = isMobile ? (
    // ------- Mobile hero: video top, white text panel below -------
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          height: "42vh",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            display: "block",
          }}
          poster="/intensive-hero-poster.jpg"
          src="/intensive-hero-v2.mp4"
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 7vw 3vh 7vw",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{
          fontFamily: FONT, fontWeight: 400,
          fontSize: "18vw", lineHeight: 0.85, letterSpacing: "-0.02em",
          textTransform: "uppercase", color: "#1a1a1a", margin: 0,
        }}>
          THE<br />INTENSIVE
        </h1>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300,
          fontSize: "4.2vw", lineHeight: 1.3,
          color: "#8c8a8a", margin: "4vw 0 0 0",
        }}>
          4 weeks to identify, explore, and integrate<br />your motivational architecture.
        </p>

        {/* Scroll cue — same chevron as the homepage hero, blinking on the
            footer's rhythm but at a lower ceiling so it stays in the background. */}
        <div
          aria-hidden="true"
          style={{
            alignSelf: "center",
            marginTop: "5vh",
            lineHeight: 0,
            pointerEvents: "none",
            animation: "heroScrollCue 1.6s ease-in-out infinite",
          }}
        >
          <svg width="20" height="12" viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 1L14 15.5L27 1"
              stroke="#1a1a1a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  ) : (
    // ------- Desktop hero: 48/52 split -------
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "48%", height: "100%",
          backgroundColor: "#ffffff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          paddingLeft: "5vw", paddingRight: "2vw",
          boxSizing: "border-box",
          zIndex: 1,
        }}
      >
        <h1 style={{
          fontFamily: FONT, fontWeight: 400, fontSize: "9vw",
          lineHeight: 0.8, letterSpacing: "-0.02em",
          textTransform: "uppercase", color: "#1a1a1a", margin: 0,
        }}>
          THE<br />INTENSIVE
        </h1>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300,
          fontSize: "1.5vw", lineHeight: 1.25,
          color: "#8c8a8a", margin: "0.85vw 0 0 0",
        }}>
          4 weeks to identify, explore, and integrate your<br />motivational architecture.
        </p>
      </div>
      <div style={{
        position: "absolute", top: 0, left: "48%",
        width: "52%", height: "100%", overflow: "hidden", zIndex: 1,
      }}>
        <video
          ref={heroVideoRef}
          autoPlay loop muted playsInline
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "right center",
            display: "block",
          }}
          poster="/intensive-hero-poster.jpg"
          src="/intensive-hero-v2.mp4"
        />
      </div>
    </section>
  );

  // ---------- SESSION CELL ----------
  const renderSessionCell = (s: Session, idx: number) => {
    const w = SESSION_WINDOWS[idx];
    const localR = clamp((progress - w.start) / (w.end - w.start), 0, 1);
    // Ease-out for a smooth landing
    const eased = 1 - Math.pow(1 - localR, 2);
    // Travel ~80vh — enough that top-row cells start fully below the viewport.
    const yOffsetVh = (1 - eased) * 80;
    // Once a cell has landed, drop the transform entirely. A transform (even
    // translateY(0)) promotes the cell to its own compositing layer, which can
    // shift text rasterization by a fraction of a pixel. Removing it means the
    // settled grid is laid out purely by CSS grid, identical in both columns.
    const landed = localR >= 1;
    return (
      <div
        key={idx}
        style={{
          gridColumn: w.col + 1,
          gridRow: w.row + 1,
          alignSelf: "start",
          ...(landed
            ? {}
            : { transform: `translateY(${yOffsetVh}vh)`, willChange: "transform" }),
          color: "#fff",
        }}
      >
        <h3 style={{
          fontFamily: FONT, fontWeight: 400,
          fontSize: "clamp(18px, 1.55vw, 28px)",
          lineHeight: 1.15, letterSpacing: "-0.01em",
          color: "#ffffff", margin: 0,
        }}>{s.title}</h3>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300, fontStyle: "italic",
          fontSize: "clamp(12px, 0.95vw, 15px)",
          color: "#9a9a9a", margin: "0.5em 0 1em 0",
        }}>{s.duration}</p>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300,
          fontSize: "clamp(14px, 1.05vw, 18px)", lineHeight: 1.5,
          color: "#f2f2f2", margin: 0,
        }}>{s.text}</p>
      </div>
    );
  };

  // ---------- SCROLL SECTION ----------
  const scrollSection = (
    <section
      ref={scrollSectionRef}
      style={{
        position: "relative",
        width: "100%",
        height: `${sectionHeightVh(isMobile)}vh`,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: BLACK,
          display: isMobile ? "block" : "flex",
          clipPath: `circle(${clipRadius}% at 50% 50%)`,
          WebkitClipPath: `circle(${clipRadius}% at 50% 50%)`,
          willChange: "clip-path",
        }}
      >
        {isMobile ? (
          <>
        {/* ---- Mobile: title band on top, content region below ---- */}
        {/* Each region clips its own contents, so titles and copy can never overlap. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title band */}
          <div
            style={{
              flex: "0 0 auto",
              height: `${M_TITLE_BAND_VH}vh`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {TITLES.map((t, i) => {
              const stepOffset = titleProgress - i;
              const yRelCenter = -stepOffset * M_TITLE_H_VH;
              const revealProg = clamp(stepOffset + 1, 0, 1);
              const eased = 1 - Math.pow(1 - revealProg, 2);
              const slideOffsetVh = (1 - eased) * (M_TITLE_H_VH * 0.6);
              const isActive = i === activeTitleIdx;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "7vw",
                    right: "7vw",
                    transform: `translate(0, calc(-50% + ${yRelCenter + slideOffsetVh}vh))`,
                    opacity: eased,
                    fontFamily: FONT,
                    fontWeight: 400,
                    fontSize: "8vw",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.25)",
                    transition: "color 300ms ease",
                    whiteSpace: "nowrap",
                    willChange: "transform, opacity",
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>

          {/* Content region — blocks scroll up through it, one at a time */}
          <div
            style={{
              flex: "1 1 auto",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "7vw",
                right: "7vw",
                transform: `translateY(-${mobileCenterPx(progress)}px)`,
                willChange: "transform",
              }}
            >
              {MOBILE_BLOCKS.map((b, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    mobileBlockRefs.current[i] = el;
                  }}
                  style={{ marginBottom: `${mobileGapVh(i)}vh` }}
                >
                  {b.kind === "para" ? (
                    <p style={{
                      fontFamily: FONT_SLT, fontWeight: 300,
                      fontSize: "4.2vw", lineHeight: 1.45,
                      color: "#f2f2f2", margin: 0,
                    }}>
                      {b.text}
                    </p>
                  ) : (
                    <>
                      <h3 style={{
                        fontFamily: FONT, fontWeight: 400,
                        fontSize: "5.6vw", lineHeight: 1.15,
                        letterSpacing: "-0.01em",
                        color: "#ffffff", margin: 0,
                      }}>{i - 1}. {b.title}</h3>
                      <p style={{
                        fontFamily: FONT_SLT, fontWeight: 300, fontStyle: "italic",
                        fontSize: "3.4vw", color: "#9a9a9a",
                        margin: "0.6em 0 1.1em 0",
                      }}>{b.duration}</p>
                      <p style={{
                        fontFamily: FONT_SLT, fontWeight: 300,
                        fontSize: "4vw", lineHeight: 1.45,
                        color: "#f2f2f2", margin: 0,
                      }}>{b.text}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        ) : (
          <>
        {/* Left column: titles */}
        <div style={{
          flex: "0 0 50%", height: "100%",
          position: "relative", overflow: "hidden",
        }}>
          {TITLES.map((t, i) => {
            const stepOffset = titleProgress - i;
            const yRelCenter = -stepOffset * TITLE_H_VH;
            const revealProg = clamp(stepOffset + 1, 0, 1);
            const eased = 1 - Math.pow(1 - revealProg, 2);
            const slideOffsetVh = (1 - eased) * (TITLE_H_VH * 0.5);
            const isActive = i === activeTitleIdx;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "5vw",
                  right: "2vw",
                  transform: `translate(0, calc(-50% + ${yRelCenter + slideOffsetVh}vh))`,
                  opacity: eased,
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: "clamp(44px, 5.4vw, 112px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.25)",
                  transition: "color 300ms ease",
                  whiteSpace: "nowrap",
                  willChange: "transform, opacity",
                }}
              >
                {t}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div style={{
          flex: "0 0 50%", height: "100%",
          position: "relative", overflow: "hidden",
        }}>
          {/* Intro stack: Model + Program, scrolls up and out */}
          <div style={{
            position: "absolute", top: "50%",
            left: "2vw", right: "5vw",
            transform: `translateY(${introStackY})`,
            willChange: "transform",
          }}>
            {INTRO_BLOCKS.map((b, i) => (
              <div key={i} style={{
                height: `${INTRO_H_VH}vh`,
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                <p style={{
                  fontFamily: FONT_SLT, fontWeight: 300,
                  fontSize: "clamp(18px, 1.5vw, 26px)", lineHeight: 1.5,
                  color: "#f2f2f2", margin: 0, maxWidth: "40ch",
                }}>
                  {b.text}
                </p>
              </div>
            ))}
          </div>

          {/* Sessions grid: fades in and reveals four cells */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "2vw",
            right: "5vw",
            transform: "translateY(-50%)",
            opacity: gridOpacity,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto",
            alignItems: "start",
            columnGap: "3vw",
            rowGap: "6vh",
            pointerEvents: gridOpacity > 0.9 ? "auto" : "none",
          }}>
            {SESSIONS.map((s, i) => renderSessionCell(s, i))}
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  );

  // ---------- STATIC FALLBACK ----------
  // Mobile / reduced-motion dark section — stacked flow, polished typography.
  const staticSection = (
    <section
      ref={staticSectionRef}
      style={{
        background: BLACK,
        color: "#fff",
        padding: "14vh 7vw 12vh 7vw",
      }}
    >
      <div style={{ marginBottom: "12vh" }}>
        <h2 style={{
          fontFamily: FONT, fontWeight: 400,
          fontSize: "11vw", lineHeight: 1,
          letterSpacing: "-0.02em", color: "#ffffff",
          margin: "0 0 0.7em 0",
        }}>THE MODEL</h2>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300,
          fontSize: "4.4vw", lineHeight: 1.45,
          color: "#f2f2f2", margin: 0,
        }}>
          {INTRO_BLOCKS[0].text}
        </p>
      </div>

      <div style={{ marginBottom: "12vh" }}>
        <h2 style={{
          fontFamily: FONT, fontWeight: 400,
          fontSize: "11vw", lineHeight: 1,
          letterSpacing: "-0.02em", color: "#ffffff",
          margin: "0 0 0.7em 0",
        }}>THE PROGRAM</h2>
        <p style={{
          fontFamily: FONT_SLT, fontWeight: 300,
          fontSize: "4.4vw", lineHeight: 1.45,
          color: "#f2f2f2", margin: 0,
        }}>
          {INTRO_BLOCKS[1].text}
        </p>
      </div>

      <div>
        <h2 style={{
          fontFamily: FONT, fontWeight: 400,
          fontSize: "11vw", lineHeight: 1,
          letterSpacing: "-0.02em", color: "#ffffff",
          margin: "0 0 0.9em 0",
        }}>THE SESSIONS</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "7vh" }}>
          {SESSIONS.map((s, i) => (
            <div key={i}>
              <h3 style={{
                fontFamily: FONT, fontWeight: 400,
                fontSize: "6vw", lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: "#ffffff", margin: 0,
              }}>{s.title}</h3>
              <p style={{
                fontFamily: FONT_SLT, fontWeight: 300, fontStyle: "italic",
                fontSize: "3.6vw", color: "#9a9a9a",
                margin: "0.5em 0 1em 0",
              }}>{s.duration}</p>
              <p style={{
                fontFamily: FONT_SLT, fontWeight: 300,
                fontSize: "4vw", lineHeight: 1.45,
                color: "#f2f2f2", margin: 0,
              }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Toggle NavBar hiding whenever the dark section is in play OR the success overlay is up.
  useEffect(() => {
    const hide = inDark || submitStatus === "success";
    if (hide) {
      document.body.setAttribute("data-intensive-hide-nav", "1");
    } else {
      document.body.removeAttribute("data-intensive-hide-nav");
    }
    return () => {
      document.body.removeAttribute("data-intensive-hide-nav");
    };
  }, [inDark, submitStatus]);

  // ---------- APPLY transition phases ----------
  // Wrapper is 260vh with a 100vh sticky, so the pin lasts for 160vh of scroll
  // (plenty of time for APPLY to hold). transProgress 0..1 maps across that scroll.
  //   0.00 - 0.15  background crossfades black -> white; APPLY begins fading in
  //   0.15 - 0.70  APPLY holds visible (the long hold the user wants)
  //   0.70 - 0.90  APPLY fades out
  //   0.90 - 1.00  white hold; form rises up (its negative margin starts it here)
  const bgT = clamp(transProgress / 0.15, 0, 1);
  const bgChan = Math.round(10 + (255 - 10) * bgT);
  const bgColor = `rgb(${bgChan}, ${bgChan}, ${bgChan})`;
  const applyIn = clamp((transProgress - 0.05) / 0.15, 0, 1);
  const applyOut = clamp((transProgress - 0.7) / 0.2, 0, 1);
  const applyOpacity = applyIn * (1 - applyOut);
  const applyColor = bgT > 0.5 ? "#1a1a1a" : "#ffffff";
  // APPLY is only interactive while it's actually on screen.
  const applyClickable = transProgress > 0.12 && transProgress < 0.8;

  // ---------- APPLICATION FORM ----------
  type Field = {
    name: string;
    label: string;
    required: boolean;
    type: "text" | "email" | "tel" | "textarea" | "select";
    options?: string[];
    hint?: string;
    autoComplete?: string;
    placeholder?: string;
    // Runs after the required check; return an error message or null.
    validate?: (value: string) => string | null;
  };
  type Step = { heading: string; intro?: string; fields: Field[] };

  const STEPS: Step[] = [
    {
      heading: "First, the essentials.",
      fields: [
        {
          name: "full_name", label: "Full Name", required: true, type: "text",
          autoComplete: "name", placeholder: "Jane Smith",
          validate: minLength(2, "Please enter your full name."),
        },
        {
          name: "email", label: "Email Address", required: true, type: "email",
          autoComplete: "email", placeholder: "jane@example.com",
          validate: validateEmail,
        },
        {
          name: "mobile", label: "Mobile Phone Number", required: true, type: "tel",
          autoComplete: "tel", placeholder: "+1 (555) 000-0000",
          validate: validatePhone,
        },
      ],
    },
    {
      heading: "Tell us about your work.",
      fields: [
        { name: "company", label: "Company / Organization", required: true, type: "text" },
        { name: "role", label: "Current Role / Title", required: true, type: "text" },
        { name: "work_description", label: "Briefly describe what you do.", required: true, type: "textarea", validate: minLength(10, "Please tell us a little about what you do."), },
      ],
    },
    {
      heading: "How did you discover FRAME?",
      fields: [
        { name: "discovery", label: "How did you hear about the FRAME Intensive?", required: true, type: "text" },
        { name: "referrer", label: "Were you referred by someone? If so, who?", required: false, type: "text" },
      ],
    },
    {
      heading: "Is now the right time?",
      intro: "The FRAME Intensive takes place over four weeks, beginning the week of November 9 and concluding the week of December 7, with a one-week break for Thanksgiving. The program includes two 90-minute assessments followed by three working sessions. You’ll have time between meetings to reflect and apply what you’re learning.",
      fields: [
        {
          name: "commitment",
          label: "Can you commit to participating fully in the program over a four-week period?",
          required: true,
          type: "select",
          options: ["Yes", "No"],
        },
        {
          name: "scheduling",
          label: "Are there any anticipated scheduling constraints that might affect your participation? If so, please provide details.",
          required: false,
          type: "textarea",
        },
      ],
    },
    {
      heading: "What would you like to explore?",
      fields: [
        { name: "navigating", label: "What is a decision, challenge, relationship, or area of uncertainty that you are currently trying to navigate?", required: true, type: "textarea", validate: minLength(10, "Please share a little more detail."), },
        { name: "interest", label: "Based on what you know about FRAME, what interests you most about participating in the Intensive?", required: true, type: "textarea", validate: minLength(10, "Please share a little more detail."), },
      ],
    },
  ];

  const validateStep = (idx: number): boolean => {
    const stepFields = STEPS[idx].fields;
    const newErrors: Record<string, string> = {};
    for (const f of stepFields) {
      const raw = (formData[f.name] || "").trim();
      if (!raw) {
        if (f.required) newErrors[f.name] = "This field is required.";
        continue; // nothing to validate in an empty optional field
      }
      const msg = f.validate ? f.validate(raw) : null;
      if (msg) newErrors[f.name] = msg;
    }
    setErrors((p) => ({ ...p, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    // Honeypot: a hidden field no human can see. If it's filled, a bot did it —
    // show the normal success state so the bot gets no useful feedback, and send
    // nothing. Formspree also discards `_gotcha` server-side as a second line.
    if (honeypotRef.current?.value) {
      setSubmitStatus("success");
      return;
    }

    // Timing trap: nobody completes five steps in under two seconds.
    if (Date.now() - loadTimeRef.current < MIN_FILL_MS) {
      setSubmitStatus("success");
      return;
    }

    setSubmitStatus("submitting");
    try {
      const fd = new FormData();
      // Readable labels so the email reads as questions rather than field slugs.
      Object.entries(formData).forEach(([k, v]) => {
        const value = (v ?? "").trim();
        if (!value) return;
        fd.append(FIELD_LABELS[k] || k, value);
      });
      const applicant = (formData.full_name || "").trim();
      fd.append("_subject", `FRAME Intensive Application${applicant ? ` — ${applicant}` : ""}`);
      // Lets you hit reply straight to the applicant.
      if (formData.email) fd.append("_replyto", formData.email.trim());
      fd.append("_gotcha", "");

      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setSubmitStatus("success");
      } else {
        const detail = await res.text().catch(() => "<unreadable>");
        console.error("Intensive application submit failed:", res.status, detail);
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Intensive application submit exception:", err);
      setSubmitStatus("error");
    }
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const renderField = (f: Field) => {
    const errorMsg = errors[f.name];
    const hasError = !!errorMsg;
    const value = formData[f.name] || "";
    const common = {
      name: f.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setField(f.name, e.target.value),
      className: `frame-input${hasError ? " frame-input-error" : ""}`,
      "aria-invalid": hasError,
      "aria-required": f.required,
      autoComplete: f.autoComplete,
      placeholder: f.placeholder,
    };
    return (
      <div key={f.name} style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: FONT_SLT,
            fontWeight: 300,
            fontSize: isMobile ? "3.6vw" : "14px",
            letterSpacing: "0.03em",
            color: hasError ? "#b23b3b" : "#6a6a6a",
            marginBottom: "0.5rem",
            transition: "color 200ms ease",
          }}
        >
          {f.label}
          {f.required && (
            <span style={{ color: hasError ? "#b23b3b" : "#8c8a8a", marginLeft: 4 }}>*</span>
          )}
          {f.hint && (
            <span
              style={{
                fontStyle: "italic",
                marginLeft: "0.6em",
                color: "#9a9a9a",
                fontWeight: 300,
              }}
            >
              {f.hint}
            </span>
          )}
        </label>
        {f.type === "textarea" ? (
          <textarea {...common} rows={3} />
        ) : f.type === "select" ? (
          <div className="frame-select-wrap">
            <select
              name={f.name}
              value={value}
              onChange={(e) => setField(f.name, e.target.value)}
              className={`frame-select${hasError ? " frame-input-error" : ""}${value ? " frame-select-filled" : ""}`}
              aria-invalid={hasError}
              aria-required={f.required}
            >
              <option value="">Select…</option>
              {(f.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input
            {...common}
            type={f.type}
            inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
          />
        )}
        {hasError && (
          <div
            role="alert"
            style={{
              fontFamily: FONT_SLT,
              fontWeight: 300,
              fontSize: "13px",
              color: "#b23b3b",
              marginTop: "0.4rem",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>
    );
  };

  const formContent = (
    <div
      ref={applicationRef}
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: isMobile
          ? `max(${navClearance + 18}px, 12vh)`
          : `max(${navClearance}px, 4vh)`,
        paddingRight: isMobile ? "7vw" : "3vw",
        paddingLeft: isMobile ? "7vw" : "3vw",
        paddingBottom: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Progress bar — sticks just below the fixed nav, so no amount of
          scrolling (or browser-chrome resizing) can push it into the logo. */}
      <div
        style={{
          position: "sticky",
          top: navClearance,
          zIndex: 5,
          background: "#ffffff",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          paddingTop: "12px",
          paddingBottom: "12px",
          marginBottom: isMobile ? "8vh" : "11vh",
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: isMobile ? "12vw" : "clamp(44px, 6vw, 86px)",
              height: "2px",
              background: i <= step ? "#1a1a1a" : "#d6d6d6",
              transition: "background 350ms ease",
            }}
          />
        ))}
      </div>

      {submitStatus === "success" ? (
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#1a1a1a",
              margin: "0 0 1rem 0",
            }}
          >
            Thank you.
          </h2>
          <p
            style={{
              fontFamily: FONT_SLT,
              fontWeight: 300,
              fontSize: "clamp(16px, 1.3vw, 20px)",
              lineHeight: 1.5,
              color: "#6a6a6a",
              margin: 0,
            }}
          >
            Your application has been received. We’ll be in touch shortly.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(260px, 1fr) minmax(0, 2.3fr)",
            columnGap: "3vw",
            rowGap: isMobile ? "3vh" : 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: isMobile ? "8.5vw" : "clamp(24px, 2.8vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              {current.heading}
            </h2>
          </div>
          <div>
            {current.intro && (
              <p
                style={{
                  fontFamily: FONT_SLT,
                  fontWeight: 300,
                  fontSize: "clamp(15px, 1.1vw, 18px)",
                  lineHeight: 1.55,
                  color: "#6a6a6a",
                  margin: "0 0 2.5rem 0",
                  maxWidth: "60ch",
                }}
              >
                {current.intro}
              </p>
            )}
            {current.fields.map(renderField)}

            {/* Honeypot — invisible to people, irresistible to bots. */}
            <input
              ref={honeypotRef}
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: "1px",
                height: "1px",
                opacity: 0,
                pointerEvents: "none",
              }}
            />

            {submitStatus === "error" && (
              <div
                style={{
                  fontFamily: FONT_SLT,
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "#b23b3b",
                  marginBottom: "1rem",
                }}
              >
                Something went wrong submitting your application. Please try again.
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "1.5rem",
                marginTop: "1rem",
                marginBottom: "0",
              }}
            >
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={submitStatus === "submitting"}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontFamily: FONT_SLT,
                    fontWeight: 300,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6a6a6a",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={isLast ? handleSubmit : handleNext}
                disabled={submitStatus === "submitting"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "#1a1a1a",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.85rem 1.6rem",
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: submitStatus === "submitting" ? "default" : "pointer",
                  opacity: submitStatus === "submitting" ? 0.6 : 1,
                  transition: "opacity 200ms ease",
                }}
              >
                {isLast
                  ? submitStatus === "submitting"
                    ? "Submitting\u2026"
                    : "Submit"
                  : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ---------- APPLY zone: sticky container that holds BOTH APPLY and the form ----------
  const transitionSection = (
    <section
      ref={transitionRef}
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "220vh" : "340vh",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div
          role="button"
          tabIndex={applyClickable ? 0 : -1}
          aria-label="Apply - go to the application form"
          className="apply-cta"
          onClick={applyClickable ? scrollToApplication : undefined}
          onKeyDown={(e) => {
            if (!applyClickable) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              scrollToApplication();
            }
          }}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "0.03em",
            lineHeight: 1,
            fontFamily: FONT_MED,
            fontWeight: 500,
            fontSize: isMobile ? "clamp(56px, 20vw, 110px)" : "clamp(60px, 10vw, 150px)",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: applyColor,
            transition: "color 300ms ease, opacity 220ms ease",
            userSelect: "none",
            cursor: applyClickable ? "pointer" : "default",
            pointerEvents: applyClickable ? "auto" : "none",
            outline: "none",
          }}
        >
          {"APPLY".split("").map((ch, i) => {
            // Reveal window 0.05 -> 0.30, staggered 0.035 per letter
            const inP = clamp((transProgress - 0.05 - i * 0.035) / 0.12, 0, 1);
            // Mask-out window 0.72 -> 0.92, same stagger
            const outP = clamp((transProgress - 0.72 - i * 0.035) / 0.12, 0, 1);
            // Smooth easing on both
            const easeIn = 1 - Math.pow(1 - inP, 3);
            const easeOut = 1 - Math.pow(1 - outP, 3);
            // Y translation: 100% (below mask) -> 0 (in view) -> -110% (above mask)
            const yPct = (1 - easeIn) * 100 - easeOut * 110;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  lineHeight: 1,
                  // small padding so descender-less uppercase sits cleanly
                  paddingBottom: "0.02em",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${yPct}%)`,
                    willChange: "transform",
                  }}
                >
                  {ch}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );

  const applicationSection = (
    <section
      ref={applySectionRef}
      style={{
        position: "relative",
        width: "100%",
        background: "#ffffff",
        marginTop: "-100vh",
        zIndex: 2,
        minHeight: "100vh",
      }}
    >
      {formContent}
    </section>
  );

  return (
    <>
      {/* Global CSS: hide the NavBar while body data-attr is set, + form styling */}
      <style jsx global>{`
        body[data-intensive-hide-nav="1"] nav {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        @keyframes applyReceivedSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes applyReceivedFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .frame-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #c8c8c8;
          outline: none;
          padding: 0.65rem 0;
          font-family: 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 300;
          font-size: 17px;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          box-sizing: border-box;
          resize: vertical;
        }
        .frame-input::placeholder { color: #aaa; }
        .frame-input:focus { border-bottom-color: #1a1a1a; }
        .frame-input-error { border-bottom-color: #b23b3b; }

        @keyframes heroScrollCue {
          0%, 42%, 100% { opacity: 0.5; }
          50%, 92%      { opacity: 0.12; }
        }

        .apply-cta:hover { opacity: 0.68; }
        .apply-cta:focus-visible { opacity: 0.68; outline: none; }

        .frame-select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #c8c8c8;
          outline: none;
          padding: 0.65rem 1.4rem 0.65rem 0;
          font-family: 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 300;
          font-size: 17px;
          letter-spacing: 0.02em;
          color: #aaa;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          border-radius: 0;
          box-sizing: border-box;
        }
        .frame-select:focus { border-bottom-color: #1a1a1a; }
        .frame-select-filled { color: #1a1a1a; }
        .frame-select option { color: #1a1a1a; }
        .frame-select-wrap { position: relative; }
        .frame-select-wrap::after {
          content: '';
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #8c8a8a;
          pointer-events: none;
        }
        textarea.frame-input {
          min-height: 90px;
          line-height: 1.5;
        }
      `}</style>
      {hero}
      {reducedMotion ? staticSection : scrollSection}
      {transitionSection}
      {applicationSection}

      {/* Submit success overlay: slides up from the bottom, covers the viewport */}
      {submitStatus === "success" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0a0a0a",
            zIndex: 1000,
            animation: "applyReceivedSlideUp 700ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "12vh 6vw 0 6vw",
              textAlign: "center",
              animation: "applyReceivedFadeIn 500ms ease 400ms both",
            }}
          >
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: isMobile ? "9vw" : "clamp(34px, 4vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: isMobile ? "0 0 1.2rem 0" : "0 0 1.5rem 0",
              }}
            >
              Application received.
            </h2>
            <p
              style={{
                fontFamily: FONT_SLT,
                fontWeight: 300,
                fontSize: isMobile ? "4.2vw" : "clamp(16px, 1.3vw, 22px)",
                lineHeight: 1.6,
                color: "#c8c8c8",
                margin: 0,
                maxWidth: isMobile ? "34ch" : "none",
              }}
            >
              Thank you for your interest in the FRAME Intensive.
              {isMobile ? " " : <br />}
              We’ll be in touch after reviewing your submission.
            </p>
          </div>

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
              marginBottom: "0",
            }}
          />
        </div>
      )}
    </>
  );
}

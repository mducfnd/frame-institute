"use client";

import { useRef, useEffect, useState } from "react";

const FONT      = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_MED  = "'nitti-grotesk-medium', 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_BOLD = "'nitti-grotesk-bold', 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SLT  = "'nitti-grotesk-semilight', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const BLACK = "#0a0a0a";

const TITLES = ["THE MODEL", "THE PROGRAM", "THE SESSIONS"];

type Session = { title: string; duration: string; text: string };

const INTRO_BLOCKS: { text: string }[] = [
  {
    text:
      "FRAME is an applied model of human motivation, a tool for navigating work and life with greater clarity and insight. It looks beyond skills, strengths, and behavior to reveal the underlying architecture shaping how you experience the world.",
  },
  {
    text:
      "The intensive begins with a two-part assessment to identify your FRAME Profile. From there, the focus shifts to interpreting your results, examining how underlying patterns influence your experiences, and applying those findings to your work and life. Each session is iterative and actionable, centered on choices, challenges, and priorities that matter most.",
  },
];

const SESSIONS: Session[] = [
  {
    title: "Inquiry & Evaluation",
    duration: "Two 90-minute sessions",
    text:
      "Conducted across two virtual sessions, this in-depth assessment explores how you perceive, respond, and engage across different contexts. Through structured discussion, we’ll uncover the core factors that form the basis of your FRAME Profile.",
  },
  {
    title: "Analysis & Discovery",
    duration: "75- to 90-minute session",
    text:
      "You’ll receive your completed FRAME Profile along with a detailed interpretation of the results. We’ll walk through what your profile reveals, how it informs your judgment, and where it’s most likely to create obstacles and opportunities.",
  },
  {
    title: "Dynamics & Drivers",
    duration: "75- to 90-minute session",
    text:
      "This session examines how your FRAME Profile governs the way you make decisions, pursue goals, and cultivate relationships. Using real-world scenarios, we’ll determine how your profile impacts interactions, responses, and outcomes.",
  },
  {
    title: "Design & Alignment",
    duration: "75- to 90-minute session",
    text:
      "Drawing on insights from previous sessions, we’ll develop a strategy for integrating FRAME into your daily life. You’ll leave with a clear approach for using your profile to more effectively invest your time, energy, attention, and ambition.",
  },
];

// Six scroll stops total: Model (0), Program (1), + 4 session reveals (2,3,4,5)
const STOPS = 6;
const TITLE_H_VH = 12;
const INTRO_H_VH = 78;

const PRE_HOLD_VH = 40;
const REVEAL_VH   = 60;
const CONTENT_VH  = STOPS * 100;
const SECTION_H_VH = PRE_HOLD_VH + REVEAL_VH + CONTENT_VH;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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

  useEffect(() => {
    heroVideoRef.current?.play().catch(() => {});
  }, []);

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
  const FORMSPREE_URL = "https://formspree.io/f/xvkgyajl";
  type AppFormData = Record<string, string>;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<AppFormData>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const applicationRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = scrollSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = clamp(-rect.top, 0, total);

      const stickyVh = SECTION_H_VH - 100;
      const scrolledVh = (scrolled / total) * stickyVh;

      // Reveal/burst
      const revealStart = PRE_HOLD_VH;
      const revealEnd = PRE_HOLD_VH + REVEAL_VH;
      const r = clamp((scrolledVh - revealStart) / (revealEnd - revealStart), 0, 1);
      setReveal(1 - Math.pow(1 - r, 2.4));

      // Content progression
      const c = clamp((scrolledVh - revealEnd) / (stickyVh - revealEnd), 0, 1);
      setProgress(c * (STOPS - 1));

      // Nav hide region: once reveal is well underway, until dark section fully exits
      // Rect.top < viewport * 0.5 means hero mostly past; rect.bottom > 0 means still in dark
      setInDark(rect.top < window.innerHeight * 0.4 && rect.bottom > 0);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isMobile]);

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
      <div style={{ flex: "0 0 42vh", overflow: "hidden" }}>
        <video
          ref={heroVideoRef}
          autoPlay loop muted playsInline
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            display: "block",
          }}
          src="/intensive-hero.mp4"
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 7vw",
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
          4 weeks to identify, apply, and integrate your motivational architecture.
        </p>
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
          fontSize: "1.85vw", lineHeight: 1.25,
          color: "#8c8a8a", margin: "0.7vw 0 0 0",
        }}>
          4 weeks to identify, apply, and integrate<br />your motivational architecture.
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
          src="/intensive-hero.mp4"
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
    return (
      <div
        key={idx}
        style={{
          gridColumn: w.col + 1,
          gridRow: w.row + 1,
          transform: `translateY(${yOffsetVh}vh)`,
          willChange: "transform",
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
        height: `${SECTION_H_VH}vh`,
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
          display: "flex",
          clipPath: `circle(${clipRadius}% at 50% 50%)`,
          WebkitClipPath: `circle(${clipRadius}% at 50% 50%)`,
          willChange: "clip-path",
        }}
      >
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

  // Mobile: detect whether the static dark section is in viewport, to hide the nav.
  useEffect(() => {
    if (!isMobile) return;
    let raf = 0;
    let ticking = false;
    const check = () => {
      ticking = false;
      const el = staticSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Treat "in dark" as: the section occupies most of the viewport.
      const h = window.innerHeight;
      const covers = rect.top < h * 0.4 && rect.bottom > h * 0.6;
      setInDark(covers);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

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

  // ---------- APPLICATION FORM ----------
  type Field = {
    name: string;
    label: string;
    required: boolean;
    type: "text" | "email" | "tel" | "textarea";
    hint?: string;
  };
  type Step = { heading: string; intro?: string; fields: Field[] };

  const STEPS: Step[] = [
    {
      heading: "First, the essentials.",
      fields: [
        { name: "full_name", label: "Full Name", required: true, type: "text" },
        { name: "email", label: "Email Address", required: true, type: "email" },
        { name: "mobile", label: "Mobile Phone Number", required: true, type: "tel" },
      ],
    },
    {
      heading: "What are you working on?",
      fields: [
        { name: "company", label: "Company / Organization", required: true, type: "text" },
        { name: "role", label: "Current Role / Title", required: true, type: "text" },
        { name: "work_description", label: "Briefly describe what you do professionally.", required: true, type: "textarea" },
      ],
    },
    {
      heading: "How did you discover FRAME?",
      fields: [
        { name: "discovery", label: "How did you hear about the FRAME Intensive?", required: true, type: "text" },
        { name: "referrer", label: "If someone referred you, who referred you?", required: false, type: "text" },
      ],
    },
    {
      heading: "Is now the right time?",
      intro: "The FRAME Intensive includes two 90-minute assessments followed by three weekly working sessions, spanning a total of four weeks. You\u2019ll have time between sessions to reflect on your insights and apply what you\u2019re learning.",
      fields: [
        { name: "commitment", label: "Can you commit to participating fully in the program over a four-week period?", required: true, type: "textarea" },
        { name: "scheduling", label: "Are there any anticipated scheduling constraints that might affect your participation?", required: true, type: "textarea" },
      ],
    },
    {
      heading: "What would you like to explore?",
      fields: [
        { name: "navigating", label: "What is a decision, challenge, transition, or area of your life that you are currently trying to navigate?", required: true, type: "textarea" },
        { name: "interest", label: "Based on the information you\u2019ve received about FRAME, what interests you most about participating in this program?", required: true, type: "textarea" },
      ],
    },
  ];

  const validateStep = (idx: number): boolean => {
    const stepFields = STEPS[idx].fields;
    const newErrors: Record<string, boolean> = {};
    for (const f of stepFields) {
      if (f.required && !(formData[f.name] || "").trim()) {
        newErrors[f.name] = true;
      }
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
    // Formspree wiring removed for now — jump straight to the success overlay.
    // When ready to re-enable, POST formData to FORMSPREE_URL and setSubmitStatus based on the response.
    setSubmitStatus("submitting");
    setTimeout(() => setSubmitStatus("success"), 250);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const renderField = (f: Field) => {
    const hasError = !!errors[f.name];
    const common = {
      name: f.name,
      value: formData[f.name] || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setField(f.name, e.target.value),
      className: `frame-input${hasError ? " frame-input-error" : ""}`,
      "aria-invalid": hasError,
      "aria-required": f.required,
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
        ) : (
          <input {...common} type={f.type} />
        )}
        {hasError && (
          <div
            style={{
              fontFamily: FONT_SLT,
              fontWeight: 300,
              fontSize: "13px",
              color: "#b23b3b",
              marginTop: "0.4rem",
            }}
          >
            This field is required.
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
        padding: "4vh 3vw 0 3vw",
        boxSizing: "border-box",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "13vh",
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: "clamp(44px, 6vw, 86px)",
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
            gridTemplateColumns: "minmax(260px, 1fr) minmax(0, 2.3fr)",
            columnGap: "3vw",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "clamp(24px, 2.8vw, 40px)",
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
          aria-label="APPLY"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "0.03em",
            lineHeight: 1,
            fontFamily: FONT_MED,
            fontWeight: 500,
            fontSize: "clamp(60px, 10vw, 150px)",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: applyColor,
            transition: "color 300ms ease",
            userSelect: "none",
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
        textarea.frame-input {
          min-height: 90px;
          line-height: 1.5;
        }
      `}</style>
      {hero}
      {reducedMotion || isMobile ? staticSection : scrollSection}
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
                fontSize: "clamp(34px, 4vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: "0 0 1.5rem 0",
              }}
            >
              Application received.
            </h2>
            <p
              style={{
                fontFamily: FONT_SLT,
                fontWeight: 300,
                fontSize: "clamp(16px, 1.3vw, 22px)",
                lineHeight: 1.5,
                color: "#c8c8c8",
                margin: 0,
                maxWidth: "60ch",
              }}
            >
              Thank you for your interest in the FRAME Intensive. We’ll be in touch after reviewing your submission.
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

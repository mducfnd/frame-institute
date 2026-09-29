"use client";

import { useState, useEffect } from "react";

const FONT     = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_LT  = "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SLT = "'nitti-grotesk-semilight', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SCROLL_TEXT = "CONNECT";

const INTERESTS = [
  "Individual Engagement",
  "Team or Organization Program",
  "Speaking / Workshop",
  "Request Information",
  "Other",
];

export default function ConnectPage() {
  const reps = 8;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
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
          letter-spacing: 0.03em;
          color: #1a1a1a;
          box-sizing: border-box;
        }
        .frame-input::placeholder { color: #aaa; }
        .frame-input:focus { border-bottom-color: #1a1a1a; }

        .frame-select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #c8c8c8;
          outline: none;
          padding: 0.65rem 0;
          font-family: 'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 300;
          font-size: 17px;
          letter-spacing: 0.03em;
          color: #aaa;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          border-radius: 0;
          box-sizing: border-box;
        }
        .frame-select:focus { border-bottom-color: #1a1a1a; color: #1a1a1a; }
        .frame-select option { color: #1a1a1a; }

        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '';
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #aaa;
          pointer-events: none;
        }
      `}</style>

      {isMobile ? (
        /* MOBILE LAYOUT */
        <div
          style={{
            minHeight: "100vh",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            paddingTop: "72px",
          }}
        >
          {/* Horizontal CONNECT marquee */}
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              height: "140px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                animation: "scrollLeft 40s linear infinite",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                height: "100%",
                width: "max-content",
              }}
            >
              {Array.from({ length: reps * 2 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontWeight: 500,
                    fontSize: "120px",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                    color: "#c8c8c8",
                    whiteSpace: "nowrap",
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    userSelect: "none",
                  }}
                >
                  {SCROLL_TEXT}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "2.5rem 1.5rem 3rem",
            }}
          >
            {/* Contact video — mobile */}
            <div style={{ width: "240px", height: "240px", marginBottom: "1.5rem", overflow: "hidden" }}>
              <video autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                src="/contact-loop.mp4"
              />
            </div>

            {/* Let's Talk + contact info */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {/* Left: heading + tagline */}
                <div>
                  <h2 style={{
                    fontFamily: FONT,
                    fontWeight: 400,
                    fontSize: "36px",
                    letterSpacing: "-0.01em",
                    color: "#1a1a1a",
                    margin: "0 0 8px 0",
                    lineHeight: 1.1,
                  }}>
                    Let&apos;s talk
                  </h2>
                  <p style={{
                    fontFamily: FONT_SLT,
                    fontWeight: 400,
                    fontSize: "13px",
                    letterSpacing: "0.01em",
                    color: "#555",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}>
                    Based in the U.S. Available everywhere.
                  </p>
                </div>

                {/* Right: contact details */}
                <div style={{ textAlign: "right" }}>
                  {[
                    { label: "Email",    lines: ["hello@frame.institute"] },
                    { label: "Phone",    lines: ["+1 646 386 0917"] },
                    { label: "Address",  lines: ["224 W 35th St Ste 500", "New York, NY 10001"] },
                  ].map(({ label, lines }) => (
                    <div key={label} style={{ marginBottom: "20px" }}>
                      <div style={{
                        fontFamily: FONT_SLT,
                        fontWeight: 400,
                        fontSize: "11px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#999",
                        marginBottom: "4px",
                      }}>
                        {label}
                      </div>
                      {lines.map((line, i) => (
                        <div key={i} style={{
                          fontFamily: FONT,
                          fontWeight: 300,
                          fontSize: "15px",
                          letterSpacing: "0.02em",
                          color: "#1a1a1a",
                          lineHeight: 1.5,
                        }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drop a Line form */}
            <div>
              <h3 style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "25px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#1a1a1a",
                margin: "0 0 20px 0",
              }}>
                Drop a Line
              </h3>

              <p style={{
                fontFamily: FONT_SLT,
                fontWeight: 400,
                fontSize: "15px",
                letterSpacing: "0.01em",
                color: "#555",
                lineHeight: 1.6,
                margin: "0 0 36px 0",
              }}>
                Tell us what you&apos;re working toward, where you&apos;re stuck, or what you&apos;d like to explore. We&apos;ll follow up with the right next step.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: "flex", flexDirection: "column", gap: "24px" }}
              >
                {["Full Name", "Email", "Phone", "Company", "Title"].map((field) => (
                  <input
                    key={field}
                    className="frame-input"
                    type={field === "Email" ? "email" : field === "Phone" ? "tel" : "text"}
                    placeholder={field}
                  />
                ))}

                <div className="select-wrap">
                  <select className="frame-select" defaultValue="">
                    <option value="" disabled>What are you interested in?</option>
                    {INTERESTS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="frame-input"
                  placeholder="Message"
                  rows={4}
                  style={{ resize: "none", paddingTop: "0.65rem" }}
                />

                <div>
                  <button
                    type="submit"
                    style={{
                      marginTop: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.65rem 2.4rem",
                      background: "#1a1a1a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "5px",
                      fontFamily: FONT_SLT,
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* DESKTOP LAYOUT */
        <div
          style={{
            minHeight: "100vh",
            background: "#ffffff",
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scrolling CONNECT strip (fixed left) */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 0,
              left: 240,
              bottom: 0,
              width: 280,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <div
              style={{
                animation: "scrollUp 120s linear infinite",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {Array.from({ length: reps * 2 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontFamily: FONT,
                    fontWeight: 500,
                    fontSize: "250px",
                    lineHeight: 0.9,
                    letterSpacing: "-0.01em",
                    color: "#c8c8c8",
                    whiteSpace: "nowrap",
                    paddingTop: "2rem",
                    paddingBottom: "2rem",
                    userSelect: "none",
                  }}
                >
                  {SCROLL_TEXT}
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div
            style={{
              marginLeft: "530px",
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              paddingTop: "110px",
              paddingBottom: "64px",
              alignItems: "stretch",
            }}
          >
            {/* Let's Talk + contact info */}
            <div
              style={{
                paddingTop: 0,
                paddingBottom: "calc(0.65rem + 10px)",
                paddingLeft: 0,
                paddingRight: "93px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {/* Contact video — desktop */}
              <div style={{ width: "240px", height: "240px", marginBottom: "28px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  src="/contact-loop.mp4"
                />
              </div>

              <div style={{ width: "240px" }}>
                <h2 style={{
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: "36px",
                  letterSpacing: "-0.01em",
                  color: "#1a1a1a",
                  margin: "0 0 12px 0",
                  lineHeight: 1.1,
                }}>
                  Let&apos;s talk
                </h2>
                <p style={{
                  fontFamily: FONT_SLT,
                  fontWeight: 400,
                  fontSize: "13px",
                  letterSpacing: "0.01em",
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 30px 0",
                  whiteSpace: "nowrap",
                }}>
                  Based in the U.S. Available everywhere.
                </p>

                {[
                  { label: "Email",    lines: ["hello@frame.institute"] },
                  { label: "Phone",    lines: ["+1 646 386 0917"] },
                  { label: "Address",  lines: ["224 W 35th St Ste 500", "New York, NY 10001"] },
                ].map(({ label, lines }) => (
                  <div key={label} style={{ marginBottom: "32px" }}>
                    <div style={{
                      fontFamily: FONT_SLT,
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#999",
                      marginBottom: "6px",
                    }}>
                      {label}
                    </div>
                    {lines.map((line, i) => (
                      <div key={i} style={{
                        fontFamily: FONT,
                        fontWeight: 300,
                        fontSize: "17px",
                        letterSpacing: "0.02em",
                        color: "#1a1a1a",
                        lineHeight: 1.5,
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Drop a Line form */}
            <div
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: "48px",
                paddingRight: "40px",
              }}
            >
              <h3 style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "25px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#1a1a1a",
                margin: "0 0 20px 0",
              }}>
                Drop a Line
              </h3>

              <p style={{
                fontFamily: FONT_SLT,
                fontWeight: 400,
                fontSize: "15px",
                letterSpacing: "0.01em",
                color: "#555",
                lineHeight: 1.6,
                margin: "0 0 36px 0",
              }}>
                Tell us what you&apos;re working toward, where you&apos;re stuck, or what you&apos;d like to explore. We&apos;ll follow up with the right next step.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: "flex", flexDirection: "column", gap: "24px" }}
              >
                {["Full Name", "Email", "Phone", "Company", "Title"].map((field) => (
                  <input
                    key={field}
                    className="frame-input"
                    type={field === "Email" ? "email" : field === "Phone" ? "tel" : "text"}
                    placeholder={field}
                  />
                ))}

                <div className="select-wrap">
                  <select className="frame-select" defaultValue="">
                    <option value="" disabled>What are you interested in?</option>
                    {INTERESTS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="frame-input"
                  placeholder="Message"
                  rows={4}
                  style={{ resize: "none", paddingTop: "0.65rem" }}
                />

                <div>
                  <button
                    type="submit"
                    style={{
                      marginTop: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.65rem 2.4rem",
                      background: "#1a1a1a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "5px",
                      fontFamily: FONT_SLT,
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/* Connect: "Get in touch" and the contact details on the left, with the four-line A drawing in beneath them;
   the form on the right in a bordered panel. Stacks on narrow screens. Submits to the same Formspree form as
   before and shows the same thank-you line afterwards. */

const FORMSPREE_URL = "https://formspree.io/f/xvkgyajl";

const DESCRIBES = [
  "CEO",
  "Consultant",
  "Hiring professional",
  "Individual learner",
  "Internal HR or training professional",
  "Other",
];

const INTERESTS = [
  "Individual engagement",
  "Team or organization program",
  "Partnership",
  "Request information",
  "Other",
];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia",
  "Zimbabwe",
];

/* the A's four lines, on their centrelines in logo units, feet run a little past the baseline and clipped square */
const COLS = ["#2F2F2F", "#7DB8D6", "#E55934", "#F2B950"];
const LEG = (c: number) => {
  const x0 = 1992.8 + 42 * c, ax = x0 + 307.1, dx = 307.1 * 0.06, dy = 495.3 * 0.06;
  return `M${(x0 - dx).toFixed(1)},${(520 + dy).toFixed(1)} L${ax.toFixed(1)},24.67 L${(x0 + 614.2 + dx).toFixed(1)},${(520 + dy).toFixed(1)}`;
};

const CONNECT_CSS = `
        body { background: #F6F5F2; }
        .gx { min-height: 100vh; background: #F6F5F2; color: #2F2F2F; display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 6vw;
          padding: clamp(110px, 15vh, 170px) 5vw clamp(40px, 6vh, 72px); box-sizing: border-box;
          font-family: 'Red Hat Display', Inter, sans-serif; }
        .gx-left { display: flex; flex-direction: column; min-height: 100%; }
        .gx h1 { margin: 0; white-space: nowrap; font: 500 clamp(44px, 5.4vw, 100px)/.96 'Red Hat Display', Inter, sans-serif;
          letter-spacing: -.005em; text-transform: uppercase; }
        .gx-lede { margin: clamp(22px, 3.4vh, 36px) 0 0; max-width: 42ch; text-wrap: balance; color: #5C5A55;
          font: 400 clamp(18px, 1.4vw, 23px)/1.5 'Red Hat Display', Inter, sans-serif; }
        .gx-rule { width: min(100%, 560px); height: 1px; background: #D9D5CC; margin: clamp(34px, 6vh, 64px) 0 clamp(26px, 4.4vh, 44px); }
        .gx-contact { display: flex; flex-direction: column; font: 400 clamp(16px, 1.2vw, 20px)/1.5 'Red Hat Display', Inter, sans-serif; font-style: normal; }
        .gx-contact a { color: inherit; text-decoration: none; }
        .gx-contact a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .gx-a { margin-top: auto; padding-top: clamp(40px, 7vh, 90px); width: min(78%, 520px); height: auto; overflow: visible; }
        .gx-a .k { stroke: #F6F5F2; stroke-width: 54; }
        .gx-a .l { stroke-width: 15; }
        .gx-a .k, .gx-a .l { stroke-dasharray: 1 1; stroke-dashoffset: 1; animation: gxDraw 1.5s cubic-bezier(.6,0,.2,1) forwards paused; }
        .gx-a.go .k, .gx-a.go .l { animation-play-state: running; }   /* starts once the page transition has finished */
        .gx-a .w { stroke-width: 15; stroke-dasharray: 0 1; }
        @keyframes gxDraw { to { stroke-dashoffset: 0; } }

        .gx-card { align-self: start; border: 1px solid #D9D5CC; border-radius: 24px; background: #FBFAF7;
          padding: clamp(28px, 3.4vw, 52px); box-sizing: border-box; }
        .gx-form { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 16px; }
        .gx-full { grid-column: 1 / -1; }
        .gx-field { margin: 0; min-width: 0; border: 1px solid #D9D5CC; border-radius: 12px; padding: 0 16px 2px; transition: border-color .2s ease; }
        .gx-field:focus-within { border-color: #2F2F2F; }
        .gx-field legend { padding: 0 6px; margin-left: -6px; font: 500 11px/1 'Red Hat Display', Inter, sans-serif;
          letter-spacing: .16em; text-transform: uppercase; color: #6B6862; }
        .gx-field input, .gx-field select, .gx-field textarea { display: block; width: 100%; border: 0; outline: none; background: transparent;
          padding: 8px 0 12px; font: 400 17px/1.4 Inter, sans-serif; color: #2F2F2F; border-radius: 0; box-sizing: border-box; }
        .gx-field input::placeholder, .gx-field textarea::placeholder { color: #A9A59D; }
        .gx-field textarea { resize: vertical; min-height: 96px; }
        .gx-field select { appearance: none; -webkit-appearance: none; cursor: pointer; padding-right: 22px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236B6862' stroke-width='1.4'/%3E%3C/svg%3E") no-repeat right 2px center; }
        .gx-field select:invalid, .gx-field select:has(option[value=""]:checked) { color: #A9A59D; }
        .gx-field option { color: #2F2F2F; }
        .gx-q { margin: 8px 0 0; padding: 0; border: 0; }
        .gx-q legend { padding: 0; margin-bottom: 12px; font: 500 11px/1 'Red Hat Display', Inter, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #6B6862; }
        /* two on the first row, three on the second */
        .gx-chips { display: flex; flex-direction: column; gap: 10px; }
        .gx-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .gx-chip input { position: absolute; opacity: 0; pointer-events: none; }
        .gx-chip span { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border: 1px solid #D9D5CC; border-radius: 999px;
          font: 400 15px/1 Inter, sans-serif; color: #2F2F2F; cursor: pointer; transition: background .2s, color .2s, border-color .2s; }
        .gx-chip span:hover { border-color: #2F2F2F; }
        .gx-chip input:checked + span { background: #2F2F2F; border-color: #2F2F2F; color: #F6F5F2; }
        .gx-chip input:focus-visible + span { outline: 2px solid #7DB8D6; outline-offset: 2px; }
        .gx-send { justify-self: start; margin-top: 10px; height: 56px; padding: 0 44px; border: 1.5px solid #2F2F2F; border-radius: 5px;
          background: #2F2F2F; color: #F6F5F2; font: 400 14px 'Red Hat Display', Inter, sans-serif; letter-spacing: .2em; text-transform: uppercase;
          cursor: pointer; transition: background .25s, color .25s; }
        .gx-send:hover, .gx-send:focus-visible { background: transparent; color: #2F2F2F; outline: none; }
        .gx-send:disabled { opacity: .6; cursor: wait; }
        .gx-note { grid-column: 1 / -1; margin: 4px 0 0; font: 400 15px/1.5 'Red Hat Display', Inter, sans-serif; }
        .nav-home:hover, .nav-home:focus-visible { background: #2F2F2F !important; color: #F6F5F2 !important; outline: none; }
        .gx-contact-m { display: none; }
        .gx-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

        @media (max-width: 900px) {
          .gx { grid-template-columns: 1fr; row-gap: 44px; padding: 104px 6vw 48px; }
          .gx h1 { font-size: 11.4vw; }
          /* phones: straight from the intro into the form; contact details follow the form */
          .gx-left .gx-rule, .gx-left .gx-contact, .gx-left .gx-a { display: none; }
          .gx-contact-m { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; border-top: 1px solid #D9D5CC; padding-top: 28px; margin-top: -8px; }
          .gx-contact-m .gx-contact { text-align: right; font-size: 15px; }
          .gx-a-m { width: 38%; max-width: 160px; margin: 0; padding: 0; flex: none; }
          .gx-left { min-height: 0; }
          .gx-card { padding: 26px 20px; border-radius: 20px; }
          .gx-form { grid-template-columns: 1fr; }
          .gx-chip span { padding: 0 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gx-a .k, .gx-a .l { animation: none; stroke-dashoffset: 0; }
        }
      `;

/* The four-line A. It draws in, then its colours pass one line over in a single wipe (as in the homepage
   footer), then rests. start="transition": once any page transition has finished (desktop, beside the intro).
   start="view": once it scrolls into view (phones, under the form). Plays once. */
function AMark({ className, start }: { className: string; start: "transition" | "view" }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    let t = 0, live = true, io: IntersectionObserver | null = null;
    const play = () => {
      if (!live || svg.classList.contains("go")) return;
      svg.classList.add("go");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      t = window.setTimeout(() => {
        svg.querySelectorAll<SVGGElement>("g[data-k]").forEach((g) => {
          const k = Number(g.dataset.k), base = g.querySelector<SVGPathElement>(".l"), w = g.querySelector<SVGPathElement>(".w");
          if (!base || !w || !w.animate) return;
          const col = COLS[(k + 1) % 4];
          w.style.stroke = col;
          w.style.strokeDasharray = "1 0";
          const an = w.animate([{ strokeDasharray: "0 1" }, { strokeDasharray: "1 0" }],
            { duration: 1700, delay: k * 160, easing: "cubic-bezier(.6,0,.2,1)", fill: "backwards" });
          an.onfinish = () => { base.setAttribute("stroke", col); w.style.strokeDasharray = "0 1"; };
        });
      }, 0.25 * 1000 + 3 * 200 + 1500 + 900);
    };
    const vt = (window as unknown as { __frameVT?: Promise<unknown> }).__frameVT;
    Promise.resolve(vt).catch(() => {}).then(() => {
      if (!live) return;
      if (start === "transition") { play(); return; }
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io?.disconnect(); play(); } }, { threshold: 0.6 });
      io.observe(svg);
    });
    return () => { live = false; window.clearTimeout(t); io?.disconnect(); };
  }, [start]);
  const id = `gxclip-${start}`;
  return (
    <svg ref={ref} className={className} viewBox="1950 -10 830 545" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x="1900" y="-100" width="1000" height="620" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinejoin="miter" strokeMiterlimit={8}>
        {[3, 2, 1, 0].map((c) => (
          <g key={c} data-k={c}>
            <path className="k" d={LEG(c)} pathLength={1} style={{ animationDelay: `${0.25 + c * 0.2}s` }} />
            <path className="l" d={LEG(c)} pathLength={1} stroke={COLS[c]} style={{ animationDelay: `${0.25 + c * 0.2}s` }} />
            <path className="w" d={LEG(c)} pathLength={1} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className="gx-field">
      <legend>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export default function ConnectPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setFormStatus(res.ok ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Red+Hat+Display:wght@300;400;500&display=swap"
      />
      {/* raw CSS: passed as HTML so the quotes in the font names are not escaped */}
      <style dangerouslySetInnerHTML={{ __html: CONNECT_CSS }} />

      <main className="gx">
        <section className="gx-left">
          <h1>Get in touch</h1>
          <p className="gx-lede">
            Tell us what you&apos;re working on, where you&apos;re stuck, or what you&apos;d like to explore. We&apos;ll follow up
            with the best next step.
          </p>
          <div className="gx-rule" />
          <address className="gx-contact">
            <a href="mailto:hello@frame.institute">hello@frame.institute</a>
            <a href="tel:+12124705433">+1 212 470 5433</a>
            <span>224 W 35th St Ste 500</span>
            <span>New York, NY 10001</span>
          </address>
          <AMark className="gx-a" start="transition" />
        </section>

        <section className="gx-card" aria-label="Contact form">
          <form className="gx-form" onSubmit={handleSubmit}>
            <div className="gx-hp" aria-hidden="true">
              <label>
                Leave this empty
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <Field label="First name" required>
              <input name="first_name" type="text" required autoComplete="given-name" placeholder="First name" />
            </Field>
            <Field label="Last name" required>
              <input name="last_name" type="text" required autoComplete="family-name" placeholder="Last name" />
            </Field>
            <Field label="Email address" required>
              <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="name@company.com" />
            </Field>
            <Field label="Phone number" required>
              <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="Phone" />
            </Field>
            <Field label="Company / organization">
              <input name="company" type="text" autoComplete="organization" placeholder="Optional" />
            </Field>
            <Field label="Country">
              <select name="country" defaultValue="" autoComplete="country-name">
                <option value="">Optional</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="gx-full">
              <Field label="Which best describes you?" required>
                <select name="describes_you" defaultValue="" required>
                  <option value="" disabled>Select one</option>
                  {DESCRIBES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
            </div>

            <fieldset className="gx-q gx-full">
              <legend>What are you interested in? *</legend>
              <div className="gx-chips">
                {[INTERESTS.slice(0, 2), INTERESTS.slice(2)].map((row, r) => (
                  <div className="gx-row" key={r}>
                    {row.map((opt) => (
                      <label className="gx-chip" key={opt}>
                        <input type="radio" name="interest" value={opt} required={opt === INTERESTS[0]} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="gx-full">
              <Field label="Message">
                <textarea name="message" rows={3} placeholder="Optional — anything you’d like us to know" />
              </Field>
            </div>

            <button className="gx-send" type="submit" disabled={formStatus === "submitting"}>
              {formStatus === "submitting" ? "Sending…" : "Send"}
            </button>

            {formStatus === "success" && (
              <p className="gx-note" role="status">Thank you — we&apos;ll be in touch soon.</p>
            )}
            {formStatus === "error" && (
              <p className="gx-note" role="alert" style={{ color: "#B23B3B" }}>
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>
        </section>

        <div className="gx-contact-m">
          <AMark className="gx-a gx-a-m" start="view" />
          <address className="gx-contact">
            <a href="mailto:hello@frame.institute">hello@frame.institute</a>
            <a href="tel:+12124705433">+1 212 470 5433</a>
            <span>224 W 35th St Ste 500</span>
            <span>New York, NY 10001</span>
          </address>
        </div>
      </main>
    </>
  );
}

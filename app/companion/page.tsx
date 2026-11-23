import type { Metadata } from "next";
import { readFileSync } from "fs";
import path from "path";

// Unlisted page: not linked anywhere on the site and kept out of search.
// To publish a new Companion, replace public/companion/FRAME_Companion.md.
// The version shown here is read from that file's first line at build time.

export const metadata: Metadata = {
  title: "FRAME Companion",
  description: "Download the latest FRAME Companion.",
  robots: { index: false, follow: false, nocache: true },
};

const FILE_URL = "/companion/FRAME_Companion.md";

const FONT     = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_LT  = "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SLT = "'nitti-grotesk-semilight', 'Helvetica Neue', Helvetica, Arial, sans-serif";

function companionVersion(): string | null {
  try {
    const file = readFileSync(path.join(process.cwd(), "public", "companion", "FRAME_Companion.md"), "utf8");
    const match = file.slice(0, 400).match(/VERSION\s+([0-9][0-9.]*)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export default function CompanionPage() {
  const version  = companionVersion();
  const fileName = version ? `FRAME_Companion_v${version}.md` : "FRAME_Companion.md";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        padding: "8rem 1.5rem 4rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "640px", margin: "0 auto" }}>
        <p
          style={{
            fontFamily: FONT_SLT,
            fontSize: "13px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#777",
            marginBottom: "1.25rem",
          }}
        >
          For FRAME participants
        </p>

        <h1
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "0.02em",
            lineHeight: 1.08,
            marginBottom: "1.5rem",
          }}
        >
          The FRAME Companion
        </h1>

        <p
          style={{
            fontFamily: FONT_LT,
            fontWeight: 300,
            fontSize: "clamp(18px, 1.5vw, 21px)",
            lineHeight: 1.55,
            letterSpacing: "0.01em",
            color: "#333",
            marginBottom: "2.5rem",
          }}
        >
          This page always has the most current version. Download the file and upload
          it to your AI assistant alongside your FRAME profile.
        </p>

        <a
          href={FILE_URL}
          download={fileName}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.95rem 2rem",
            background: "#1a1a1a",
            color: "#ffffff",
            fontFamily: FONT_LT,
            fontWeight: 500,
            fontSize: "clamp(15px, 1.2vw, 17px)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Download the Companion
        </a>

        {version && (
          <p
            style={{
              fontFamily: FONT_SLT,
              fontSize: "14px",
              letterSpacing: "0.04em",
              color: "#888",
              marginTop: "1.25rem",
            }}
          >
            Version {version}
          </p>
        )}
      </div>
    </main>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePageTransition } from "./TransitionProvider";

const FONT_LIGHT = "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_REG   = "'nitti-grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const LOGO_THRESHOLD    = 0.9;
const FOOTER_RISE_START = 7000;

export default function NavBar() {
  const pathname        = usePathname();
  const isHomePage      = pathname === "/";
  const isConnectPage   = pathname === "/connect";
  const { navigateTo }  = usePageTransition();

  const [pastHero,     setPastHero]     = useState(false);
  const [footerActive, setFooterActive] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * LOGO_THRESHOLD);
      setFooterActive(window.scrollY >= FOOTER_RISE_START);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  const showLogo = isHomePage ? pastHero : true;
  // Footer hides the nav on the home page only; Connect always shows it
  const hideNav  = isHomePage && footerActive;

  return (
    <nav
      style={{
        position: "fixed",
        top: "1rem",
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        height: "calc(1.3rem + 1.2 * clamp(15px, 1.2vw, 17px))",
        pointerEvents: "none",
        opacity: hideNav ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* FRAME wordmark — clickable on connect page to go home */}
      <div
        onClick={isConnectPage ? () => navigateTo("/") : undefined}
        style={{
          fontFamily: FONT_REG,
          fontWeight: 400,
          fontSize: "clamp(34px, 2.9vw, 44px)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#1a1a1a",
          lineHeight: 1,
          opacity: showLogo ? 1 : 0,
          pointerEvents: showLogo ? "auto" : "none",
          transition: "opacity 0.4s ease",
          cursor: isConnectPage ? "pointer" : "default",
        }}
      >
        FRAME
      </div>

      {/* Connect / Home button */}
      <button
        onClick={() => isConnectPage ? navigateTo("/") : navigateTo("/connect")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.65rem 1.6rem",
          background: "#000000",
          color: "#ffffff",
          fontFamily: FONT_LIGHT,
          fontWeight: 500,
          fontSize: "clamp(15px, 1.2vw, 17px)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: "5px",
          cursor: "pointer",
          border: "none",
          pointerEvents: hideNav ? "none" : "auto",
        }}
      >
        {isConnectPage ? "Home" : "Connect"}
      </button>
    </nav>
  );
}

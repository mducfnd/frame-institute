"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePageTransition } from "./TransitionProvider";

const FONT_LIGHT = "'nitti-grotesk-light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

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
        // On Connect the nav scrolls away with the page, so the headline never slides underneath it
        position: isConnectPage ? "absolute" : "fixed",
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
      {/* FRAME logo — clickable on connect page to go home */}
      <img
        src={isConnectPage ? "/assets/frame-logo-color.svg" : "/assets/frame-logo-mono.svg"}  /* Connect shows the homepage logo, A in colour */
        alt="FRAME"
        onClick={isConnectPage ? () => navigateTo("/") : undefined}
        style={{
          display: "block",
          height: "clamp(18px, 1.45vw, 22px)",
          width: "auto",
          opacity: showLogo ? 1 : 0,
          pointerEvents: showLogo ? "auto" : "none",
          transition: "opacity 0.4s ease",
          cursor: isConnectPage ? "pointer" : "default",
        }}
      />

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
          // On Connect the button matches the homepage's Connect button: a thin charcoal outline
          ...(isConnectPage ? {
            minHeight: "44px",
            padding: "0.7rem 1.6rem",
            background: "transparent",
            color: "#2F2F2F",
            border: "1px solid #2F2F2F",
            fontFamily: "'Red Hat Display', Inter, sans-serif",
            fontWeight: 400,
            fontSize: "clamp(13px, 1.1vw, 16px)",
            letterSpacing: "0.2em",
            transition: "background .3s ease, color .3s ease",
          } : {}),
        }}
        className={isConnectPage ? "nav-home" : undefined}
      >
        {isConnectPage ? "Home" : "Connect"}
      </button>
    </nav>
  );
}

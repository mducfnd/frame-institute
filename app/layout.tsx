import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import TransitionProvider from "@/components/TransitionProvider";
import { PAGE_TRANSITION_SCRIPT } from "@/lib/pageTransitionScript";

export const metadata: Metadata = {
  title: "FRAME",
  description: "The architecture of motivation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://use.typekit.net/sla1bed.css" />
        {/* plays the shrink-and-slide transition when arriving from the home page */}
        <script dangerouslySetInnerHTML={{ __html: PAGE_TRANSITION_SCRIPT }} />
      </head>
      <body>
        <TransitionProvider>
          <NavBar />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}

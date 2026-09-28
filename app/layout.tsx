import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import TransitionProvider from "@/components/TransitionProvider";

export const metadata: Metadata = {
  title: "FRAME",
  description: "The architecture of motivation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/sla1bed.css" />
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

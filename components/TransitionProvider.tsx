"use client";
import { createContext, useContext, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { prefersReducedMotion } from "@/lib/media";

interface TransitionCtx { navigateTo: (path: string) => void; }
const TransitionContext = createContext<TransitionCtx>({ navigateTo: () => {} });
export function usePageTransition() { return useContext(TransitionContext); }

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigateTo = useCallback((path: string) => {
    if (!("startViewTransition" in document) || prefersReducedMotion()) {
      router.push(path);
      return;
    }

    // Going back to "/" reverses the direction — new page drops from above
    const isReverse = path === "/";

    const transition = (document as any).startViewTransition(() => {
      router.push(path);
    });

    transition.ready.then(() => {
      // Old page: shrinks to 85%, then exits in the departure direction
      document.documentElement.animate(
        [
          { transform: "scale(1)",                                              offset: 0,   easing: "cubic-bezier(0.86, 0, 0.07, 1)" },
          { transform: "scale(0.85)",                                           offset: 0.5, easing: "cubic-bezier(0.86, 0, 0.07, 1)" },
          { transform: `translateY(${isReverse ? "100%" : "-100%"}) scale(0.85)`, offset: 1 },
        ],
        {
          duration: 1200,
          easing: "linear",
          fill: "forwards",
          pseudoElement: "::view-transition-old(root)",
        }
      );

      // New page: holds off-screen, slides in from the arrival direction, then scales up
      document.documentElement.animate(
        [
          { transform: `translateY(${isReverse ? "-100%" : "100%"}) scale(0.85)`, offset: 0,     easing: "linear" },
          { transform: `translateY(${isReverse ? "-100%" : "100%"}) scale(0.85)`, offset: 1 / 3, easing: "cubic-bezier(0.86, 0, 0.07, 1)" },
          { transform: "translateY(0) scale(0.85)",                               offset: 2 / 3, easing: "cubic-bezier(0.86, 0, 0.07, 1)" },
          { transform: "translateY(0) scale(1)",                                  offset: 1 },
        ],
        {
          duration: 1800,
          easing: "linear",
          fill: "both",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }, [router]);

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
    </TransitionContext.Provider>
  );
}

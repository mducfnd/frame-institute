import Hero from "@/components/Hero";
import ContentSection from "@/components/ContentSection";
import ThirdSection from "@/components/ThirdSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    /*
     * Total scroll travel: 8800px
     *   1100px  → Hero zoom + fade (reveals ContentSection)
     *   3000px  → Accordion: 6 words × 500px each  (ends at 4100)
     *    500px  → Zoom-into-white + ThirdSection fade-in (4100–4600)
     *    500px  → Transition video plays during "dead" scroll (4600–5100)
     *   1300px  → Text reveal + hold (5100–6400)
     *    700px  → Footer slides up from bottom (6400–7100)
     *   1700px  → Footer fully visible, hover to explore (7100–8800)
     */
    <div style={{ height: "calc(100vh + 12000px)" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <FooterSection />
        <ThirdSection />
        <ContentSection />
        <Hero />
      </div>
    </div>
  );
}

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function LegalPage({
  kicker,
  title,
  intro,
  sections,
  note,
}: {
  kicker: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  note?: string;
}) {
  return (
    <main>
      <SiteHeader />
      <section className="legal-page">
        <div className="shell legal-shell">
          <div className="legal-hero">
            <div className="kicker">{kicker}</div>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          <article className="legal-card">
            {sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              </section>
            ))}
            {note ? <div className="legal-note">{note}</div> : null}
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

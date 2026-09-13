import type { ArticleDeepDive } from "@/lib/articleDeepDive";

export default function ArticleDeepDiveBlock({ deepDive }: { deepDive: ArticleDeepDive }) {
  const faqJsonLd = deepDive.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: deepDive.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : null;

  return (
    <section className="article-deep-dive">
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />}
      <div className="article-deep-dive-head">
        <div className="kicker">{deepDive.kicker}</div>
        <h2>{deepDive.title}</h2>
        <div className="article-quick-answer">
          <strong>W skrócie</strong>
          <p>{deepDive.quickAnswer}</p>
          {deepDive.checkedAt && <small>Sprawdzone: {deepDive.checkedAt}</small>}
        </div>
      </div>

      <div className="article-deep-dive-sections">
        {deepDive.sections.map((section) => (
          <section key={section.title} className="article-deep-section">
            <h3>{section.title}</h3>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
            {section.table ? (
              <div className="article-table-wrap">
                <table>
                  <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                  <tbody>{section.table.rows.map((row, rowIndex) => <tr key={`${section.title}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {deepDive.checklist?.length ? (
        <section className="article-checklist">
          <h3>Checklista przed wyjazdem</h3>
          <ol>{deepDive.checklist.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>
      ) : null}

      {deepDive.faq?.length ? (
        <section className="article-faq">
          <h3>Najczęstsze pytania</h3>
          <div>{deepDive.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>
      ) : null}

      {deepDive.sources?.length ? (
        <section className="article-sources">
          <h3>Źródła i aktualne zasady</h3>
          <div>{deepDive.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} →</a>)}</div>
        </section>
      ) : null}
    </section>
  );
}

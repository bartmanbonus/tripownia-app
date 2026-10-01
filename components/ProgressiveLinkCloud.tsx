import Link from "next/link";

type Item = { href: string; label: string };

export default function ProgressiveLinkCloud({
  items,
  visible = 6,
  moreLabel = "Pokaż więcej kierunków i filtrów",
}: {
  items: Item[];
  visible?: number;
  moreLabel?: string;
}) {
  const first = items.slice(0, visible);
  const rest = items.slice(visible);

  return (
    <div className="progressive-link-cloud">
      <div className="seo-related-links">
        {first.map((item) => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
      {rest.length > 0 && (
        <details>
          <summary>{moreLabel} <span>+{rest.length}</span></summary>
          <div className="seo-related-links progressive-link-cloud-more">
            {rest.map((item) => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
          </div>
        </details>
      )}
    </div>
  );
}

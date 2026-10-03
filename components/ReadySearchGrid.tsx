import Link from "next/link";

export type ReadySearchItem = {
  href: string;
  eyebrow: string;
  title: string;
  meta: string;
  cta?: string;
};

export default function ReadySearchGrid({
  items,
  className = "",
}: {
  items: ReadySearchItem[];
  className?: string;
}) {
  return (
    <div className={`ready-search-grid ${className}`.trim()}>
      {items.map((item) => (
        <Link className="ready-search-card" href={item.href} key={`${item.href}|${item.title}`}>
          <small>{item.eyebrow}</small>
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
          <b>{item.cta || "Pokaż konkretne wyniki →"}</b>
        </Link>
      ))}
    </div>
  );
}

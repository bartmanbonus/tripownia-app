type Props = {
  name: string;
  description: string;
  path: string;
  about?: string[];
};

export default function SalesCollectionSchema({ name, description, path, about = [] }: Props) {
  const url = `https://tripownia.pl${path}`;
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "Tripownia.pl", url: "https://tripownia.pl" },
    ...(about.length ? { about } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    </>
  );
}

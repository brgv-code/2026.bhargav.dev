import { JsonLd } from "@/components/seo/jsonld";

type BreadcrumbItem = {
  name: string;
  href: string;
};

type Props = {
  id?: string;
  items: BreadcrumbItem[];
};

export function BreadcrumbsJsonLd({ id, items }: Props) {
  return (
    <JsonLd
      id={id}
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.href,
        })),
      }}
    />
  );
}

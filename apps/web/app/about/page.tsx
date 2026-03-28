import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { fetchProfile } from "@/lib/data/cms";
import {
  absoluteUrl,
  defaultDescription,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: "About Bhargav and the work he does.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
  openGraph: {
    type: "profile",
    title: "About",
    description: "About Bhargav and the work he does.",
    url: absoluteUrl("/about"),
    siteName,
    images: [
      {
        url: "/og-about.svg",
        width: 1200,
        height: 630,
        alt: "About Bhargav",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description: "About Bhargav and the work he does.",
    images: ["/og-about.svg"],
  },
};

export const dynamic = "force-static";

export default async function AboutPage() {
  const profile = await fetchProfile();
  const name = profile?.name ?? "Bhargav";
  const tagline =
    profile?.tagline ??
    "Product-focused developer building intentional interfaces.";
  const bio = profile?.bio ?? "";
  const aboutText = bio || defaultDescription;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Who is ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: aboutText,
        },
      },
      {
        "@type": "Question",
        name: `What does ${name} focus on?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tagline,
        },
      },
    ],
  };

  return (
    <section className="px-12 pt-28 pb-24">
      <div className="flex items-baseline justify-between border-b border-border/15 pb-4 mb-12">
        <h1 className="font-serif text-3xl text-accent">About</h1>
      </div>

      <div className="max-w-2xl flex flex-col gap-12">
        <div>
          <JsonLd
            id="about-profile"
            data={{
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "@id": `${absoluteUrl("/about")}#profile`,
              url: absoluteUrl("/about"),
              name: `About ${name}`,
              description: aboutText,
              isPartOf: { "@id": `${siteUrl}#website` },
              about: { "@id": `${siteUrl}#person` },
              mainEntity: { "@id": `${siteUrl}#person` },
            }}
          />
          <BreadcrumbsJsonLd
            id="about-breadcrumbs"
            items={[
              { name: "Home", href: absoluteUrl("/") },
              { name: "About", href: absoluteUrl("/about") },
            ]}
          />
          <JsonLd id="faq-about" data={faqJsonLd} />

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-primary">{name}</h2>
            <p className="text-base text-secondary leading-relaxed">
              {aboutText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

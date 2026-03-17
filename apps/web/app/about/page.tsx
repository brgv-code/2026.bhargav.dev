import type { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { JsonLd } from "@/components/seo/jsonld";
import { fetchProfile } from "@/lib/data/cms";
import {
  absoluteUrl,
  defaultDescription,
  siteName,
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
    <section className="pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="grid grid-cols-3 items-center pt-24 mb-10">
          <span />
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
            About
          </h2>
          <div className="justify-self-end">
            <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <JsonLd id="faq-about" data={faqJsonLd} />

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-primary">{name}</h1>
            <p className="text-base text-secondary leading-relaxed">
              {aboutText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

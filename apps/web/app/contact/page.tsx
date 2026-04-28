import type { Metadata } from "next";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";
import { fetchProfile } from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { ContactLinks } from "@/components/contact/contact-links";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — email, GitHub, Twitter, or LinkedIn.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    type: "website",
    title: "Contact",
    description: "Get in touch — email, GitHub, Twitter, or LinkedIn.",
    url: absoluteUrl("/contact"),
    siteName,
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

export default async function ContactPage() {
  const profile = await fetchProfile();

  const links = [
    profile?.email && {
      label: "EMAIL",
      method: "email" as const,
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
    },
    profile?.github && {
      label: "GITHUB",
      method: "github" as const,
      value: profile.github.startsWith("http")
        ? profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, "@")
        : profile.github,
      href: profile.github.startsWith("http")
        ? profile.github
        : `https://github.com/${profile.github}`,
      icon: Github,
    },
    profile?.x && {
      label: "TWITTER",
      method: "twitter" as const,
      value: profile.x.startsWith("http")
        ? profile.x.replace(/^https?:\/\/(www\.)?x\.com\//, "@")
        : profile.x,
      href: profile.x.startsWith("http")
        ? profile.x
        : `https://x.com/${profile.x}`,
      icon: Twitter,
    },
    profile?.linkedin && {
      label: "LINKEDIN",
      method: "linkedin" as const,
      value: profile.linkedin.startsWith("http")
        ? profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")
        : profile.linkedin,
      href: profile.linkedin.startsWith("http")
        ? profile.linkedin
        : `https://linkedin.com/in/${profile.linkedin}`,
      icon: Linkedin,
    },
  ].filter(Boolean) as React.ComponentProps<typeof ContactLinks>["links"];

  return (
    <>
      <BreadcrumbsJsonLd
        id="contact-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Contact", href: absoluteUrl("/contact") },
        ]}
      />

      <div className="mx-auto max-w-3xl px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-muted">Say hello</p>
        <h1 className="mt-3 font-serif text-5xl font-black tracking-tight text-primary">
          Contact
        </h1>
        <p className="mt-4 text-lg text-secondary font-serif leading-relaxed max-w-prose">
          The fastest way to reach me is email. I read everything, reply to most things, usually within a few days.
        </p>

        {links.length > 0 && <ContactLinks links={links} />}
      </div>
    </>
  );
}

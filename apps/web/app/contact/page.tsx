import type { Metadata } from "next";
import { Mail, Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { fetchProfile } from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

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
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
    },
    profile?.github && {
      label: "GITHUB",
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
      value: profile.linkedin.startsWith("http")
        ? profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")
        : profile.linkedin,
      href: profile.linkedin.startsWith("http")
        ? profile.linkedin
        : `https://linkedin.com/in/${profile.linkedin}`,
      icon: Linkedin,
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];

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

        {links.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="group flex items-center gap-4 rounded border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-highlight text-muted group-hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
                  <p className="mt-0.5 text-sm font-medium text-primary truncate">{value}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

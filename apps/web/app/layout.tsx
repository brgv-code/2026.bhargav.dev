import React from "react";
import { Github, Twitter, Linkedin } from "lucide-react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@repo/ui";
import { SoundProvider } from "@/components/providers/sound-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { JsonLd } from "@/components/seo/jsonld";
import { fetchProfile } from "@/lib/data/cms";
import {
  absoluteUrl,
  buildSameAs,
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { BioBlock } from "@/components/aside/bio-block";
import { SidebarNav } from "@/components/aside/sidebar-nav";
import { DarkModeToggle } from "@/components/shared/dark-mode-toggle";
import "./globals.css";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    title: defaultTitle,
    description: defaultDescription,
    url: absoluteUrl("/"),
    siteName,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Bhargav — Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og.svg"],
  },
  verification: {
    google: googleVerification || undefined,
    other: bingVerification ? { "msvalidate.01": bingVerification } : undefined,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const dynamic = "force-static";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await fetchProfile();
  const name = profile?.name ?? "Bhargav";
  const tagline =
    profile?.tagline ?? "Product-focused developer building intentional interfaces.";
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";
  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL;
  const linkedinUrl = profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const sameAs = buildSameAs([githubUrl, linkedinUrl, twitterUrl]);
  const personId = `${siteUrl}#person`;
  const websiteId = `${siteUrl}#website`;

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider delayDuration={80} skipDelayDuration={500}>
            <SoundProvider>
              <div className="flex min-h-screen bg-background text-primary md:h-screen md:overflow-hidden">
                <JsonLd
                  id="structured-data"
                  data={{
                    "@context": "https://schema.org",
                    "@graph": [
                      {
                        "@type": "Person",
                        "@id": personId,
                        name,
                        description: tagline,
                        url: absoluteUrl("/"),
                        sameAs,
                      },
                      {
                        "@type": "WebSite",
                        "@id": websiteId,
                        url: absoluteUrl("/"),
                        name: siteName,
                        publisher: { "@id": personId },
                      },
                    ],
                  }}
                />

                {/* Sidebar */}
                <aside className="flex w-full shrink-0 flex-col px-8 py-10 md:sticky md:top-0 md:h-screen md:w-52">
                  <div className="mb-10">
                    <BioBlock name={name} tagline={tagline} />
                  </div>

                  <SidebarNav />

                  <div className="mt-auto flex flex-col gap-4">
                    <a
                      href={resumeUrl}
                      className="block w-full bg-accent py-3 px-4 text-center text-[10px] font-medium tracking-[0.15em] uppercase text-accent-foreground transition-opacity hover:opacity-90"
                    >
                      Download CV
                    </a>
                    <div className="flex items-center gap-3">
                      <DarkModeToggle className="text-muted transition-colors hover:text-primary" />
                      {githubUrl ? (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-muted transition-colors hover:text-primary"
                        >
                          <Github size={16} aria-hidden="true" />
                        </a>
                      ) : null}
                      {twitterUrl ? (
                        <a
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="X / Twitter"
                          className="text-muted transition-colors hover:text-primary"
                        >
                          <Twitter size={16} aria-hidden="true" />
                        </a>
                      ) : null}
                      {linkedinUrl ? (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-muted transition-colors hover:text-primary"
                        >
                          <Linkedin size={16} aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </aside>

                {/* Main content */}
                <main id="main-scroll" className="flex-1 md:h-screen md:overflow-y-auto scroll-smooth">
                  {children}
                </main>
              </div>
            </SoundProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

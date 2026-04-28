import React from "react";
import { Github, Twitter, Linkedin, Rss } from "lucide-react";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
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
import { MainCardShell } from "@/components/layout/main-card-shell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Bhargav",
  },
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
  const tagline = profile?.tagline ?? "Fullstack & AI Developer";
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";
  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL;
  const linkedinUrl = profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const sameAs = buildSameAs([githubUrl, linkedinUrl, twitterUrl]);
  const personId = `${siteUrl}#person`;
  const websiteId = `${siteUrl}#website`;

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="overflow-hidden font-sans antialiased bg-background text-primary">
        <ThemeProvider>
          <TooltipProvider delayDuration={80} skipDelayDuration={500}>
            <SoundProvider>
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

              {/* Sidebar — fixed left panel, surface bg so it reads as a distinct
                  panel against the cream-200 body background in light mode.   */}
              <aside
                aria-label="Site navigation"
                className="hidden md:flex fixed left-0 top-0 h-screen w-sidebar flex-col py-10 px-4 overflow-y-auto z-sticky bg-surface border-r border-border-strong dark:border-border"
              >
                {/* Identity */}
                <div className="mb-8">
                  <BioBlock name={name} tagline={tagline} />
                </div>

                {/* Nav links */}
                <SidebarNav />

                {/* Sidebar footer */}
                <div className="mt-auto pt-5 border-t border-border-subtle space-y-4">
                  {/* CV download button
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-accent text-accent-foreground py-2.5 px-4 text-center text-2xs font-semibold tracking-ultra uppercase transition-opacity hover:opacity-90"
                  >
                    Download CV
                  </a>
                  */}

                  {/* Social icons + dark mode toggle */}
                  <div className="flex items-center gap-4">
                    <DarkModeToggle className="text-muted transition-colors hover:text-primary" />
                    {githubUrl ? (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="text-muted transition-colors hover:text-primary"
                      >
                        <Github size={15} aria-hidden="true" />
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
                        <Twitter size={15} aria-hidden="true" />
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
                        <Linkedin size={15} aria-hidden="true" />
                      </a>
                    ) : null}
                    <a
                      href="/rss.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="RSS Feed"
                      className="text-muted transition-colors hover:text-primary"
                    >
                      <Rss size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </aside>

              {/* Main: fixed viewport height; scroll lives inside MainCardShell */}
              <main className="flex h-screen min-h-0 flex-col overflow-hidden md:ml-sidebar">
                <MainCardShell>{children}</MainCardShell>
              </main>
            </SoundProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

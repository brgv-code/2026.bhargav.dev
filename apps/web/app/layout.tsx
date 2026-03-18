import React from "react";
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
                      {githubUrl ? (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-muted transition-colors hover:text-primary"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                          </svg>
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
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
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
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 md:h-screen md:overflow-y-auto">
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

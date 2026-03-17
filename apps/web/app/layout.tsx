import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@repo/ui";
import { SoundProvider } from "@/components/providers/sound-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { fetchProfile } from "@/lib/data/cms";
import { BioBlock } from "@/components/aside/bio-block";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Bhargav | Developer Portfolio",
  description:
    "Product focused developer turning coffee into code with Sutra and bringing ideas to life.",
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
  const bio = profile?.bio ?? null;
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";
  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL;
  const linkedinUrl = profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL;

  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${geistSans.variable} ${geistMono.variable}`}
      >
        <ThemeProvider>
          <TooltipProvider delayDuration={80} skipDelayDuration={500}>
            <SoundProvider>
              <div className="min-h-screen bg-background text-primary">
                <div className="mx-auto w-full max-w-6xl px-6 py-12 md:h-screen md:overflow-hidden md:px-10 md:py-16">
                  <div className="grid grid-cols-1 gap-12 md:h-full md:grid-cols-12 md:gap-16">
                    <aside className="md:col-span-4 md:h-full">
                      <div className="flex flex-col gap-8 md:h-full md:overflow-hidden">
                        <div className="flex flex-col gap-6 md:flex-1 md:justify-center">
                          <BioBlock name={name} tagline={tagline} bio={bio} />

                          <nav aria-label="Primary" className="flex flex-col gap-3">
                            <Link className="text-base text-primary" href="/writing">
                              Writing
                            </Link>
                            <Link className="text-base text-primary" href="/projects">
                              Projects
                            </Link>
                            <Link className="text-base text-primary" href="/experience">
                              Experience
                            </Link>
                          </nav>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-4 text-base text-primary">
                          {githubUrl ? (
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              GitHub
                            </a>
                          ) : null}
                          {twitterUrl ? (
                            <a
                              href={twitterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              X
                            </a>
                          ) : null}
                          {linkedinUrl ? (
                            <a
                              href={linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              LinkedIn
                            </a>
                          ) : null}
                          <a href={resumeUrl}>Resume</a>
                        </div>
                      </div>
                    </aside>

                    <main className="md:col-span-8 md:h-full md:overflow-y-auto">
                      {children}
                    </main>
                  </div>
                </div>
              </div>
            </SoundProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

import React from "react";
import type { Metadata } from "next";
import {
  Lora,
  Space_Mono,
  VT323,
  Inter,
  Newsreader,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@repo/ui";
import { SoundProvider } from "@/components/providers/sound-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { fetchProfile } from "@/lib/data/cms";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
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
    profile?.tagline ??
    "Product-focused developer building intentional interfaces.";
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";
  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL;
  const linkedinUrl = profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL;

  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${spaceMono.variable} ${vt323.variable} ${lora.variable} ${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
      >
        <ThemeProvider>
          <TooltipProvider delayDuration={80} skipDelayDuration={500}>
            <SoundProvider>
              <div className="min-h-screen bg-background text-primary">
                <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
                    <aside className="md:col-span-4">
                      <div className="flex flex-col gap-8 md:sticky md:top-24 md:min-h-[calc(100vh-6rem)]">
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-3">
                            <h1 className="text-4xl font-semibold tracking-tight text-primary">
                              {name}
                            </h1>
                            <p className="text-base leading-relaxed text-secondary">
                              {tagline}
                            </p>
                          </div>

                          <nav aria-label="Primary" className="flex flex-col gap-3">
                            <a className="text-base text-primary" href="#writing">
                              Writing
                            </a>
                            <a className="text-base text-primary" href="#projects">
                              Projects
                            </a>
                            <a className="text-base text-primary" href="#experience">
                              Experience
                            </a>
                          </nav>
                        </div>

                        <div className="mt-auto flex flex-col gap-6">
                          <div className="flex flex-wrap items-center gap-4 text-base text-primary">
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
                          </div>

                          <a
                            className="inline-flex items-center justify-between border border-border px-4 py-3 text-base font-medium text-primary"
                            href={resumeUrl}
                          >
                            Download Resume
                            <span aria-hidden>↓</span>
                          </a>
                        </div>
                      </div>
                    </aside>

                    <main className="md:col-span-8">{children}</main>
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

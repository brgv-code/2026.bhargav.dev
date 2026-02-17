import React from "react";
import type { Metadata } from "next";
import { Space_Mono, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SoundProvider } from "@/components/providers/sound-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const _spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const _vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Bhargav | Developer Portfolio",
  description:
    "Product focused developer turning coffee into code with Sutra and bringing ideas to life.",
  generator: "v0.app",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <SoundProvider>
            {children}
          </SoundProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

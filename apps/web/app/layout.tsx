import React from "react";
import type { Metadata } from "next";
import { Lora, Space_Mono, VT323, Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SoundProvider } from "@/components/providers/sound-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased ${spaceMono.variable} ${vt323.variable} ${lora.variable} ${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}>
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

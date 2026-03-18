import type { Metadata } from "next";
import Link from "next/link";
import { Github, Twitter, Linkedin, PenLine } from "lucide-react";
import {
  fetchBlogListPosts,
  fetchProjectsFromPayload,
  fetchWorkExperience,
  fetchProfile,
} from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { JsonLd } from "@/components/seo/jsonld";
import {
  absoluteUrl,
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 60;

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: absoluteUrl("/"),
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
};

export default async function Home() {
  const [posts, projects, work, profile] = await Promise.all([
    fetchBlogListPosts(10),
    fetchProjectsFromPayload(),
    fetchWorkExperience(),
    fetchProfile(),
  ]);

  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL;
  const linkedinUrl = profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";

  return (
    <>
      <JsonLd
        id="home-webpage"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${siteUrl}#home`,
          url: absoluteUrl("/"),
          name: defaultTitle,
          description: defaultDescription,
          isPartOf: { "@id": `${siteUrl}#website` },
          about: { "@id": `${siteUrl}#person` },
        }}
      />

      {/* Page content */}
      <div className="px-12 pt-28 pb-24 space-y-24">
        <WritingSection posts={posts} />
        <ProjectsSection projects={projects} />
        <ExperienceSection work={work} resumeUrl={resumeUrl} />

        {/* Page footer — quote + social pill */}
        <footer className="pt-16 border-t border-border/10 flex flex-col items-center gap-8">
          <div className="text-center space-y-2 max-w-2xl">
            <p className="font-serif italic text-xl text-secondary">
              &ldquo;Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest text-muted/60">
              — Antoine de Saint-Exupéry
            </p>
          </div>

          <nav
            aria-label="Social links"
            className="bg-surface px-8 py-4 flex items-center gap-8 shadow-sm"
          >
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-secondary hover:text-primary transition-colors"
              >
                <Github size={18} aria-hidden="true" />
              </a>
            ) : null}
            {twitterUrl ? (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="text-secondary hover:text-primary transition-colors"
              >
                <Twitter size={18} aria-hidden="true" />
              </a>
            ) : null}
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-secondary hover:text-primary transition-colors"
              >
                <Linkedin size={18} aria-hidden="true" />
              </a>
            ) : null}
          </nav>
        </footer>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link
          href="/writing/new"
          aria-label="Write new entry"
          className="w-14 h-14 bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <PenLine size={20} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}

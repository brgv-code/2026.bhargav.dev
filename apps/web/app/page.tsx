import type { Metadata } from "next";
import { Search } from "lucide-react";
import {
  fetchBlogListPosts,
  fetchProjectsFromPayload,
  fetchWorkExperience,
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
  const [posts, projects, work] = await Promise.all([
    fetchBlogListPosts(10),
    fetchProjectsFromPayload(),
    fetchWorkExperience(),
  ]);

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

      <div className="flex min-h-full flex-col">
        <div className="border-b border-border flex items-center justify-between px-8 py-5 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary leading-tight">
              Selected Work
            </h1>
            <p className="text-sm text-secondary mt-0.5">
              Writing, projects, and things I&apos;ve built.
            </p>
          </div>

          <label className="relative flex items-center shrink-0">
            <span className="sr-only">Search entries</span>
            <Search
              size={13}
              className="absolute left-3 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search entries"
              className="bg-background border border-border text-sm pl-8 pr-4 py-1.5 w-search focus:w-search-focus focus:outline-none focus:border-border-focus transition-all duration-slow text-primary placeholder:text-muted"
            />
          </label>
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-home-main min-h-0">
          <div className="xl:border-r xl:border-border min-w-0">
            <WritingSection posts={posts} />
          </div>
          <div className="hidden min-h-0 xl:block">
            <ExperienceSection
              work={work}
              resumeUrl={resumeUrl}
              variant="panel"
            />
          </div>
        </div>

        <div className="border-t border-border mt-auto">
          <ProjectsSection projects={projects} />
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import {
  fetchBlogListPosts,
  fetchProjectsFromPayload,
  fetchWorkExperience,
} from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { absoluteUrl, defaultDescription, defaultTitle, siteName } from "@/lib/seo";

export const dynamic = "force-static";

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

  return (
    <div className="flex flex-col pb-24">
      <WritingSection posts={posts} />
      <ProjectsSection projects={projects} />
      <ExperienceSection work={work} />
    </div>
  );
}

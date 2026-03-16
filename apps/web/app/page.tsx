import { fetchBlogListPosts, fetchProjectsFromPayload, fetchWorkExperience } from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";

export const dynamic = "force-static";

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

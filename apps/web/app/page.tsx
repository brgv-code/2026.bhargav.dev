import { Navbar } from "@/components/shared/navbar";
import { HomePageLayout } from "@/components/home/home-page-layout";
import { Footer } from "@/components/shared/footer";
import {
  fetchProfile,
  fetchBlogListPosts,
  fetchWorkExperience,
  fetchFavoritesFromPayload,
  fetchActivityFromPayload,
  fetchProjectsFromPayload,
} from "@/lib/data/cms";
import type { ProjectItem } from "@/lib/projects-data";
import { getCommitsThisWeek } from "@/lib/github";

export default async function Home() {
  const [profile, posts, work, favorites, commitsThisWeek, activityLog, projects] =
    await Promise.all([
      fetchProfile(),
      fetchBlogListPosts(10),
      fetchWorkExperience(),
      fetchFavoritesFromPayload(),
      getCommitsThisWeek(),
      fetchActivityFromPayload(),
      fetchProjectsFromPayload(),
    ]);

  const projectItems: ProjectItem[] = projects.map((project) => ({
    name: project.name,
    title: project.title ?? undefined,
    description: project.description,
    url: project.url,
    status: project.status ?? undefined,
    year: project.year ?? undefined,
    tech: Array.isArray(project.tech)
      ? project.tech
          .map((entry) => entry?.label)
          .filter((label): label is string => typeof label === "string")
      : undefined,
    github: project.github ?? undefined,
  }));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar commitCount={commitsThisWeek ?? undefined} />
      <div
        data-theme="editorial"
        className="flex-1 min-h-0 bg-[var(--editorial-bg)] flex flex-col overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <HomePageLayout
            profile={profile}
            posts={posts}
            projects={projectItems}
            work={work}
            favorites={favorites}
            activityLog={activityLog}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
}

import { Navbar } from "@/components/navbar";
import { HomePageLayout } from "@/components/home-page-layout";
import { Footer } from "@/components/footer";
import { fetchProfile, fetchBlogListPosts, fetchWorkExperience, fetchFavoritesFromPayload, fetchActivityFromPayload } from "@/lib/payload";
import { projectsList } from "@/lib/projects-data";
import { getCommitsThisWeek } from "@/lib/github";

export default async function Home() {
  const [profile, posts, work, favorites, commitsThisWeek, activityLog] = await Promise.all([
    fetchProfile(),
    fetchBlogListPosts(10),
    fetchWorkExperience(),
    fetchFavoritesFromPayload(),
    getCommitsThisWeek(),
    fetchActivityFromPayload(),
  ]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar commitCount={commitsThisWeek ?? undefined} />
      <div data-theme="editorial" className="flex-1 min-h-0 bg-[var(--editorial-bg)] flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <HomePageLayout
            profile={profile}
            posts={posts}
            projects={projectsList}
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

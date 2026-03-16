import type { Metadata } from "next";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";

export const metadata: Metadata = {
  title: "Writing",
  description: "All published writing and essays.",
};

export const dynamic = "force-static";

export default async function WritingIndexPage() {
  const posts = await fetchBlogListPosts(500);

  return (
    <div className="flex flex-col gap-16 pb-24">
      <WritingSection posts={posts} />
    </div>
  );
}

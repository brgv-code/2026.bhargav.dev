import type { Metadata } from "next";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { BackButton } from "@/components/shared/back-button";

export const metadata: Metadata = {
  title: "Writing",
  description: "All published writing and essays.",
};

export const dynamic = "force-static";

export default async function WritingIndexPage() {
  const posts = await fetchBlogListPosts(500);

  return (
    <div className="flex flex-col gap-16 pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="grid grid-cols-3 items-center pt-24 mb-10">
          <span />
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
            Writing
          </h2>
          <div className="justify-self-end">
            <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
          </div>
        </div>
        <WritingSection posts={posts} showTitle={false} />
      </div>
    </div>
  );
}

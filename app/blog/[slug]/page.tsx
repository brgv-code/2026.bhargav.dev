import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { fetchPostBySlug, type PayloadContentBlock } from "@/lib/payload";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.content?.find((b) => b.blockType === "hero")
      ? String(
          (
            post.content.find(
              (b) => b.blockType === "hero",
            ) as PayloadContentBlock
          ).subtitle ?? "",
        )
      : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-28 pb-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
        >
          ← Back
        </Link>
        <article>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-sm text-muted-foreground mb-8">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content?.length ? (
              post.content.map((block, i) => (
                <PostBlock key={block.id ?? i} block={block} />
              ))
            ) : (
              <p className="text-muted-foreground">No content yet.</p>
            )}
          </div>
        </article>
      </main>
    </>
  );
}

function PostBlock({ block }: { block: PayloadContentBlock }) {
  const s = (v: unknown) => (v != null ? String(v) : "");
  switch (block.blockType) {
    case "hero":
      return (
        <section className="mb-10">
          {s(block.title) && <h2 className="text-xl font-semibold mb-2">{s(block.title)}</h2>}
          {s(block.subtitle) && <p className="text-muted-foreground">{s(block.subtitle)}</p>}
        </section>
      );
    case "sandpack":
      return (
        <div className="my-6 rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto">
          <pre className="text-sm">
            <code>{s(block.code)}</code>
          </pre>
        </div>
      );
    case "aiPlayground":
      return (
        <div className="my-6 rounded-lg border border-border bg-muted/30 p-4">
          {s(block.system_prompt) && <p className="text-sm text-muted-foreground mb-2">{s(block.system_prompt)}</p>}
          {s(block.initial_user_prompt) && <p className="text-sm">{s(block.initial_user_prompt)}</p>}
        </div>
      );
    default:
      return null;
  }
}

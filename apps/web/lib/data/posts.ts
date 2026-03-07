import { PostSchema, type Post } from "@repo/types";
import { fetchBlogListPosts, fetchPostBySlug } from "@/lib/data/cms";

function normalizePost(input: {
  id: string;
  slug: string;
  title: string;
  publishedAt?: string;
  tags?: Array<{ id: number; name: string }>;
}): Post {
  return PostSchema.parse({
    id: String(input.id),
    slug: input.slug,
    title: input.title,
    publishedAt: input.publishedAt ?? null,
    tags: input.tags?.map((t) => ({
      id: String(t.id),
      name: t.name,
    })),
  });
}

export async function getPosts(limit = 50): Promise<Post[]> {
  const docs = await fetchBlogListPosts(limit);
  return docs.map((doc) =>
    normalizePost({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      publishedAt: doc.publishedAt,
      tags: doc.tags ?? undefined,
    })
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const doc = await fetchPostBySlug(slug);
  if (!doc) return null;
  return normalizePost({
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    publishedAt: doc.publishedAt,
    tags: doc.tags ?? undefined,
  });
}

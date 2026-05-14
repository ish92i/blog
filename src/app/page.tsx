import { db } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BlogList } from "@/components";
import Link from "next/link";

export const revalidate = 0;

async function getPublishedPosts() {
  try {
    return await db.select().from(postsTable).where(eq(postsTable.published, true)).orderBy(desc(postsTable.createdAt));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
          Latest Articles
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Thoughts on development, design, and technology.
        </p>
      </div>
      {posts.length > 0 ? (
        <BlogList posts={posts.map((post: any) => ({
          title: post.title,
          excerpt: post.excerpt,
          date: new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          coverImage: post.coverImage || undefined,
          slug: post.id,
        }))} />
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            No posts yet.{" "}
            <Link href="/post/new" className="text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Create one
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

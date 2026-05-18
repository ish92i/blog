import { db } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { BlogList } from "@/components";

export const revalidate = 0;
type Post = InferSelectModel<typeof postsTable>;

async function getPublishedPosts() {
  try {
    return await db.select().from(postsTable).where(eq(postsTable.published, true)).orderBy(desc(postsTable.createdAt));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const formattedPosts = posts.map((post: Post) => ({
    title: post.title,
    excerpt: post.excerpt,
    date: (post.createdAt ? new Date(post.createdAt) : new Date(0)).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    coverImage: post.coverImage || undefined,
    slug: post.id,
  }));

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="relative isolate px-4 pb-8 pt-16 sm:px-6 md:pb-12 md:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[34rem] w-[min(52rem,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.12),transparent_64%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(244,63,94,0.10),transparent_64%)]" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="border-b border-zinc-200 pb-8 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <span>Derniers articles</span>
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span>{formattedPosts.length} article{formattedPosts.length > 1 ? "s" : ""}</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-[clamp(2.7rem,8vw,6.7rem)] font-semibold leading-[0.92]">
              Blog
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              Découvrez les aventures de la 4E à vélo jusqu&apos;à Londres.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 md:px-8">
        {formattedPosts.length > 0 ? (
          <BlogList posts={formattedPosts} />
        ) : (
          <div className="flex min-h-[30vh] flex-col items-center justify-center">
            <p className="text-2xl font-semibold">Aucun article pour le moment.</p>
            <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-300">
              Le premier texte apparaîtra ici, au centre.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

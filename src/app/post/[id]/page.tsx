import { notFound } from "next/navigation";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PostHeader, MDXContent } from "@/components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getPostData(id: string) {
  const result = await db.select().from(posts).where(eq(posts.id, id));
  return result[0] || null;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostData(id);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="min-h-screen" data-color-mode="light">
      <PostHeader
        title={post.title}
        subtitle={post.subtitle || undefined}
        date={formattedDate}
        coverImage={post.coverImage || undefined}
      />
      <div className="mx-auto max-w-4xl px-4 pb-12 md:px-8">
        <div className="prose w-full">
          <MDXContent content={post.content} />
        </div>
      </div>
    </article>
  );
}
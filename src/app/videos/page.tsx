import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { VideoList } from "@/components";

export const revalidate = 0;

async function getPublishedVideos() {
  try {
    return await db.select().from(videos).where(
      and(eq(videos.published, true), isNotNull(videos.muxPlaybackId))
    ).orderBy(desc(videos.createdAt));
  } catch {
    return [];
  }
}

export default async function VideosPage() {
  const allVideos = await getPublishedVideos();

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="relative isolate px-4 pb-4 pt-20 sm:px-6 md:pb-8 md:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[34rem] w-[min(52rem,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_64%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.10),transparent_64%)]" />
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="border-b border-zinc-200 pb-6 dark:border-white/10">
            <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold">Vidéos</h1>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 md:px-8">
        {allVideos.length > 0 ? (
          <VideoList videos={allVideos} />
        ) : (
          <div className="flex min-h-[30vh] flex-col items-center justify-center">
            <p className="text-2xl font-semibold">Aucune vidéo pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}

import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components";

export const revalidate = 0;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [video] = await db.select().from(videos).where(eq(videos.id, id));

  if (!video || !video.published || !video.muxPlaybackId) notFound();

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="mx-auto max-w-4xl px-4 pt-24 pb-12">
        <Link href="/videos" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 mb-6">
          ← Retour aux vidéos
        </Link>
        <h1 className="text-3xl font-semibold">{video.title}</h1>
        <div className="mt-8">
          <VideoPlayer playbackId={video.muxPlaybackId} />
        </div>
        {video.description && <p className="mt-6 text-zinc-600 dark:text-zinc-300">{video.description}</p>}
      </section>
    </div>
  );
}

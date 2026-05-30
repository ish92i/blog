import Link from "next/link";

interface VideoCardProps {
  title: string;
  playbackId: string | null;
  duration?: number | null;
  slug: string;
}

export function VideoCard({ title, playbackId, duration, slug }: VideoCardProps) {
  return (
    <Link href={`/video/${slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-white/10">
        <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {playbackId && (
            <img
              src={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
          {duration && <p className="text-sm text-zinc-500 mt-1">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}</p>}
        </div>
      </div>
    </Link>
  );
}

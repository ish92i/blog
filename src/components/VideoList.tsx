import { VideoCard } from "./VideoCard";

interface Video {
  title: string;
  muxPlaybackId: string | null;
  duration?: number | null;
  id: string;
}

interface VideoListProps {
  videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-10">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          title={video.title}
          playbackId={video.muxPlaybackId}
          duration={video.duration}
          slug={video.id}
        />
      ))}
    </div>
  );
}

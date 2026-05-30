"use client";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string | null;
}

export function VideoPlayer({ playbackId }: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId ?? undefined}
      accentColor="#e11d48"
      className="w-full aspect-video rounded-lg overflow-hidden"
    />
  );
}

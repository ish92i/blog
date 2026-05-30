import { db } from "@/db";
import { waypoints, pois, posts, videos } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { RouteMap } from "@/components";

export const revalidate = 0;

export default async function CartePage() {
  const [rawWaypoints, rawPois] = await Promise.all([
    db.select().from(waypoints).orderBy(asc(waypoints.timestamp)),
    db.select().from(pois).orderBy(desc(pois.timestamp)),
  ]);

  const allWaypoints = rawWaypoints.map(w => ({ ...w, timestamp: w.timestamp.toISOString() }));

  const enrichedPois: {
    id: string; latitude: number; longitude: number; timestamp: string | null;
    postId: string | null; videoId: string | null; label: string | null; createdAt: string | null;
    linked: { type: "post" | "video"; id: string; title: string; slug: string } | null;
  }[] = await Promise.all(rawPois.map(async (poi) => {
    let linked = null;
    if (poi.postId) {
      const [post] = await db.select({
        id: posts.id,
        title: posts.title,
        slug: posts.id,
      }).from(posts).where(eq(posts.id, poi.postId));
      if (post) linked = { type: "post" as const, ...post };
    } else if (poi.videoId) {
      const [video] = await db.select({
        id: videos.id,
        title: videos.title,
        slug: videos.id,
      }).from(videos).where(eq(videos.id, poi.videoId));
      if (video) linked = { type: "video" as const, ...video };
    }
    return {
      id: poi.id,
      latitude: poi.latitude,
      longitude: poi.longitude,
      timestamp: poi.timestamp?.toISOString() ?? null,
      postId: poi.postId,
      videoId: poi.videoId,
      label: poi.label,
      createdAt: poi.createdAt?.toISOString() ?? null,
      linked,
    };
  }));

  return (
    <div className="h-[calc(100vh-4rem)] w-full pt-16">
      <RouteMap waypoints={allWaypoints} pois={enrichedPois} />
    </div>
  );
}

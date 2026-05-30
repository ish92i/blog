import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, waypoints, pois } from "@/db/schema";
import { desc, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allVideos = await db.select().from(videos).orderBy(desc(videos.createdAt));
    return NextResponse.json(allVideos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, muxPlaybackId, muxAssetId, muxUploadId, thumbnailUrl, duration } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const result = await db.insert(videos).values({
      id,
      title,
      description,
      muxPlaybackId,
      muxAssetId,
      muxUploadId,
      thumbnailUrl,
      duration,
      published: true,
    }).returning();

    // Auto-create POI from nearest waypoint
    const videoCreatedAt = result[0].createdAt;
    if (videoCreatedAt) {
      const nearestWaypoints = await db.select()
        .from(waypoints)
        .orderBy(asc(waypoints.timestamp))
        .limit(1);

      if (nearestWaypoints.length > 0) {
        const closest = nearestWaypoints.reduce((prev, curr) => {
          const diffPrev = Math.abs(curr.timestamp.getTime() - videoCreatedAt.getTime());
          const diffCurr = Math.abs(prev.timestamp.getTime() - videoCreatedAt.getTime());
          return diffPrev < diffCurr ? curr : prev;
        });

        if (Math.abs(closest.timestamp.getTime() - videoCreatedAt.getTime()) < 3600000) {
          await db.insert(pois).values({
            id: crypto.randomUUID(),
            latitude: closest.latitude,
            longitude: closest.longitude,
            timestamp: closest.timestamp,
            videoId: result[0].id,
          });
        }
      }
    }

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

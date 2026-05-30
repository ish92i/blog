import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const publishedVideos = await db.select()
      .from(videos)
      .where(eq(videos.published, true))
      .orderBy(desc(videos.createdAt));
    return NextResponse.json(publishedVideos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [video] = await db.select()
      .from(videos)
      .where(eq(videos.id, id));

    if (!video || !video.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

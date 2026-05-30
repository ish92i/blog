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
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, description, published } = body;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    await db.update(videos)
      .set({ title, description, published, updatedAt: new Date() })
      .where(eq(videos.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { muxPlaybackId, muxAssetId, muxUploadId, duration, thumbnailUrl } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (muxPlaybackId) updateData.muxPlaybackId = muxPlaybackId;
    if (muxAssetId) updateData.muxAssetId = muxAssetId;
    if (muxUploadId) updateData.muxUploadId = muxUploadId;
    if (duration !== undefined) updateData.duration = duration;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;

    await db.update(videos).set(updateData).where(eq(videos.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.delete(videos).where(eq(videos.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

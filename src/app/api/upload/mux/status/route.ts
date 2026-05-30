import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("uploadId");

  if (!uploadId) {
    return NextResponse.json({ error: "uploadId required" }, { status: 400 });
  }

  try {
    const auth = Buffer.from(
      `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
    ).toString("base64");

    const res = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const { data } = await res.json();
    const assetId = data.asset_id || null;

    let playbackId: string | null = null;
    let duration: number | null = null;
    let thumbnailUrl: string | null = null;

    if (assetId) {
      const assetRes = await fetch(
        `https://api.mux.com/video/v1/assets/${assetId}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );

      if (assetRes.ok) {
        const { data: asset } = await assetRes.json();
        playbackId = asset.playback_ids?.[0]?.id || null;
        duration = asset.duration ? Math.round(asset.duration) : null;
        thumbnailUrl = asset.playback_ids?.[0]?.id
          ? `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg`
          : null;
      }
    }

    return NextResponse.json({
      status: data.status,
      assetId,
      playbackId,
      duration,
      thumbnailUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check status" },
      { status: 500 }
    );
  }
}

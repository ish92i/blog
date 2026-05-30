import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const auth = Buffer.from(
      `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
    ).toString("base64");

    const res = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ["public"],
        },
        cors_origin: origin,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.data.url, uploadId: data.data.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create upload" },
      { status: 500 }
    );
  }
}

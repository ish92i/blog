import { db } from '@/db';
import { pois, posts, videos } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allPois = await db.select().from(pois).orderBy(desc(pois.timestamp));

    const enriched = await Promise.all(allPois.map(async (poi) => {
      let linked = null;
      if (poi.postId) {
        const [post] = await db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.id,
        }).from(posts).where(eq(posts.id, poi.postId));
        if (post) linked = { type: 'post', ...post };
      } else if (poi.videoId) {
        const [video] = await db.select({
          id: videos.id,
          title: videos.title,
          slug: videos.id,
        }).from(videos).where(eq(videos.id, poi.videoId));
        if (video) linked = { type: 'video', ...video };
      }
      return { ...poi, linked };
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return NextResponse.json({ error: 'Failed to fetch POIs' }, { status: 500 });
  }
}

import { db } from '@/db';
import { posts, waypoints, pois } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';

function generateId(): string {
  return crypto.randomUUID();
}

export async function GET() {
  try {
    const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, excerpt, content, coverImage, published } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const result = await db.insert(posts).values({
      id: generateId(),
      title,
      subtitle,
      excerpt,
      content,
      coverImage,
      published: published ?? true,
    }).returning();

    // Auto-create POI from nearest waypoint
    const postCreatedAt = result[0].createdAt;
    if (postCreatedAt) {
      const nearestWaypoints = await db.select()
        .from(waypoints)
        .orderBy(asc(waypoints.timestamp))
        .limit(1);

      if (nearestWaypoints.length > 0) {
        const closest = nearestWaypoints.reduce((prev, curr) => {
          const diffPrev = Math.abs(curr.timestamp.getTime() - postCreatedAt.getTime());
          const diffCurr = Math.abs(prev.timestamp.getTime() - postCreatedAt.getTime());
          return diffPrev < diffCurr ? curr : prev;
        });

        if (Math.abs(closest.timestamp.getTime() - postCreatedAt.getTime()) < 3600000) {
          await db.insert(pois).values({
            id: crypto.randomUUID(),
            latitude: closest.latitude,
            longitude: closest.longitude,
            timestamp: closest.timestamp,
            postId: result[0].id,
          });
        }
      }
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
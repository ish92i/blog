import { db } from '@/db';
import { posts } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');

    let result;
    if (published === 'true') {
      result = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
    } else if (published === 'false') {
      result = await db.select().from(posts).where(eq(posts.published, false)).orderBy(desc(posts.createdAt));
    } else {
      result = await db.select().from(posts).orderBy(desc(posts.createdAt));
    }
    
    return NextResponse.json(result);
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(posts).values({
      id: generateId(),
      title,
      subtitle,
      excerpt,
      content,
      coverImage,
      published: published ?? false,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
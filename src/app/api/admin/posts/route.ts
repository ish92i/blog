import { db } from '@/db';
import { posts } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
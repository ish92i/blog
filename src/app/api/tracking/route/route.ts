import { db } from '@/db';
import { waypoints } from '@/db/schema';
import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const points = await db.select().from(waypoints).orderBy(asc(waypoints.timestamp));
    return NextResponse.json(points);
  } catch (error) {
    console.error('Error fetching waypoints:', error);
    return NextResponse.json({ error: 'Failed to fetch waypoints' }, { status: 500 });
  }
}

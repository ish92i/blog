import { db } from '@/db';
import { waypoints } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, timestamp } = body;

    if (latitude == null || longitude == null || !timestamp) {
      return NextResponse.json({ error: 'latitude, longitude, and timestamp required' }, { status: 400 });
    }

    await db.insert(waypoints).values({
      latitude,
      longitude,
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error saving waypoint:', error);
    return NextResponse.json({ error: 'Failed to save waypoint' }, { status: 500 });
  }
}

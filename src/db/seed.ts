import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  const postId1 = 'post-1';
  const postId2 = 'post-2';
  const postId3 = 'post-3';

  await db.insert(schema.posts).values([
    {
      id: postId1,
      title: 'Building a Modern Blog with Next.js',
      subtitle: 'From zero to production',
      excerpt: 'A deep dive into architecting a performant blog using Next.js, Drizzle ORM, and PostgreSQL.',
      content: `## Getting Started\n\nNext.js has evolved significantly. Here's how I built this blog...\n\n### Architecture\n\nThe stack includes:\n- Next.js for the framework\n- Drizzle ORM for the database layer\n- Neon for serverless PostgreSQL\n- UploadThing for media management\n\n### Routing\n\nUsing the App Router, we get file-based routing with nested layouts...`,
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      published: true,
      createdAt: new Date('2026-05-15'),
      updatedAt: new Date('2026-05-20'),
    },
    {
      id: postId2,
      title: 'Video Processing at Scale with Mux',
      subtitle: 'Handling uploads, transcoding, and playback',
      excerpt: 'Lessons learned integrating Mux for video upload and streaming in a Next.js application.',
      content: `## Why Mux?\n\nMux provides a full-stack video platform...\n\n### Upload Flow\n\nWe use Mux Uploader React component for direct-to-Mux uploads...\n\n### Playback\n\nMux Player React handles adaptive bitrate streaming...`,
      coverImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279',
      published: true,
      createdAt: new Date('2026-05-10'),
      updatedAt: new Date('2026-05-18'),
    },
    {
      id: postId3,
      title: 'Mapping Adventures with Maplibre',
      subtitle: 'Interactive maps for location-based content',
      excerpt: 'Using Maplibre GL JS to create rich, interactive maps tied to blog content and GPS data.',
      content: `## Maps and Storytelling\n\nLocation adds context to stories...\n\n### Waypoints\n\nTracking GPS coordinates over a journey creates a breadcrumb trail...\n\n### Points of Interest\n\nPOIs link map locations to blog posts and videos...`,
      coverImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b',
      published: false,
      createdAt: new Date('2026-05-25'),
      updatedAt: new Date('2026-05-28'),
    },
  ]);

  const videoId1 = 'video-1';
  const videoId2 = 'video-2';

  await db.insert(schema.videos).values([
    {
      id: videoId1,
      title: 'Site Architecture Walkthrough',
      description: 'A screencast walking through the blog architecture and codebase structure.',
      duration: 845,
      published: true,
      createdAt: new Date('2026-05-16'),
      updatedAt: new Date('2026-05-16'),
    },
    {
      id: videoId2,
      title: 'Hiking the Pacific Crest Trail',
      description: 'First-person footage from a section hike on the PCT.',
      duration: 2540,
      published: true,
      createdAt: new Date('2026-05-22'),
      updatedAt: new Date('2026-05-22'),
    },
  ]);

  await db.insert(schema.waypoints).values([
    { latitude: 37.7749, longitude: -122.4194, timestamp: new Date('2026-04-01T08:00:00Z') },
    { latitude: 37.8044, longitude: -122.2712, timestamp: new Date('2026-04-01T09:30:00Z') },
    { latitude: 37.8716, longitude: -122.2727, timestamp: new Date('2026-04-01T11:00:00Z') },
    { latitude: 37.8899, longitude: -122.2521, timestamp: new Date('2026-04-01T12:30:00Z') },
    { latitude: 37.9055, longitude: -122.2059, timestamp: new Date('2026-04-01T14:00:00Z') },
    { latitude: 47.6062, longitude: -122.3321, timestamp: new Date('2026-05-01T07:00:00Z') },
    { latitude: 47.6148, longitude: -122.3442, timestamp: new Date('2026-05-01T08:15:00Z') },
    { latitude: 47.6235, longitude: -122.3515, timestamp: new Date('2026-05-01T09:45:00Z') },
    { latitude: 47.6300, longitude: -122.3600, timestamp: new Date('2026-05-01T11:00:00Z') },
  ]);

  await db.insert(schema.pois).values([
    {
      id: 'poi-1',
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date('2026-04-01T08:00:00Z'),
      postId: postId1,
      label: 'Blog project HQ',
    },
    {
      id: 'poi-2',
      latitude: 37.8044,
      longitude: -122.2712,
      timestamp: new Date('2026-04-01T09:30:00Z'),
      postId: postId1,
      label: 'Coffee shop sprint',
    },
    {
      id: 'poi-3',
      latitude: 47.6062,
      longitude: -122.3321,
      timestamp: new Date('2026-05-01T07:00:00Z'),
      videoId: videoId2,
      label: 'PCT trailhead - Snoqualmie Pass',
    },
    {
      id: 'poi-4',
      latitude: 37.8716,
      longitude: -122.2727,
      timestamp: new Date('2026-04-01T11:00:00Z'),
      postId: postId3,
      videoId: videoId1,
      label: 'UC Berkeley campus map demo',
    },
    {
      id: 'poi-5',
      latitude: 47.6300,
      longitude: -122.3600,
      timestamp: new Date('2026-05-01T11:00:00Z'),
      postId: postId3,
      label: 'Kendall Peak lookout',
    },
  ]);

  console.log('Seed complete!');
}

seed().catch(console.error);

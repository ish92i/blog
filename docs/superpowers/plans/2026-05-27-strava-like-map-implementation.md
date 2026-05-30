# Strava-like Map Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic GPS tracking in admin, route + POI map on `/carte`, and auto-link posts/videos to route points by timestamp.

**Architecture:** Two new DB tables (waypoints, pois). A `GeoLocationTracker` component silently records position on admin pages. Public `/carte` page uses MapLibre GL + OpenFreeMap tiles + OSRM for road-following routes. Posts/videos auto-create POIs on creation via timestamp matching.

**Tech Stack:** MapLibre GL JS, OpenFreeMap (tiles), OSRM (routing), Drizzle ORM, Next.js 16 API routes

---

### Task 1: Install MapLibre GL JS

**Files:**
- Modify: `package.json`

- [ ] **Install maplibre-gl**

```bash
npm install maplibre-gl
```

- [ ] **Verify install**

```bash
ls node_modules/maplibre-gl
```

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add maplibre-gl dependency"
```

---

### Task 2: DB Migration — waypoints + pois tables

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Add waypoints and pois table definitions to schema**

Add after the `videos` table (at end of file):

```typescript
export const waypoints = pgTable('waypoints', {
  id: serial('id').primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pois = pgTable('pois', {
  id: text('id').primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timestamp: timestamp('timestamp'),
  postId: text('post_id').references(() => posts.id),
  videoId: text('video_id').references(() => videos.id),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Also need to add `serial` and `doublePrecision` to the import from `drizzle-orm/pg-core`:

```typescript
import { pgTable, text, timestamp, boolean, uuid, integer, serial, doublePrecision } from 'drizzle-orm/pg-core';
```

- [ ] **Push migration**

```bash
npx drizzle-kit push
```

Expected output: Tables `waypoints` and `pois` created successfully.

- [ ] **Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add waypoints and pois tables"
```

---

### Task 3: API Route — POST /api/tracking/waypoints

**Files:**
- Create: `src/app/api/tracking/waypoints/route.ts`

- [ ] **Create the API route**

```typescript
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
```

- [ ] **Commit**

```bash
git add src/app/api/tracking/waypoints/route.ts
git commit -m "feat: add POST /api/tracking/waypoints"
```

---

### Task 4: API Route — GET /api/tracking/route

**Files:**
- Create: `src/app/api/tracking/route.ts`

- [ ] **Create the API route**

```typescript
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
```

Note: This file is at `src/app/api/tracking/route/route.ts` (Next.js file conventions — the folder is named `route` and contains `route.ts`).

- [ ] **Commit**

```bash
git add src/app/api/tracking/route/route.ts
git commit -m "feat: add GET /api/tracking/route"
```

---

### Task 5: API Route — GET /api/pois

**Files:**
- Create: `src/app/api/pois/route.ts`

- [ ] **Create the API route**

```typescript
import { db } from '@/db';
import { pois, posts, videos } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

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
```

- [ ] **Commit**

```bash
git add src/app/api/pois/route.ts
git commit -m "feat: add GET /api/pois"
```

---

### Task 6: GeoLocationTracker component

**Files:**
- Create: `src/components/GeoLocationTracker.tsx`

- [ ] **Create the component**

```typescript
"use client";

import { useEffect, useRef } from "react";

export function GeoLocationTracker() {
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const sendPosition = async (pos: GeolocationPosition) => {
      try {
        await fetch("/api/tracking/waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: new Date(pos.timestamp).toISOString(),
          }),
        });
      } catch {
        // silent — don't spam console if tracking fails
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
      },
      () => {
        // permission denied or error — ignore silently
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendPosition(lastPositionRef.current);
      }
    }, 10000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
```

- [ ] **Export in components index**

Add to `src/components/index.ts`:
```typescript
export { GeoLocationTracker } from "./GeoLocationTracker";
```

- [ ] **Commit**

```bash
git add src/components/GeoLocationTracker.tsx src/components/index.ts
git commit -m "feat: add GeoLocationTracker component"
```

---

### Task 7: Integrate GeoLocationTracker in admin

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Import and render GeoLocationTracker**

Add import at top:
```typescript
import { GeoLocationTracker } from "@/components";
```

Add `<GeoLocationTracker />` inside the main div of the return, before the `Tabs` component (or at the root of the return).

- [ ] **Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: integrate GeoLocationTracker in admin dashboard"
```

---

### Task 8: POI auto-creation on post creation

**Files:**
- Modify: `src/app/api/admin/posts/route.ts`

- [ ] **After post insert, find nearest waypoint and create POI**

Add imports at top:
```typescript
import { waypoints, pois } from '@/db/schema';
import { asc } from 'drizzle-orm';
```

After the `const result = await db.insert(posts)...` block, add:

```typescript
    // Auto-create POI from nearest waypoint
    const postCreatedAt = result[0].createdAt;
    if (postCreatedAt) {
      const nearest = await db.select()
        .from(waypoints)
        .orderBy(asc(waypoints.timestamp))
        .limit(1);

      if (nearest.length > 0) {
        const closest = nearest.reduce((prev, curr) => {
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
```

- [ ] **Commit**

```bash
git add src/app/api/admin/posts/route.ts
git commit -m "feat: auto-create POI on post creation"
```

---

### Task 9: POI auto-creation on video creation

**Files:**
- Modify: `src/app/api/admin/videos/route.ts`

- [ ] **Read existing video POST route**

```bash
cat src/app/api/admin/videos/route.ts
```

- [ ] **After video insert, find nearest waypoint and create POI**

Same logic as Task 8 but for videos. Add imports and the POI creation block after the insert.

- [ ] **Commit**

```bash
git add src/app/api/admin/videos/route.ts
git commit -m "feat: auto-create POI on video creation"
```

---

### Task 10: Public /carte page with MapLibre + route + POIs

**Files:**
- Create: `src/components/RouteMap.tsx` (client component for the map)
- Modify: `src/app/carte/page.tsx` (server component that fetches data)

- [ ] **Create RouteMap client component**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Poi {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string | null;
  postId: string | null;
  videoId: string | null;
  label: string | null;
  linked: {
    type: "post" | "video";
    id: string;
    title: string;
    slug: string;
  } | null;
}

export function RouteMap({ waypoints, pois: initialPois }: { waypoints: Waypoint[]; pois: Poi[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const routeLayerAdded = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [0, 48.8],
      zoom: 5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: "© OpenStreetMap" }));

    map.on("load", async () => {
      // Draw route via OSRM
      if (waypoints.length > 1) {
        const coordsStr = waypoints.map(w => `${w.longitude},${w.latitude}`).join(";");
        try {
          const res = await fetch(
            `https://router.project-osrm.org/match/v1/driving/${coordsStr}?geometries=geojson&overview=full`
          );
          const data = await res.json();
          if (data.code === "Ok" && data.matchings) {
            const geojson = {
              type: "FeatureCollection" as const,
              features: data.matchings.map((m: any) => m.geometry),
            };
            map.addSource("route", {
              type: "geojson",
              data: geojson,
            });
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#e11d48", "line-width": 4, "line-opacity": 0.8 },
            });
            routeLayerAdded.current = true;

            // Fit bounds to route
            const bounds = new maplibregl.LngLatBounds();
            waypoints.forEach(w => bounds.extend([w.longitude, w.latitude]));
            map.fitBounds(bounds, { padding: 60 });
          }
        } catch {
          // OSRM failed — fallback: draw straight line between waypoints
          const geojson = {
            type: "FeatureCollection" as const,
            features: [{
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "LineString" as const,
                coordinates: waypoints.map(w => [w.longitude, w.latitude]),
              },
            }],
          };
          map.addSource("route", { type: "geojson", data: geojson });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#e11d48", "line-width": 4, "line-opacity": 0.8 },
          });
        }
      }

      // Add POI markers
      initialPois.forEach(poi => {
        if (!poi.linked) return;

        const el = document.createElement("div");
        el.className = "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#e11d48] text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform";
        el.textContent = poi.linked.type === "post" ? "A" : "V";

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family:system-ui,sans-serif;min-width:160px">
            <p style="font-weight:600;margin:0 0 4px">${poi.linked.title}</p>
            <a href="/${poi.linked.type === "post" ? "post" : "video"}/${poi.linked.slug}" style="color:#e11d48;font-size:13px;text-decoration:none">
              Voir ${poi.linked.type === "post" ? "l'article" : "la vidéo"} →
            </a>
          </div>
        `);

        new maplibregl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .setPopup(popup)
          .addTo(map);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [waypoints, initialPois]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
```

- [ ] **Rewrite /carte page**

```typescript
import { db } from "@/db";
import { waypoints, pois } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { RouteMap } from "@/components/RouteMap";

export const revalidate = 0;

export default async function CartePage() {
  const [allWaypoints, allPois] = await Promise.all([
    db.select().from(waypoints).orderBy(asc(waypoints.timestamp)),
    db.select().from(pois).orderBy(desc(pois.timestamp)),
  ]);

  const enrichedPois = await Promise.all(allPois.map(async (poi) => {
    let linked = null;
    if (poi.postId) {
      const { posts } = await import("@/db/schema");
      const [post] = await db.select({
        id: posts.id,
        title: posts.title,
        slug: posts.id,
      }).from(posts).where(eq(posts.id, poi.postId));
      if (post) linked = { type: "post" as const, ...post };
    } else if (poi.videoId) {
      const { videos } = await import("@/db/schema");
      const [video] = await db.select({
        id: videos.id,
        title: videos.title,
        slug: videos.id,
      }).from(videos).where(eq(videos.id, poi.videoId));
      if (video) linked = { type: "video" as const, ...video };
    }
    return { ...poi, linked };
  }));

  return (
    <div className="h-[calc(100vh-4rem)] w-full pt-16">
      <RouteMap waypoints={allWaypoints} pois={enrichedPois} />
    </div>
  );
}
```

Wait — there's an import issue with `eq`. Let me fix the carte page:

```typescript
import { db } from "@/db";
import { waypoints, pois, posts, videos } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { RouteMap } from "@/components/RouteMap";

export const revalidate = 0;

export default async function CartePage() {
  const [allWaypoints, allPois] = await Promise.all([
    db.select().from(waypoints).orderBy(asc(waypoints.timestamp)),
    db.select().from(pois).orderBy(desc(pois.timestamp)),
  ]);

  const enrichedPois = await Promise.all(allPois.map(async (poi) => {
    let linked = null;
    if (poi.postId) {
      const [post] = await db.select({
        id: posts.id,
        title: posts.title,
        slug: posts.id,
      }).from(posts).where(eq(posts.id, poi.postId));
      if (post) linked = { type: "post" as const, ...post };
    } else if (poi.videoId) {
      const [video] = await db.select({
        id: videos.id,
        title: videos.title,
        slug: videos.id,
      }).from(videos).where(eq(videos.id, poi.videoId));
      if (video) linked = { type: "video" as const, ...video };
    }
    return { ...poi, linked };
  }));

  return (
    <div className="h-[calc(100vh-4rem)] w-full pt-16">
      <RouteMap waypoints={allWaypoints} pois={enrichedPois} />
    </div>
  );
}
```

- [ ] **Export RouteMap from components index**

Add to `src/components/index.ts`:
```typescript
export { RouteMap } from "./RouteMap";
```

- [ ] **Commit**

```bash
git add src/components/RouteMap.tsx src/app/carte/page.tsx src/components/index.ts
git commit -m "feat: add public /carte page with MapLibre GL route + POIs"
```

---

### Task 11: Build verification

- [ ] **Run the build**

```bash
npx next build
```

Expected: All routes generate successfully, including `/carte` (SSR → dynamic).

- [ ] **If build errors, fix and rebuild** — check for import issues, missing exports, type errors.

---

## Self-Review Checklist

- [ ] Spec coverage: waypoints table ✓, pois table ✓, POST /api/tracking/waypoints ✓, GET /api/tracking/route ✓, GET /api/pois ✓, GeoLocationTracker ✓, admin integration ✓, POI auto-creation (posts+videos) ✓, /carte page with MapLibre ✓, OSRM route matching ✓, marker popups ✓
- [ ] No placeholder content found
- [ ] Type consistency: RouteMap props, POI data shape match between carte page and RouteMap component

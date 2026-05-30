# Strava-like Map Feature — Design Spec

## Overview
Add GPS route tracking and interactive map to the blog. Admin's position is recorded automatically while using the admin dashboard. Posts and videos are automatically linked to route waypoints by timestamp proximity. Public `/carte` page shows the route with clickable POI markers.

## Schema

### `waypoints` — GPS breadcrumb trail
| Column    | Type            | Notes                        |
|-----------|-----------------|------------------------------|
| id        | serial          | PK                           |
| latitude  | double precision | NOT NULL                    |
| longitude | double precision | NOT NULL                    |
| timestamp | timestamp       | NOT NULL — when GPS captured |
| created_at| timestamp       | defaultNow()                 |

### `pois` — Points of interest linked to content
| Column    | Type    | Notes                           |
|-----------|---------|----------------------------------|
| id        | uuid    | PK                              |
| latitude  | double precision | NOT NULL              |
| longitude | double precision | NOT NULL              |
| timestamp | timestamp | the waypoint time matched     |
| post_id   | text    | FK -> posts.id (nullable)       |
| video_id  | text    | FK -> videos.id (nullable)      |
| label     | text    | optional label                  |
| created_at| timestamp | defaultNow()                 |

Only one of `post_id` or `video_id` should be set per POI.

## Data Flow

### Tracking
1. User opens any `/admin/*` page
2. `navigator.geolocation.watchPosition` starts (after browser permission)
3. Every 10 seconds, position is sent to `POST /api/tracking/waypoints`
4. Tracking continues while admin navigates the dashboard (runs in background via client component mount)
5. On unmount (tab close / navigate away), tracking stops

### POI auto-creation
1. `POST /api/admin/posts` or `POST /api/admin/videos` successfully creates content
2. Server queries waypoints ordered by timestamp, finds the one closest to the content's `createdAt`
3. Inserts a `poi` row with the matched position and content ID
4. If no waypoints exist within a reasonable time window (e.g. 1 hour), no POI is created

## API Routes

### `POST /api/tracking/waypoints`
Receives `{ latitude, longitude, timestamp }`. Inserts into `waypoints`.

### `GET /api/tracking/route`
Returns all waypoints ordered by timestamp. Used to draw the route line on the map.

### `GET /api/pois`
Returns POIs with joined post/video data (title, slug, etc.). Used to render markers on the public map.

### `POST /api/admin/posts` (modified)
After insert, if waypoints exist near the post's createdAt, create a POI linking the post.

### `POST /api/admin/videos` (modified)
Same POI auto-creation logic for videos.

## Frontend — Public `/carte` Page

### Stack
- **MapLibre GL JS** — open-source Mapbox GL fork, vector tile rendering
- **OpenFreeMap** — free vector tiles, no API key
- **OSRM** — routing engine to snap waypoints to roads (wavy lines, not straight)

### Features
- Full-screen map centered on France + England
- Route line drawn via OSRR-matched path from waypoints
- POI markers at locations with linked content
- Click on marker → popup showing:
  - Article/video title
  - Link to read/watch
- Loading state while data fetches

### Map settings
- Default view: lat ~48.8, lng ~0 (center of the channel), zoom ~5
- Style: lighter/monochrome (OSM-based, matches site aesthetic)
- Max bounds: roughly 48°-52°N, -5°-3°E (France + England)

## Frontend — Admin

### Tracking integration
- `src/components/GeoLocationTracker.tsx` — client component that starts `watchPosition` on mount
- Imported in the admin layout or root admin wrapper
- No visible UI except maybe a subtle indicator dot showing tracking status
- Sends position via `POST /api/tracking/waypoints` every 10s

(No dedicated admin page for tracking — it runs silently via GeoLocationTracker.)

## OSRM Integration

OSRM is used to transform raw GPS waypoints into a smooth path that follows roads.

### Approach
- Frontend fetches from OSRM public API directly: `GET https://router.project-osrm.org/match/v1/driving/{polyline}?geometries=geojson`
- CORS is allowed by OSRM
- Returns GeoJSON of the road-following path
- Client caches the result in memory to avoid repeat calls on re-render

## Implementation order

1. DB migration — waypoints + pois tables
2. API routes — POST /api/tracking/waypoints, GET /api/tracking/route, GET /api/pois
3. Admin — GeoLocationTracker component
4. POI auto-creation on post/video creation
5. Install MapLibre GL JS + configure
6. Build public `/carte` page with route + POIs
7. OSRM route matching (wavy lines)
8. Marker popups with article/video links

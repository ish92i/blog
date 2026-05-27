# Video Section with Mux Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add video management to the blog — upload via Mux from admin, browse at `/videos`, watch at `/video/[id]`.

**Architecture:** New `videos` DB table mirrors `posts` pattern. Admin gets shadcn Tabs to switch between Posts/Videos management. Mux handles upload + playback via its React SDKs.

**Tech Stack:** Mux Player React, Mux Uploader React, shadcn/ui Tabs, Radix Tabs, Drizzle ORM

**Dependencies to install:**
- `@mux/mux-player-react`
- `@mux/mux-uploader-react`

**Env vars to add:**
- `MUX_TOKEN_ID` — Mux access token
- `MUX_TOKEN_SECRET` — Mux secret
- `NEXT_PUBLIC_MUX_ENV_KEY` — public env key for player

---

### Task 1: Add `videos` table to DB schema

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0002_add_videos.sql` (generated)

- [ ] **Add videos table definition** to `src/db/schema.ts`:

```typescript
export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  muxPlaybackId: text('mux_playback_id').notNull(),
  muxAssetId: text('mux_asset_id').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  published: boolean('published').default(false),
});
```

- [ ] **Install Mux dependencies**:
```bash
pnpm add @mux/mux-player-react @mux/mux-uploader-react
```

- [ ] **Add Mux env vars** to `.env`:
```
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
NEXT_PUBLIC_MUX_ENV_KEY=
```

- [ ] **Run migration**:
```bash
pnpm run db:push
```

- [ ] **Commit**:
```bash
git add src/db/schema.ts drizzle/ .env
git commit -m "feat: add videos table and Mux dependencies"
```

---

### Task 2: Install shadcn/ui Tabs

**Files:**
- Create: `src/components/ui/tabs.tsx`

- [ ] **Add Radix Tabs dependency**:
```bash
pnpm add @radix-ui/react-tabs
```

- [ ] **Create tabs component** at `src/components/ui/tabs.tsx`:

```typescript
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-800 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-800",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

- [ ] **Export tabs** in `src/components/index.ts`:
```typescript
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
```

- [ ] **Commit**:
```bash
git add src/components/ui/tabs.tsx src/components/index.ts
git commit -m "feat: add shadcn/ui tabs component"
```

---

### Task 3: Admin API routes for videos

**Files:**
- Create: `src/app/api/admin/videos/route.ts`
- Create: `src/app/api/admin/videos/[id]/route.ts`

- [ ] **Create `src/app/api/admin/videos/route.ts`**:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allVideos = await db.select().from(videos).orderBy(desc(videos.createdAt));
    return NextResponse.json(allVideos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, muxPlaybackId, muxAssetId, thumbnailUrl, duration } = body;

    if (!title || !muxPlaybackId || !muxAssetId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db.insert(videos).values({
      id,
      title,
      description,
      muxPlaybackId,
      muxAssetId,
      thumbnailUrl,
      duration,
      published: true,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
```

- [ ] **Create `src/app/api/admin/videos/[id]/route.ts`**:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, description, published } = body;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    await db.update(videos)
      .set({ title, description, published, updatedAt: new Date() })
      .where(eq(videos.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.delete(videos).where(eq(videos.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
```

- [ ] **Commit**:
```bash
git add src/app/api/admin/videos/
git commit -m "feat: add admin video API routes"
```

---

### Task 4: Public API routes for videos

**Files:**
- Create: `src/app/api/videos/route.ts`
- Create: `src/app/api/videos/[id]/route.ts`

- [ ] **Create `src/app/api/videos/route.ts`** — same as admin but filters `published: true`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const publishedVideos = await db.select()
      .from(videos)
      .where(eq(videos.published, true))
      .orderBy(desc(videos.createdAt));
    return NextResponse.json(publishedVideos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
```

- [ ] **Create `src/app/api/videos/[id]/route.ts`**:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [video] = await db.select()
      .from(videos)
      .where(eq(videos.id, id));

    if (!video || !video.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}
```

- [ ] **Commit**:
```bash
git add src/app/api/videos/
git commit -m "feat: add public video API routes"
```

---

### Task 5: Admin page with Tabs (Posts / Videos)

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Rewrite `src/app/admin/page.tsx`** to use Tabs:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  published: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "post" | "video"; id: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin-token")) router.push("/admin/login");
  }, [router]);

  useEffect(() => {
    fetch("/api/admin/posts").then(r => r.json()).then(setPosts).finally(() => setLoadingPosts(false));
    fetch("/api/admin/videos").then(r => r.json()).then(setVideos).finally(() => setLoadingVideos(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const endpoint = deleteTarget.type === "post" ? `/api/admin/posts/${deleteTarget.id}` : `/api/admin/videos/${deleteTarget.id}`;
    await fetch(endpoint, { method: "DELETE" });
    if (deleteTarget.type === "post") setPosts(p => p.filter(x => x.id !== deleteTarget.id));
    else setVideos(v => v.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    router.push("/admin/login");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administration</h1>
        <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="videos">Vidéos</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="mb-4">
            <Link href="/post/new"><Button>Nouvel Article</Button></Link>
          </div>
          {loadingPosts ? <p>Chargement...</p> : posts.length === 0 ? (
            <p className="text-zinc-500">Aucun article</p>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Card key={post.id} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong>{post.title}</strong>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    {post.subtitle && <p className="text-sm text-zinc-500">{post.subtitle}</p>}
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-1">{post.excerpt}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/post/edit/${post.id}`}><Button variant="outline" size="sm">Editer</Button></Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ type: "post", id: post.id })}>Supprimer</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Confirmer</DialogTitle><DialogDescription>Supprimer cet article ?</DialogDescription></DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                          <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos">
          <div className="mb-4">
            <Link href="/admin/videos/new"><Button>Nouvelle Vidéo</Button></Link>
          </div>
          {loadingVideos ? <p>Chargement...</p> : videos.length === 0 ? (
            <p className="text-zinc-500">Aucune vidéo</p>
          ) : (
            <div className="space-y-4">
              {videos.map(video => (
                <Card key={video.id} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong>{video.title}</strong>
                      <Badge variant={video.published ? "default" : "secondary"}>
                        {video.published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    {video.description && <p className="text-sm text-zinc-600 line-clamp-1">{video.description}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/videos/edit/${video.id}`}><Button variant="outline" size="sm">Editer</Button></Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ type: "video", id: video.id })}>Supprimer</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Confirmer</DialogTitle><DialogDescription>Supprimer cette vidéo ?</DialogDescription></DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                          <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Commit**:
```bash
git add src/app/admin/page.tsx
git commit -m "feat: add tabs to admin page for posts/videos"
```

---

### Task 6: Admin video upload form

**Files:**
- Create: `src/app/admin/videos/new/page.tsx`
- Create: `src/app/admin/videos/edit/[id]/page.tsx`
- Create: `src/components/VideoForm.tsx`

- [ ] **Create `src/app/admin/videos/new/page.tsx`**:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MuxUploader from "@mux/mux-uploader-react";

export default function NewVideoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUploadSuccess = async (result: any) => {
    const playbackId = result.detail?.playback_id;
    const assetId = result.detail?.asset_id;

    await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, muxPlaybackId: playbackId, muxAssetId: assetId }),
    });

    router.push("/admin");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold mb-6">Nouvelle Vidéo</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la vidéo" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnelle)" />
        </div>
        <div>
          <label className="text-sm font-medium">Vidéo</label>
          <MuxUploader
            endpoint={process.env.NEXT_PUBLIC_MUX_ENV_KEY!}
            onUploadStart={() => setUploading(true)}
            onSuccess={(result) => {
              setUploading(false);
              handleUploadSuccess(result);
            }}
            onError={() => setUploading(false)}
          />
          {uploading && <p className="text-sm text-zinc-500 mt-2">Upload en cours...</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Create `src/app/admin/videos/edit/[id]/page.tsx`**:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/videos/${params.id}`)
      .then(r => r.json())
      .then(video => {
        setTitle(video.title);
        setDescription(video.description || "");
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async () => {
    await fetch(`/api/admin/videos/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    router.push("/admin");
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 pt-24 pb-12"><p>Chargement...</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold mb-6">Modifier la Vidéo</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <Button onClick={handleSubmit}>Enregistrer</Button>
      </div>
    </div>
  );
}
```

- [ ] **Commit**:
```bash
git add src/app/admin/videos/ src/components/VideoForm.tsx
git commit -m "feat: add admin video upload and edit pages"
```

---

### Task 7: Public video components

**Files:**
- Create: `src/components/VideoCard.tsx`
- Create: `src/components/VideoList.tsx`
- Create: `src/components/VideoPlayer.tsx`

- [ ] **Create `src/components/VideoCard.tsx`**:

```typescript
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";

interface VideoCardProps {
  title: string;
  playbackId: string;
  duration?: number;
  slug: string;
}

export function VideoCard({ title, playbackId, duration, slug }: VideoCardProps) {
  return (
    <Link href={`/video/${slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-white/10">
        <div className="aspect-video relative overflow-hidden">
          <MuxPlayer
            playbackId={playbackId}
            thumbnailTime={0}
            accentColor="#e11d48"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
          {duration && <p className="text-sm text-zinc-500 mt-1">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}</p>}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Create `src/components/VideoList.tsx`**:

```typescript
import { VideoCard } from "./VideoCard";

interface Video {
  title: string;
  muxPlaybackId: string;
  duration?: number;
  id: string;
}

interface VideoListProps {
  videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-10">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          title={video.title}
          playbackId={video.muxPlaybackId}
          duration={video.duration}
          slug={video.id}
        />
      ))}
    </div>
  );
}
```

- [ ] **Create `src/components/VideoPlayer.tsx`**:

```typescript
"use client";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
}

export function VideoPlayer({ playbackId }: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      accentColor="#e11d48"
      className="w-full aspect-video rounded-lg overflow-hidden"
    />
  );
}
```

- [ ] **Export new components** in `src/components/index.ts`:
```typescript
export { VideoCard } from "./VideoCard";
export { VideoList } from "./VideoList";
export { VideoPlayer } from "./VideoPlayer";
```

- [ ] **Commit**:
```bash
git add src/components/VideoCard.tsx src/components/VideoList.tsx src/components/VideoPlayer.tsx src/components/index.ts
git commit -m "feat: add video UI components"
```

---

### Task 8: Public video pages

**Files:**
- Create: `src/app/videos/page.tsx`
- Create: `src/app/video/[id]/page.tsx`

- [ ] **Create `src/app/videos/page.tsx`** (overwrite existing ggs placeholder):

```typescript
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { VideoList } from "@/components";

export const revalidate = 0;

async function getPublishedVideos() {
  try {
    return await db.select().from(videos).where(eq(videos.published, true)).orderBy(desc(videos.createdAt));
  } catch {
    return [];
  }
}

export default async function VideosPage() {
  const allVideos = await getPublishedVideos();

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="relative isolate px-4 pb-8 pt-16 sm:px-6 md:pb-12 md:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[34rem] w-[min(52rem,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_64%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.10),transparent_64%)]" />
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="border-b border-zinc-200 pb-8 dark:border-white/10">
            <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold">Vidéos</h1>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 md:px-8">
        {allVideos.length > 0 ? (
          <VideoList videos={allVideos} />
        ) : (
          <div className="flex min-h-[30vh] flex-col items-center justify-center">
            <p className="text-2xl font-semibold">Aucune vidéo pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Create `src/app/video/[id]/page.tsx`**:

```typescript
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components";

export const revalidate = 0;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [video] = await db.select().from(videos).where(eq(videos.id, id));

  if (!video || !video.published) notFound();

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="mx-auto max-w-4xl px-4 pt-24 pb-12">
        <Link href="/videos" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 mb-6">
          ← Retour aux vidéos
        </Link>
        <VideoPlayer playbackId={video.muxPlaybackId} />
        <h1 className="mt-6 text-3xl font-semibold">{video.title}</h1>
        {video.description && <p className="mt-3 text-zinc-600 dark:text-zinc-300">{video.description}</p>}
      </section>
    </div>
  );
}
```

- [ ] **Commit**:
```bash
git add src/app/videos/ src/app/video/
git commit -m "feat: add public video listing and detail pages"
```

---

### Task 9: Build verification

- [ ] **Run build**:
```bash
pnpm run build
```

- [ ] **Fix any TypeScript/lint errors**, then commit if changes made.

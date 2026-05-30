"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GeoLocationTracker, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components";
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
    fetch("/api/admin/posts").then(async r => { const d = await r.json(); if (Array.isArray(d)) setPosts(d); }).finally(() => setLoadingPosts(false));
    fetch("/api/admin/videos").then(async r => { const d = await r.json(); if (Array.isArray(d)) setVideos(d); }).finally(() => setLoadingVideos(false));
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
      <GeoLocationTracker />
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      setTimeout(() => router.push('/admin/login'), 0);
      return;
    }
    setTimeout(() => fetchPosts(), 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/admin/login');
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 flex items-center justify-center">
        <p className="text-zinc-500">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Articles</h1>
          <Button onClick={handleLogout} variant="ghost" className="text-zinc-600 hover:text-zinc-900">
            Déconnexion
          </Button>
        </div>

        <Button 
          onClick={() => router.push('/post/new')} 
          className="w-full h-12 mb-6 bg-zinc-900 text-white hover:bg-zinc-800 font-medium md:w-auto md:px-6"
        >
          Nouvel Article
        </Button>

        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="bg-white border-zinc-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-zinc-900 truncate">{post.title}</h3>
                      <Badge variant={post.published ? 'default' : 'secondary'} className={post.published ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-200 text-zinc-500'}>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    {post.subtitle && <p className="text-sm text-zinc-500 truncate mb-1">{post.subtitle}</p>}
                    <p className="text-sm text-zinc-400 truncate">{post.excerpt}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => router.push(`/post/edit/${post.id}`)} 
                    className="flex-1 h-11 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-medium"
                  >
                    Éditer
                  </Button>
                  <Button 
                    onClick={() => setDeleteId(post.id)} 
                    className="flex-1 h-11 bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">Aucun article</p>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900">
          <DialogHeader>
            <DialogTitle>Supprimer l'article ?</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-600">Cette action est irréversible.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 h-11 border-zinc-300 text-zinc-700 hover:bg-zinc-100">
              Annuler
            </Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 h-11 bg-red-600 text-white hover:bg-red-700 font-medium">
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
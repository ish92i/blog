'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/components/PostForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    coverImage: '',
    content: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}`);
        if (res.ok) {
          const post: Post = await res.json();
          setFormData({
            title: post.title,
            subtitle: post.subtitle || '',
            excerpt: post.excerpt,
            coverImage: post.coverImage || '',
            content: post.content,
          });
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => fetchPost(), 0);
  }, [postId, router]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin')}
            className="text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux articles
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Modifier l'Article</h1>
        <PostForm
          title={formData.title}
          subtitle={formData.subtitle}
          excerpt={formData.excerpt}
          coverImage={formData.coverImage}
          content={formData.content}
          onTitleChange={(value) => setFormData({ ...formData, title: value })}
          onSubtitleChange={(value) => setFormData({ ...formData, subtitle: value })}
          onExcerptChange={(value) => setFormData({ ...formData, excerpt: value })}
          onCoverImageChange={(value) => setFormData({ ...formData, coverImage: value })}
          onContentChange={(value) => setFormData({ ...formData, content: value })}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </main>
  );
}
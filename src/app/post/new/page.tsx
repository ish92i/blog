'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/PostForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    coverImage: '',
    content: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, published: true }),
      });

      if (res.ok) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Nouvel Article</h1>
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
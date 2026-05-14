"use client";

import { useState, useEffect } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPost, updatePost, deletePost, type Post } from "@/lib/api";
import { PostForm } from "@/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const loadPost = useCallback(async (postId: string) => {
    try {
      const data = await getPost(postId);
      setPost(data);
      setTitle(data.title);
      setSubtitle(data.subtitle || "");
      setExcerpt(data.excerpt);
      setCoverImage(data.coverImage || "");
      setContent(data.content);
      setPublished(data.published);
    } catch {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadPost(p.id);
    });
  }, [params, loadPost]);

  const handleSubmit = async () => {
    if (!title || !excerpt || !content) {
      setError("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePost(id, {
        title,
        subtitle,
        excerpt,
        coverImage,
        content,
        published,
      });
      router.push(`/post/${id}`);
    } catch {
      setError("Failed to update post. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePost(id);
      router.push("/");
    } catch {
      setError("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Post not found</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            <Link href={`/post/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Post
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Edit Post
          </h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Published
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Uncheck to save as draft
          </p>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
          />
        </div>

        <PostForm
          title={title}
          subtitle={subtitle}
          excerpt={excerpt}
          coverImage={coverImage}
          content={content}
          onTitleChange={setTitle}
          onSubtitleChange={setSubtitle}
          onExcerptChange={setExcerpt}
          onCoverImageChange={setCoverImage}
          onContentChange={setContent}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

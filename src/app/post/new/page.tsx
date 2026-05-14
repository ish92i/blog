"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/api";
import { PostForm } from "@/components";

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const handleSubmit = async () => {
    if (!title || !excerpt || !content) {
      setError("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const post = await createPost({
        title,
        subtitle,
        excerpt,
        coverImage,
        content,
        published,
      });
      router.push(`/post/${post.id}`);
    } catch {
      setError("Failed to create post. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Create New Post
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Write a new article for your blog.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Publish immediately
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MDXEditor } from "./MDXEditor";
import { ImageUploader } from "./ImageUploader";
import { cn } from "@/lib/utils";

interface PostFormProps {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  onExcerptChange?: (value: string) => void;
  onCoverImageChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function PostForm({
  title,
  subtitle,
  excerpt,
  coverImage,
  content,
  onTitleChange,
  onSubtitleChange,
  onExcerptChange,
  onCoverImageChange,
  onContentChange,
  onSubmit,
  isSubmitting,
  className,
}: PostFormProps) {
  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cover Image
        </label>
        <ImageUploader value={coverImage} onChange={onCoverImageChange || (() => {})} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <Input
          value={title || ""}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Post title"
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Subtitle
        </label>
        <Input
          value={subtitle || ""}
          onChange={(e) => onSubtitleChange?.(e.target.value)}
          placeholder="Optional subtitle"
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Excerpt
        </label>
        <Textarea
          value={excerpt || ""}
          onChange={(e) => onExcerptChange?.(e.target.value)}
          placeholder="Brief description of the post"
          rows={3}
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Content
        </label>
        <MDXEditor
          value={content || ""}
          onChange={onContentChange || (() => {})}
          placeholder="Write your post content..."
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </form>
  );
}

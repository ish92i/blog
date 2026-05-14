import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PostHeaderProps {
  title: string;
  subtitle?: string;
  date: string;
  coverImage?: string;
}

export function PostHeader({ title, subtitle, date, coverImage }: PostHeaderProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      {coverImage && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="space-y-4">
        <time className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {date}
        </time>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
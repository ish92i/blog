import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  slug: string;
  icon?: LucideIcon;
}

export function BlogCard({ title, excerpt, date, coverImage, slug, icon: Icon }: BlogCardProps) {
  return (
    <Link href={`/post/${slug}`} className="group block">
      <Card className="overflow-hidden border-zinc-200 bg-zinc-50 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
        <div className="aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : Icon ? (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-12 w-12 text-zinc-400" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              <span className="text-4xl font-light text-zinc-400">✦</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <time className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {date}
          </time>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            {title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {excerpt}
          </p>
        </div>
      </Card>
    </Link>
  );
}
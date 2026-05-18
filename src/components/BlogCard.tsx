import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  slug: string;
  icon?: LucideIcon;
  className?: string;
  featured?: boolean;
}

export function BlogCard({ title, excerpt, date, coverImage, slug, icon: Icon, className = "", featured = false }: BlogCardProps) {
  return (
    <Link href={`/post/${slug}`} className={`group block ${className}`}>
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900">
        {(coverImage || Icon) ? (
          <div className="aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover saturate-75 transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : Icon ? (
              <div className="flex h-full items-center justify-center bg-[#efe8dc] dark:bg-zinc-900">
                <Icon className="h-12 w-12 text-zinc-500 dark:text-zinc-300" />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="p-5">
          <time className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {date}
          </time>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-zinc-950 transition-colors group-hover:text-rose-800 dark:text-zinc-50 dark:group-hover:text-rose-100">
            {title}
          </h2>
          <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Lire
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}

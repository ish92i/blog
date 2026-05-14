import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-zinc-50/80 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
          <span className="text-2xl">✦</span>
          <span>Blog</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Home
          </Link>
          <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Articles
          </Link>
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
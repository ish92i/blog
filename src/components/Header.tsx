import Link from "next/link";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200/70 bg-[#fbfaf7]/85 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
        <Link href="/" className="text-xs sm:text-sm font-semibold text-zinc-950 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300">
          <span>Albert Camus 4<sup>e</sup> Blog</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link href="/articles" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Articles
          </Link>
          <Link href="/carte" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Carte
          </Link>
          <Link href="/videos" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            Vidéos
          </Link>
        </nav>
      </div>
    </header>
  );
}

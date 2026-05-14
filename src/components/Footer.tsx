import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span>Blog</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              Terms
            </Link>
          </nav>
          <p>© {year} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
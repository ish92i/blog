import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <span>Blog</span>
        </div>
        <p>© {year}</p>
      </div>
    </footer>
  );
}
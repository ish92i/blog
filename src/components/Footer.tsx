import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200/70 bg-[#fbfaf7] dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="font-medium text-zinc-800 hover:text-rose-800 dark:text-zinc-200 dark:hover:text-rose-100">
          Blog
        </Link>
        <p>© {year}</p>
      </div>
    </footer>
  );
}

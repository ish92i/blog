import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-[#fbfaf7] dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:py-8 dark:text-zinc-400">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          Collège Albert Camus
        </p>
        <div className="text-center">
          <p>Voyage à Londres — 2026</p>
          <p className="text-xs">Journal du séjour des 4e</p>
        </div>
        <Link 
          href="/contact" 
          className="font-medium text-zinc-800 hover:text-rose-800 dark:text-zinc-200 dark:hover:text-rose-100"
        >
          Contact / Mentions
        </Link>
      </div>
    </footer>
  );
}
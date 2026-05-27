# Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update footer with school/trip info and create contact page with form

**Architecture:** Footer uses existing flexbox layout, contact page uses Next.js App Router with client component for form handling

**Tech Stack:** Next.js, React, Tailwind CSS

---

### Task 1: Update Footer Component

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Read current Footer component**

```tsx
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
```

- [ ] **Step 2: Write new Footer with 3-column layout**

```tsx
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
```

- [ ] **Step 3: Verify with TypeScript**

Run: `npm run typecheck` or `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: update footer with school and trip info"
```

---

### Task 2: Create Contact Page

**Files:**
- Create: `src/app/contact/page.tsx`
- Create: `src/app/contact/ContactForm.tsx` (client component)

- [ ] **Step 1: Create ContactForm client component**

```tsx
"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("Form submitted:", {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-white/10 dark:bg-zinc-900">
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Message envoyé</p>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Nous vous répondrons bientôt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-rose-800 px-4 py-2 text-sm font-medium text-white hover:bg-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:bg-rose-900 dark:hover:bg-rose-800"
      >
        Envoyer
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create contact page**

```tsx
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact - Collège Albert Camus",
  description: "Contactez-nous pour le voyage à Londres 2026",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Contact</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Une question sur le voyage à Londres ? N&apos;hésitez pas à nous écrire.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify with TypeScript**

Run: `npm run typecheck` or `npx tsc --noEmit`

- [ ] **Step 4: Test the page manually**

Start dev server: `npm run dev`
Navigate to `/contact` and verify:
- Form renders correctly
- Dark mode works
- Submit shows success message

- [ ] **Step 5: Commit**

```bash
git add src/app/contact/
git commit -m "feat: add contact page with form"
```

---

### Task 3: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npm run typecheck`

- [ ] **Step 2: Verify footer on homepage**

Navigate to `/` and check footer displays correctly

- [ ] **Step 3: Commit any remaining changes**
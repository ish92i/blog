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
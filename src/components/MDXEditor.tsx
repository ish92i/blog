'use client';

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function MDXEditor({ value, onChange, placeholder, className }: MDXEditorProps) {
  const editor = useMemo(() => {
    return (
      <MDEditor
        value={value}
        onChange={(next) => onChange(next || "")}
        preview="live"
        height={360}
        data-color-mode="light"
        textareaProps={{
          placeholder: placeholder || "Write your content in Markdown...",
        }}
        visibleDragbar={false}
      />
    );
  }, [onChange, placeholder, value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      data-color-mode="light"
    >
      {editor}
    </div>
  );
}

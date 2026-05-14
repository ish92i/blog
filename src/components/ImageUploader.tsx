'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { generateUploadDropzone } from "@uploadthing/react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { AppRouter } from "@/lib/uploadthing";

const TypedUploadDropzone = generateUploadDropzone<AppRouter>({
  url: "/api/upload",
});

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <img src={value} alt="Upload" className="aspect-video w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
      <TypedUploadDropzone
        endpoint="postCover"
        appearance={{
          container:
            "ut-container w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-zinc-500 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400",
          button:
            "ut-button inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
          label: "ut-label mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100",
          allowedContent: "ut-allowed text-xs text-zinc-500 dark:text-zinc-400",
          uploadIcon: "ut-icon mx-auto mb-3 h-8 w-8 text-zinc-400",
        }}
        content={{
          label: "Drop an image here or click to browse",
          allowedContent: "PNG, JPG, WebP up to 4MB",
          button: "Select image",
          uploadIcon: <Upload className="h-8 w-8" />,
        }}
        onChange={() => setError(null)}
        onClientUploadComplete={(files) => {
          const uploaded = files[0];
          if (uploaded?.url) {
            onChange(uploaded.url);
            setError(null);
          }
        }}
        onUploadError={(uploadError) => {
          setError(uploadError.message || "Upload failed");
        }}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

# WYSIWYG Editor Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace markdown editor with a mobile-first WYSIWYG editor in a drawer, showing live formatted content while editing

**Architecture:** 
- Add TipTap editor for WYSIWYG experience (lightweight, extensible)
- Create Drawer component using @radix-ui/react-dialog with proper positioning
- Update PostForm to show content preview with "Edit" button that opens drawer
- Drawer contains full toolbar + TipTap editor

**Tech Stack:** TipTap (@tiptap/react, @tiptap/starter-kit), @radix-ui/react-dialog

---

## Task 1: Install TipTap dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add TipTap packages to package.json**

```json
"@tiptap/react": "^2.11.0",
"@tiptap/starter-kit": "^2.11.0",
"@tiptap/extension-underline": "^2.11.0",
"@tiptap/extension-link": "^2.11.0",
```

Run: `pnpm install`

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add TipTap editor dependencies"
```

---

## Task 2: Create Drawer component

**Files:**
- Create: `src/components/ui/drawer.tsx`
- Modify: `src/components/index.ts`

- [ ] **Step 1: Create Drawer component using @radix-ui/react-dialog**

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;
const DrawerPortal = DialogPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:max-w-lg inset-x-0 bottom-0 mx-auto rounded-t-lg border",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = DialogPrimitive.Content.displayName;

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
};
```

- [ ] **Step 2: Export from index.ts**

Add to `src/components/index.ts`:
```ts
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "./ui/drawer";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/drawer.tsx src/components/index.ts
git commit -m "feat: add Drawer component"
```

---

## Task 3: Create WYSIWYG Editor component

**Files:**
- Create: `src/components/WYSIWYGEditor.tsx`
- Modify: `src/components/index.ts`

- [ ] **Step 1: Create WYSIWYG Editor with TipTap**

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
      isActive && "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
    )}
  >
    {children}
  </button>
);

export function WYSIWYGEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: WYSIWYGEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="flex items-center gap-1 p-2 border-b bg-zinc-50 dark:bg-zinc-900 overflow-x-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="min-h-[400px] bg-white dark:bg-zinc-950" />
    </div>
  );
}
```

- [ ] **Step 2: Export from index.ts**

Add to `src/components/index.ts`:
```ts
export { WYSIWYGEditor } from "./WYSIWYGEditor";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WYSIWYGEditor.tsx src/components/index.ts
git commit -m "feat: add WYSIWYG editor component with TipTap"
```

---

## Task 4: Update PostForm to use drawer + preview

**Files:**
- Modify: `src/components/PostForm.tsx`

- [ ] **Step 1: Update PostForm to show content preview with edit button in drawer**

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WYSIWYGEditor } from "./WYSIWYGEditor";
import { ImageUploader } from "./ImageUploader";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";

interface PostFormProps {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  onExcerptChange?: (value: string) => void;
  onCoverImageChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function PostForm({
  title,
  subtitle,
  excerpt,
  coverImage,
  content,
  onTitleChange,
  onSubtitleChange,
  onExcerptChange,
  onCoverImageChange,
  onContentChange,
  onSubmit,
  isSubmitting,
  className,
}: PostFormProps) {
  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cover Image
        </label>
        <ImageUploader value={coverImage} onChange={onCoverImageChange || (() => {})} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <Input
          value={title || ""}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Post title"
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Subtitle
        </label>
        <Input
          value={subtitle || ""}
          onChange={(e) => onSubtitleChange?.(e.target.value)}
          placeholder="Optional subtitle"
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Excerpt
        </label>
        <Textarea
          value={excerpt || ""}
          onChange={(e) => onExcerptChange?.(e.target.value)}
          placeholder="Brief description of the post"
          rows={3}
          className="border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Content
        </label>
        <Drawer>
          <DrawerTrigger asChild>
            <div className="relative cursor-pointer">
              {content ? (
                <div className="border rounded-lg p-4 min-h-[200px] bg-zinc-50 dark:bg-zinc-950">
                  <div
                    className="prose prose-zinc dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center text-zinc-500 dark:text-zinc-400">
                  Click to add content
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Button type="button" variant="secondary" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] sm:h-[80vh]">
            <DrawerHeader className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <DrawerTitle>Edit Content</DrawerTitle>
                <DrawerClose asChild>
                  <Button type="button" size="sm">
                    Done
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-80px)]">
              <WYSIWYGEditor
                content={content || ""}
                onChange={onContentChange || (() => {})}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PostForm.tsx
git commit -m "feat: integrate WYSIWYG editor in drawer with preview"
```

---

## Task 5: Verify and test

**Files:**
- Verify: `src/app/post/new/page.tsx`

- [ ] **Step 1: Run dev server and verify the editor works**

Run: `pnpm dev`
Navigate to `/post/new` and verify:
1. Content field shows preview or placeholder
2. "Edit" button opens drawer
3. Toolbar buttons work
4. Content updates in real-time
5. "Done" saves and closes drawer

- [ ] **Step 2: Commit**

```bash
git commit --allow-empty -m "chore: verify WYSIWYG editor works"
```
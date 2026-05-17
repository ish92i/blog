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
import { Edit3, Type, FileText, ImageIcon } from "lucide-react";
import { remark } from "remark";
import html from "remark-html";
import { useMemo } from "react";

function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return remark().use(html).processSync(markdown).toString();
}

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
  const contentHtml = useMemo(() => markdownToHtml(content || ""), [content]);

  return (
    <form
      className={cn("max-w-4xl mx-auto", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <section className="space-y-6 mb-16 md:mb-24">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
            Image de couverture
          </h2>
        </div>
        <ImageUploader 
          value={coverImage} 
          onChange={onCoverImageChange || (() => {})} 
          className="transition-all duration-300 hover:shadow-xl"
        />
      </section>

      <section className="space-y-8 md:space-y-12 mb-16 md:mb-24">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
              Titre
            </h2>
          </div>
          <Input
            value={title || ""}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Entrez le titre de l'article..."
            className={cn(
              "h-14 md:h-16 text-xl md:text-2xl font-bold tracking-tight",
              "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "transition-all duration-300",
              "focus:border-zinc-900 dark:focus:border-zinc-100",
              "focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10",
              "focus:shadow-lg"
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
              Sous-titre
            </h2>
          </div>
          <Input
            value={subtitle || ""}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
            placeholder="Ajoutez un sous-titre..."
            className={cn(
              "h-12 md:h-14 text-lg font-medium",
              "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "text-zinc-700 dark:text-zinc-300",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "transition-all duration-300",
              "focus:border-zinc-900 dark:focus:border-zinc-100",
              "focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10",
              "focus:shadow-lg"
            )}
          />
        </div>
      </section>

      <section className="space-y-4 mb-16 md:mb-24">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
            Extrait
          </h2>
        </div>
        <Textarea
          value={excerpt || ""}
          onChange={(e) => onExcerptChange?.(e.target.value)}
          placeholder="Écrivez une brève description..."
          rows={5}
          className={cn(
            "text-lg leading-relaxed resize-none min-h-[160px]",
            "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
            "text-zinc-700 dark:text-zinc-300",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "transition-all duration-300",
            "focus:border-zinc-900 dark:focus:border-zinc-100",
            "focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10",
            "focus:shadow-lg"
          )}
        />
      </section>

      <section className="space-y-4 mb-16 md:mb-24">
        <div className="flex items-center gap-3">
          <Edit3 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
            Contenu
          </h2>
        </div>
        <Drawer direction="bottom">
          <DrawerTrigger asChild>
            <div className="relative cursor-pointer group">
              {content ? (
                <div className={cn(
                  "border-2 rounded-2xl p-8 min-h-[300px] bg-white dark:bg-zinc-900",
                  "transition-all duration-300",
                  "border-zinc-200 dark:border-zinc-800",
                  "group-hover:border-zinc-400 dark:group-hover:border-zinc-600",
                  "group-hover:shadow-2xl"
                )}>
                  <div
                    className="prose prose-zinc dark:prose-invert max-w-none prose-lg"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>
              ) : (
                <div className={cn(
                  "border-2 border-dashed border-zinc-300 dark:border-zinc-700",
                  "rounded-2xl p-16 text-center",
                  "transition-all duration-300",
                  "group-hover:border-zinc-500 dark:group-hover:border-zinc-500",
                  "group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50",
                  "group-hover:shadow-2xl"
                )}>
                  <Edit3 className="w-12 h-12 mx-auto mb-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  <p className="text-xl font-medium text-zinc-600 dark:text-zinc-400">
                    Cliquez pour ajouter votre contenu
                  </p>
                  <p className="text-base text-zinc-500 dark:text-zinc-500 mt-3">
                    Écrivez en markdown avec notre éditeur
                  </p>
                </div>
              )}
              <div className="absolute top-6 right-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  className={cn(
                    "h-11 min-w-[100px] px-6 font-semibold text-base",
                    "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
                    "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
                    "transition-all duration-300",
                    "hover:shadow-lg"
                  )}
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Éditer
                </Button>
              </div>
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] sm:h-[80vh]">
            <DrawerHeader className="px-8 pt-8 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Éditer le contenu
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button 
                    type="button" 
                    size="sm"
                    className="h-12 px-8 font-semibold text-base bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Terminé
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="px-8 pb-8 overflow-y-auto h-[calc(100%-100px)]">
              <WYSIWYGEditor
                content={content || ""}
                onChange={onContentChange || (() => {})}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </section>

      <section className="flex justify-end pt-12 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-14 min-w-[180px] px-10 text-lg font-bold",
            "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
            "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
            "transition-all duration-300",
            "hover:shadow-xl",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </Button>
      </section>
    </form>
  );
}
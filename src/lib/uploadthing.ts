import { createUploadthing } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  postCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type AppRouter = typeof uploadRouter;
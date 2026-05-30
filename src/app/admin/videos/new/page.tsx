"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MuxUploader, { MuxUploaderFileSelect, MuxUploaderProgress } from "@mux/mux-uploader-react";

export default function NewVideoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    fetch("/api/upload/mux").then(r => r.json()).then(data => {
      setUploadUrl(data.url);
      setUploadId(data.uploadId);
    });
  }, []);

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadSuccess = async () => {
    if (!uploadId || pollingRef.current) return;
    pollingRef.current = true;

    const saveRes = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, muxUploadId: uploadId }),
    });
    if (!saveRes.ok) return;
    const { id } = await saveRes.json();
    setProcessing(true);

    const poll = setInterval(async () => {
      const statusRes = await fetch(`/api/upload/mux/status?uploadId=${uploadId}`);
      const status = await statusRes.json();
      if (status.assetId && status.playbackId) {
        clearInterval(poll);
        await fetch(`/api/admin/videos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            muxPlaybackId: status.playbackId,
            muxAssetId: status.assetId,
            duration: status.duration,
            thumbnailUrl: status.thumbnailUrl,
          }),
        });
        router.push("/admin");
      }
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold mb-6">Nouvelle Vidéo</h1>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la vidéo" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnelle)" />
        </div>
        <div>
          {processing ? (
            <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 text-center dark:border-amber-700 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Vidéo reçue, traitement en cours...</p>
            </div>
          ) : (
            <MuxUploader
              endpoint={uploadUrl || ""}
              onUploadStart={handleUploadStart}
              onSuccess={handleUploadSuccess}
            >
              <span slot="heading" className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                Déposer une vidéo ici
              </span>
              <span slot="separator" className="text-sm text-zinc-400">ou</span>
              <MuxUploaderFileSelect className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300" />
              <MuxUploaderProgress type="bar" />
            </MuxUploader>
          )}
        </div>
      </div>
    </div>
  );
}

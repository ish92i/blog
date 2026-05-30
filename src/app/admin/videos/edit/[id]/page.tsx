"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/videos/${params.id}`)
      .then(r => r.json())
      .then(video => {
        setTitle(video.title);
        setDescription(video.description || "");
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async () => {
    await fetch(`/api/admin/videos/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    router.push("/admin");
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 pt-24 pb-12"><p>Chargement...</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold mb-6">Modifier la Vidéo</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <Button onClick={handleSubmit}>Enregistrer</Button>
      </div>
    </div>
  );
}

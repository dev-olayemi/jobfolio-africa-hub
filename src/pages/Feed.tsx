import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToDrive } from "@/lib/driveUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Feed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setPosts(arr);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fList = e.target.files ? Array.from(e.target.files) : [];
    if (fList.length === 0) return;
    setFiles((prev) => [...prev, ...fList].slice(0, 5));
    // limit to 5 images
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("Sign in to post updates");
      return;
    }
    if (!content.trim() && files.length === 0) {
      toast.error("Add some text or an image to post");
      return;
    }

    setIsPosting(true);
    try {
      let media: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map((f) =>
          uploadToDrive(f, user.uid)
            .then(
              (res) =>
                res?.link ||
                (res?.fileId
                  ? `https://drive.google.com/uc?export=view&id=${res.fileId}`
                  : undefined)
            )
            .catch((err) => {
              console.warn("upload error", err);
              return null;
            })
        );

        const results = await Promise.all(uploadPromises);
        media = results.filter(Boolean) as string[];
      }

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName:
          `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
          user.email,
        authorPhoto: profile?.profilePictureUrl || null,
        content: content.trim(),
        media,
        likes: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });

      setContent("");
      setFiles([]);
      toast.success("Posted");
    } catch (err) {
      console.error("Failed to create post", err);
      toast.error("Failed to post update");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Feed</h1>

        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, article, or thought..."
            className="w-full min-h-[80px] p-3 rounded-md border border-input resize-none"
          />

          <div className="flex flex-col gap-3 mt-3">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <span className="text-sm text-muted-foreground">
                (up to 5 images)
              </span>
            </div>

            {files.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end">
              <Button onClick={handlePost} disabled={isPosting}>
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;

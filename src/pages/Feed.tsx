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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Image, Smile, Send, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Feed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
      setIsFocused(false);
      toast.success("Posted successfully!");
    } catch (err) {
      console.error("Failed to create post", err);
      toast.error("Failed to post update");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Updates Feed
              </h1>
              <p className="text-sm text-muted-foreground">
                Share updates, connect with the community
              </p>
            </div>
          </div>

          {/* Create Post Card */}
          <div className={`bg-card border border-border rounded-xl p-4 mb-6 transition-all ${isFocused ? "shadow-lg ring-2 ring-primary/20" : "shadow-sm"}`}>
            <div className="flex gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                <AvatarImage src={profile?.profilePictureUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {user ? (
                  <>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      placeholder={`What's on your mind, ${profile?.firstName || "there"}?`}
                      className="w-full min-h-[80px] p-3 rounded-lg border border-input resize-none bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />

                    {/* File Preview */}
                    {files.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-3">
                        {files.map((f, i) => (
                          <div
                            key={i}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group"
                          >
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <input
                          id="feed-files"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById("feed-files")?.click()}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Image className="h-5 w-5 mr-1" />
                          Photo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Smile className="h-5 w-5 mr-1" />
                          Feeling
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handlePost} 
                        disabled={isPosting || (!content.trim() && files.length === 0)}
                        className="px-6"
                      >
                        {isPosting ? (
                          "Posting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground mb-3">
                      Sign in to share updates with the community
                    </p>
                    <Link to="/auth">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground text-sm">
                  Be the first to share an update with the community!
                </p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;

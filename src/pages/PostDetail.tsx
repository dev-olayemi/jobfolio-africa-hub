import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  doc,
  onSnapshot,
  collection,
  serverTimestamp,
  query,
  orderBy,
  runTransaction,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isProcessingComment, setIsProcessingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "posts", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
      else setPost(null);
    });

    const commentsQuery = query(
      collection(db, "posts", id, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubComments = onSnapshot(commentsQuery, (s) => {
      const arr: any[] = [];
      s.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setComments(arr);
    });

    return () => {
      unsub();
      unsubComments();
    };
  }, [id]);

  const handleAddComment = async () => {
    if (!user || !id) {
      toast.error("Sign in to comment");
      return;
    }
    if (!commentText.trim()) return;

    setIsProcessingComment(true);
    try {
      const postRef = doc(db, "posts", id);
      const commentsCol = collection(db, "posts", id, "comments");
      const newCommentRef = doc(commentsCol);

      await runTransaction(db, async (tx) => {
        const postSnap = await tx.get(postRef);
        if (!postSnap.exists()) throw new Error("Post not found");

        tx.set(newCommentRef, {
          authorId: user.uid,
          authorName:
            `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
            user.email,
          content: commentText.trim(),
          createdAt: serverTimestamp(),
        });

        tx.update(postRef, { commentsCount: increment(1) });
      });

      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment (transaction)", err);
      toast.error("Failed to add comment");
    } finally {
      setIsProcessingComment(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
    commentAuthorId?: string
  ) => {
    if (!user || !id) {
      toast.error("Sign in to delete comments");
      return;
    }

    const isAdmin = profile?.isAdmin || profile?.email === "alice@example.com";
    if (commentAuthorId !== user.uid && !isAdmin) {
      toast.error("You can only delete your own comments");
      return;
    }

    setIsProcessingComment(true);
    try {
      const postRef = doc(db, "posts", id);
      const commentRef = doc(db, "posts", id, "comments", commentId);

      await runTransaction(db, async (tx) => {
        const commentSnap = await tx.get(commentRef);
        if (!commentSnap.exists()) throw new Error("Comment not found");

        tx.delete(commentRef);
        tx.update(postRef, { commentsCount: increment(-1) });
      });
    } catch (err) {
      console.error("Failed to delete comment (transaction)", err);
      toast.error("Failed to delete comment");
    } finally {
      setIsProcessingComment(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        {post ? (
          <>
            <PostCard post={post} />

            <div className="mt-6 bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Comments ({comments.length})
              </h3>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="border border-border rounded-md p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {c.authorName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.createdAt?.toDate
                            ? c.createdAt.toDate().toLocaleString()
                            : ""}
                        </div>
                      </div>
                      <div>
                        {user &&
                          (c.authorId === user.uid ||
                            profile?.isAdmin ||
                            profile?.email === "alice@example.com") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteComment(c.id, c.authorId)
                              }
                              disabled={isProcessingComment}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      {c.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full rounded-md border border-input p-2"
                  placeholder="Write a comment..."
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={isProcessingComment}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>No post found</div>
        )}
      </div>
    </Layout>
  );
};

export default PostDetail;

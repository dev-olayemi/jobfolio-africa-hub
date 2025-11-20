import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, Clock } from "lucide-react";

const PostCard = ({ post }: { post: any }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = async () => {
    if (!user) return;
    setIsLiking(true);
    try {
      const postRef = doc(db, "posts", post.id);
      const hasLiked =
        Array.isArray(post.likes) && post.likes.includes(user.uid);
      if (hasLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    } finally {
      setIsLiking(false);
    }
  };

  const formattedTime = post?.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleString()
    : post?.createdAt || "";

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <img
          src={post.authorPhoto || `/assets/avatar-placeholder.png`}
          alt={post.authorName}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{post.authorName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm whitespace-pre-wrap">{post.content}</div>

          {post.media && post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {post.media.slice(0, 3).map((m: string, i: number) => (
                <img
                  key={i}
                  src={m}
                  alt={`media-${i}`}
                  className="w-full rounded-md max-h-96 object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className="flex items-center gap-2"
            >
              <Heart
                className={`h-4 w-4 ${
                  Array.isArray(post.likes) &&
                  user &&
                  post.likes.includes(user.uid)
                    ? "text-red-500"
                    : ""
                }`}
              />
              <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
            </button>

            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

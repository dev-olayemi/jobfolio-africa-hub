import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, Share2, Clock, ChevronDown, ChevronUp, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: any;
}

const PostCard = ({ post }: { post: any }) => {
  const { user, profile } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const MAX_CONTENT_LENGTH = 280;
  const contentIsLong = post.content && post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = expanded || !contentIsLong 
    ? post.content 
    : post.content.slice(0, MAX_CONTENT_LENGTH) + "...";

  const toggleLike = async () => {
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }
    setIsLiking(true);
    try {
      const postRef = doc(db, "posts", post.id);
      const hasLiked = Array.isArray(post.likes) && post.likes.includes(user.uid);
      if (hasLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setLoadingComments(true);
    setShowComments(true);
    
    const commentsRef = collection(db, "posts", post.id, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));
    
    const unsub = onSnapshot(commentsQuery, (snap) => {
      const arr: Comment[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() } as Comment));
      setComments(arr);
      setLoadingComments(false);
    }, (err) => {
      console.error("Error loading comments:", err);
      setLoadingComments(false);
    });

    // Return unsubscribe function (we could store this to clean up later)
    return unsub;
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const commentsRef = collection(db, "posts", post.id, "comments");
      await addDoc(commentsRef, {
        authorId: user.uid,
        authorName: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || user.email,
        authorPhoto: profile?.profilePictureUrl || null,
        content: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      // Update comments count
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, { commentsCount: (post.commentsCount || 0) + 1 });

      setNewComment("");
      toast.success("Comment added");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.authorName}`,
          text: post.content?.slice(0, 100) + "...",
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDeletePost = async () => {
    if (!user || user.uid !== post.authorId) return;
    
    try {
      await deleteDoc(doc(db, "posts", post.id));
      toast.success("Post deleted");
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error("Failed to delete post");
    }
  };

  const formattedTime = post?.createdAt?.toDate
    ? formatTimeAgo(post.createdAt.toDate())
    : post?.createdAt || "";

  const hasLiked = Array.isArray(post.likes) && user && post.likes.includes(user.uid);
  const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md">
      {/* Header - Author Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarImage 
              src={post.authorPhoto || undefined} 
              alt={post.authorName} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.authorName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
              {post.authorName}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {user?.uid === post.authorId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {displayContent}
        </p>
        {contentIsLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary text-sm font-medium mt-2 flex items-center gap-1 hover:underline"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-2 rounded-lg overflow-hidden">
          {post.media.slice(0, 4).map((m: string, i: number) => (
            <div key={i} className="relative">
              <img
                src={m}
                alt={`media-${i}`}
                className="w-full rounded-lg max-h-[400px] object-cover"
              />
              {i === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white text-2xl font-bold">+{post.media.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Bar */}
      {(likesCount > 0 || (post.commentsCount || 0) > 0) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border/50">
          {likesCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          )}
          {(post.commentsCount || 0) > 0 && (
            <span>{post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-around gap-2 py-1 border-y border-border/30">
        <button
          onClick={toggleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 flex-1 justify-center ${
            hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          }`}
        >
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
          <span className="font-medium text-sm">Like</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground hover:text-primary flex-1 justify-center"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium text-sm">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground hover:text-primary flex-1 justify-center"
        >
          <Share2 className="h-5 w-5" />
          <span className="font-medium text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/30">
          {/* Comment Input */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.profilePictureUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {profile?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleAddComment} 
                disabled={isCommenting || !newComment.trim()}
                className="h-9 px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorPhoto || undefined} />
                    <AvatarFallback className="bg-muted text-xs">
                      {comment.authorName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt?.toDate ? formatTimeAgo(comment.createdAt.toDate()) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default PostCard;

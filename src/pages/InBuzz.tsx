import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, Send, ChevronDown, ChevronUp, Clock, BadgeCheck, Image, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import inbuzzLogo from "@/assets/inbuzz-logo.png";
import { getDemoPosts, togglePostLike, addPostComment, addDemoPost, formatTimeAgo, DemoPost, DemoComment } from "@/lib/demoData";

const InBuzz = () => {
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Demo user for posting
  const demoUser = {
    id: 'demo-user',
    name: 'Demo User',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    role: 'Job Seeker'
  };

  useEffect(() => {
    setPosts(getDemoPosts());
  }, []);

  const handlePost = () => {
    if (!content.trim()) {
      toast.error("Add some text to post");
      return;
    }
    setIsPosting(true);
    
    const newPost = addDemoPost({
      authorId: demoUser.id,
      authorName: demoUser.name,
      authorPhoto: demoUser.photo,
      authorRole: demoUser.role,
      isVerified: false,
      content: content.trim(),
      media: []
    });
    
    setPosts([newPost, ...posts]);
    setContent("");
    setIsFocused(false);
    setIsPosting(false);
    toast.success("Posted successfully!");
  };

  const handleLike = (postId: string) => {
    const updated = togglePostLike(postId, demoUser.id);
    if (updated) {
      setPosts(posts.map(p => p.id === postId ? updated : p));
    }
  };

  const handleComment = (postId: string, commentContent: string) => {
    const updated = addPostComment(postId, {
      authorId: demoUser.id,
      authorName: demoUser.name,
      authorPhoto: demoUser.photo,
      content: commentContent
    });
    if (updated) {
      setPosts(posts.map(p => p.id === postId ? updated : p));
      toast.success("Comment added!");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          {/* Header with InBuzz Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={inbuzzLogo} alt="InBuzz" className="h-12 w-12 rounded-xl object-contain bg-white p-1" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">InBuzz</h1>
                <p className="text-sm text-muted-foreground">Share updates, connect with the community</p>
              </div>
            </div>
          </div>

          {/* Create Post Card */}
          <div className={`bg-card border border-border rounded-xl p-4 mb-6 transition-all ${isFocused ? "shadow-lg ring-2 ring-primary/20" : "shadow-sm"}`}>
            <div className="flex gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                <AvatarImage src={demoUser.photo} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">D</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[80px] p-3 rounded-lg border border-input resize-none bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Image className="h-5 w-5 mr-1" /> Photo
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Smile className="h-5 w-5 mr-1" /> Feeling
                    </Button>
                  </div>
                  <Button onClick={handlePost} disabled={isPosting || !content.trim()} className="px-6">
                    {isPosting ? "Posting..." : <><Send className="h-4 w-4 mr-2" /> Post</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} currentUserId={demoUser.id} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface PostCardProps {
  post: DemoPost;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  currentUserId: string;
}

const PostCard = ({ post, onLike, onComment, currentUserId }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const MAX_CONTENT_LENGTH = 280;
  const contentIsLong = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = expanded || !contentIsLong ? post.content : post.content.slice(0, MAX_CONTENT_LENGTH) + "...";
  const hasLiked = post.likes.includes(currentUserId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onComment(post.id, newComment.trim());
    setNewComment("");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
          <AvatarImage src={post.authorPhoto} alt={post.authorName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{post.authorName}</span>
            {post.isVerified && <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />}
          </div>
          <div className="text-xs text-muted-foreground">{post.authorRole}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        {contentIsLong && (
          <button onClick={() => setExpanded(!expanded)} className="text-primary text-sm font-medium mt-2 flex items-center gap-1 hover:underline">
            {expanded ? <>Show less <ChevronUp className="h-4 w-4" /></> : <>Read more <ChevronDown className="h-4 w-4" /></>}
          </button>
        )}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={post.media[0]} alt="Post media" className="w-full max-h-[400px] object-cover" />
        </div>
      )}

      {/* Stats */}
      {(post.likes.length > 0 || post.commentsCount > 0) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border/50">
          {post.likes.length > 0 && <span className="flex items-center gap-1"><Heart className="h-3 w-3 fill-red-500 text-red-500" /> {post.likes.length} likes</span>}
          {post.commentsCount > 0 && <span>{post.commentsCount} comments</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-around gap-2 py-1 border-y border-border/30">
        <button onClick={() => onLike(post.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 flex-1 justify-center ${hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} /> <span className="font-medium text-sm">Like</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground hover:text-primary flex-1 justify-center">
          <MessageCircle className="h-5 w-5" /> <span className="font-medium text-sm">Comment</span>
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground hover:text-primary flex-1 justify-center">
          <Share2 className="h-5 w-5" /> <span className="font-medium text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">D</AvatarFallback></Avatar>
            <div className="flex-1 flex gap-2">
              <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 h-9 text-sm" onKeyDown={(e) => { if (e.key === "Enter") handleSubmitComment(); }} />
              <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()} className="h-9 px-3"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
          {post.comments.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8"><AvatarImage src={comment.authorPhoto} /><AvatarFallback className="bg-muted text-xs">{comment.authorName.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
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

export default InBuzz;

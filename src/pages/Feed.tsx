import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/Layout";
          {/* Create Post Card */}
          <div className={`bg-card border border-border rounded-xl p-4 mb-6 transition-all ${isFocused ? "shadow-lg ring-2 ring-primary/20" : "shadow-sm"}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-primary/10">
                <AvatarImage src={profile?.profilePicture || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(profile?.firstName?.[0] || profile?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {user ? (
                  <>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      placeholder={`What's happening, ${profile?.firstName || profile?.displayName || "there"}?`}
                      className="w-full min-h-[64px] sm:min-h-[80px] p-3 rounded-lg border border-input resize-none bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />

                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border flex items-center gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Image className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">Upload</span>
                      </Button>

                      <Input
                        value={mediaInput}
                        onChange={(e) => setMediaInput(e.target.value)}
                        placeholder="Paste image or video URL here..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addMediaUrl()}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setMediaInput(""); setShowMediaInput(false); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {mediaUrls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mediaUrls.map((m, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border group">
                            {m.type === 'image' && <Image className="h-4 w-4 text-blue-500" />}
                            {m.type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                            {m.type === 'unknown' && <LinkIcon className="h-4 w-4 text-gray-500" />}

                            <span className="flex-1 text-sm truncate">{m.uploading ? 'Uploading...' : m.url}</span>

                            <Button onClick={() => removeMediaUrl(i)} variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 flex-wrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-primary">
                          <Image className="h-5 w-5 mr-1" />
                          <span className="hidden sm:inline">Media</span>
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" disabled>
                          <Smile className="h-5 w-5 mr-1" />
                          <span className="hidden sm:inline">Emoji</span>
                        </Button>
                      </div>

                      <div className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4">
                        <Button onClick={handlePost} disabled={isPosting || (!content.trim() && mediaUrls.length === 0)} className="w-full sm:w-auto px-4 sm:px-6">
                          {isPosting ? 'Posting...' : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Share</span>
                              <span className="sm:hidden">Post</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground mb-3">Sign in to share updates with the community</p>
                    <Link to="/auth">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
    }
  };

  const handlePost = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to post");
      return;
    }
    
    if (!content.trim() && mediaUrls.length === 0) {
      toast.error("Please add some content or media to post");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Anonymous",
        authorType: profile.accountType || "jobseeker",
        authorAvatar: profile.profilePicture || null,
        title: null,
        body: content.trim(),
        media: mediaUrls.map(m => m.url),
        tags: [],
        likes: 0,
        comments: 0,
        shares: 0,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setContent("");
      setMediaUrls([]);
      setMediaInput("");
      setIsFocused(false);
      setShowMediaInput(false);
      toast.success("Post shared successfully!");
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error("Failed to share post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const getMediaType = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const lowerUrl = url.toLowerCase();
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext)) || 
        lowerUrl.includes('youtube.com') || 
        lowerUrl.includes('youtu.be') ||
        lowerUrl.includes('vimeo.com')) {
      return 'video';
    }
    
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'image';
    }
    
    return 'unknown';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-3 sm:px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Community Feed
              </h1>
              <p className="text-sm text-muted-foreground">
                Share updates and connect with the JobFolio community
              </p>
            </div>
          </div>

          {/* Create Post Card */}
          <div className={`bg-card border border-border rounded-xl p-4 mb-6 transition-all ${isFocused ? "shadow-lg ring-2 ring-primary/20" : "shadow-sm"}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-primary/10">
                <AvatarImage src={profile?.profilePicture || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(profile?.firstName?.[0] || profile?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {user ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      placeholder={`What's happening, ${profile?.firstName || profile?.displayName || "there"}?`}
                      className="w-full min-h-[64px] sm:min-h-[80px] p-3 rounded-lg border border-input resize-none bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />

                    {/* Media URL Input */}
                          <span className="hidden sm:inline">Media</span>
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex gap-2">
                          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Image className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Media</span>
                          </Button>
                          <Input
                            value={mediaInput}
                            onChange={(e) => setMediaInput(e.target.value)}
                            placeholder="Paste image or video URL here..."
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && addMediaUrl()}
                          />
                          <span className="hidden sm:inline">Emoji</span>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                      <div className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4">
                        <Button
                          onClick={handlePost}
                          disabled={isPosting || (!content.trim() && mediaUrls.length === 0)}
                          className="w-full sm:w-auto px-4 sm:px-6"
                        >
                          {isPosting ? (
                            "Posting..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Share</span>
                              <span className="sm:hidden">Post</span>
                            </>
                          )}
                        </Button>
                      </div>
                    {mediaUrls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mediaUrls.map((url, i) => {
                          const mediaType = getMediaType(url);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border group"
                            >
                              {mediaType === 'image' && <Image className="h-4 w-4 text-blue-500" />}
                              {mediaType === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                              {mediaType === 'unknown' && <LinkIcon className="h-4 w-4 text-gray-500" />}
                              
                              <span className="flex-1 text-sm truncate">{url}</span>
                              
                              <Button
                                onClick={() => removeMediaUrl(i)}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMediaInput(true)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Image className="h-5 w-5 mr-1" />
                          Media
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                          disabled
                        >
                          <Smile className="h-5 w-5 mr-1" />
                          Emoji
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handlePost} 
                        disabled={isPosting || (!content.trim() && mediaUrls.length === 0)}
                        className="px-4 sm:px-6 mt-2 sm:mt-0"
                      >
                        {isPosting ? (
                          "Posting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Share
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
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;

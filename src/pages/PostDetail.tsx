import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (id, username, avatar_url),
          likes (user_id)
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (id, username, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    if (!user || !post || isLiking) return;
    
    setIsLiking(true);
    const isLiked = post.likes.some((like: any) => like.user_id === user.id);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      }
      fetchPost();
    } catch (error: any) {
      toast.error(error.message || "Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          text: newComment.trim(),
        });

      if (error) throw error;
      setNewComment("");
      fetchComments();
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      fetchComments();
      toast.success("Comment deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    );
  }

  const isLiked = post.likes.some((like: any) => like.user_id === user?.id);
  const likesCount = post.likes.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20 md:pb-6">
        <Card className="overflow-hidden shadow-strong">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-square bg-muted">
              <img
                src={post.image_url}
                alt={post.caption || "Post image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center space-x-3 p-4 border-b">
                <Link to={`/profile/${post.profiles.id}`}>
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    <AvatarImage src={post.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-sunset text-white">
                      {post.profiles.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${post.profiles.id}`}>
                    <p className="text-sm font-semibold hover:underline">
                      {post.profiles.username}
                    </p>
                  </Link>
                </div>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {/* Post caption as first comment */}
                {post.caption && (
                  <div className="flex space-x-3">
                    <Link to={`/profile/${post.profiles.id}`}>
                      <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                        <AvatarImage src={post.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-sunset text-white text-xs">
                          {post.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link to={`/profile/${post.profiles.id}`} className="font-semibold hover:underline">
                          {post.profiles.username}
                        </Link>{" "}
                        {post.caption}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments list */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 group">
                    <Link to={`/profile/${comment.profiles.id}`}>
                      <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                        <AvatarImage src={comment.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-sunset text-white text-xs">
                          {comment.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link to={`/profile/${comment.profiles.id}`} className="font-semibold hover:underline">
                          {comment.profiles.username}
                        </Link>{" "}
                        {comment.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-smooth h-8 w-8"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={cn(
                      "transition-smooth",
                      isLiked && "text-primary hover:text-primary"
                    )}
                  >
                    <Heart className={cn("w-6 h-6", isLiked && "fill-primary")} />
                  </Button>
                </div>
                
                <p className="text-sm font-semibold">
                  {likesCount} {likesCount === 1 ? "like" : "likes"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Comment input */}
              <form onSubmit={handleComment} className="flex items-center space-x-2 p-4 border-t">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() || isCommenting}
                  className="bg-gradient-sunset hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

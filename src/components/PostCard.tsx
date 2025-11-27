import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    profiles: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    likes: { user_id: string }[];
    comments: any[];
  };
  onLikeToggle?: () => void;
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  
  const isLiked = post.likes.some((like) => like.user_id === user?.id);
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;

  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: post.id, user_id: user.id });
        
        if (error) throw error;
      }
      onLikeToggle?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-soft border-border/50 transition-smooth hover:shadow-strong">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
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
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <Link to={`/post/${post.id}`}>
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={post.image_url}
            alt={post.caption || "Post image"}
            className="w-full h-full object-cover transition-smooth hover:scale-105"
          />
        </div>
      </Link>
      
      <CardFooter className="flex-col items-start space-y-3 pt-4">
        <div className="flex items-center space-x-4 w-full">
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
          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </Link>
          <div className="ml-auto">
            <Button variant="ghost" size="icon">
              <Bookmark className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1 w-full">
          <p className="text-sm font-semibold">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </p>
          {post.caption && (
            <p className="text-sm">
              <Link to={`/profile/${post.profiles.id}`} className="font-semibold hover:underline">
                {post.profiles.username}
              </Link>{" "}
              {post.caption}
            </p>
          )}
          {commentsCount > 0 && (
            <Link to={`/post/${post.id}`}>
              <p className="text-sm text-muted-foreground hover:underline">
                View all {commentsCount} comments
              </p>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

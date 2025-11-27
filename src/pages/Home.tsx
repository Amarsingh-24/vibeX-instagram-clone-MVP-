import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      // Fetch posts from followed users and own posts
      const { data: followsData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user?.id);

      const followingIds = followsData?.map((f) => f.following_id) || [];
      const userIds = [...followingIds, user?.id];

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (id, username, avatar_url),
          likes (user_id),
          comments (id)
        `)
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Follow users or create your first post to get started!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLikeToggle={fetchPosts} />
          ))
        )}
      </div>
    </Layout>
  );
}

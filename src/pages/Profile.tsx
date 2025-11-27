import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Settings, Grid, Heart } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
      if (!isOwnProfile) checkFollowStatus();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch followers and following counts
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      setFollowersCount(followersCount || 0);
      setFollowingCount(followingCount || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          likes (user_id),
          comments (id)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !userId) return;
    
    try {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success("Unfollowed");
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: userId });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success("Following!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update follow status");
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

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20 md:pb-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <Avatar className="w-32 h-32 ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-sunset text-white text-4xl">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                <h1 className="text-2xl font-display font-bold">{profile.username}</h1>
                {isOwnProfile ? (
                  <Link to="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleFollowToggle}
                    className={
                      isFollowing
                        ? "bg-secondary"
                        : "bg-gradient-sunset hover:opacity-90"
                    }
                    size="sm"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <p className="font-semibold">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">posts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">following</p>
                </div>
              </div>

              {profile.full_name && (
                <p className="font-semibold mb-1">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-center space-x-2 text-sm font-semibold mb-6">
            <Grid className="w-4 h-4" />
            <span>POSTS</span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`}>
                  <Card className="overflow-hidden group cursor-pointer aspect-square">
                    <CardContent className="p-0 relative">
                      <img
                        src={post.image_url}
                        alt={post.caption || "Post"}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center space-x-6 text-white">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-6 h-6 fill-white" />
                          <span className="font-semibold">{post.likes.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

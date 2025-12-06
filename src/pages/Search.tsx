import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SearchProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Search() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch suggested users (people not followed yet)
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ["suggested-users", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .limit(10);

      if (error) throw error;
      return (data as SearchProfile[]) || [];
    },
    enabled: !!user,
  });

  // Fetch current user's follows
  const { data: follows = [] } = useQuery({
    queryKey: ["follows", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: followingId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
      toast.success("Following user!");
    },
    onError: () => {
      toast.error("Failed to follow user");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
      toast.success("Unfollowed user");
    },
    onError: () => {
      toast.error("Failed to unfollow user");
    },
  });

  const isFollowing = (profileId: string) => {
    return follows.some((f) => f.following_id === profileId);
  };

  const handleFollow = (profileId: string) => {
    if (isFollowing(profileId)) {
      unfollowMutation.mutate(profileId);
    } else {
      followMutation.mutate(profileId);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user?.id || "")
        .limit(20);

      if (error) throw error;
      setResults((data as SearchProfile[]) || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayUsers = query ? results : suggestedUsers;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            {query ? "Search Results" : "Find Friends"}
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/60" />
            <Input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-foreground/40"
            />
          </div>
        </div>

        {!query && suggestedUsers.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground/80 mb-2">
              Suggested for you
            </h2>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayUsers.length > 0 ? (
          <div className="space-y-2">
            {displayUsers.map((profile) => (
              <Card key={profile.id} className="bg-card border-border">
                <CardContent className="flex items-center justify-between p-4">
                  <Link 
                    to={`/profile/${profile.id}`}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{profile.username}</p>
                      {profile.full_name && (
                        <p className="text-sm text-foreground/60">
                          {profile.full_name}
                        </p>
                      )}
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    variant={isFollowing(profile.id) ? "outline" : "default"}
                    onClick={() => handleFollow(profile.id)}
                    className={isFollowing(profile.id) ? "text-foreground" : ""}
                  >
                    {isFollowing(profile.id) ? "Following" : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">No users found</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
            <p className="text-foreground/60">
              Search for users or discover new friends
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
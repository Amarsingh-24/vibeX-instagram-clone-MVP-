import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  caption: string | null;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
}

const Explore = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["explore-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles(id, username, avatar_url),
          likes(id, user_id),
          comments(id)
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Post[];
    },
  });

  // Sort by engagement (likes + comments)
  const sortedPosts = [...posts].sort((a, b) => {
    const engagementA = a.likes.length + a.comments.length;
    const engagementB = b.likes.length + b.comments.length;
    return engagementB - engagementA;
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold bg-gradient-neon bg-clip-text text-transparent">
            Explore
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
            >
              <img
                src={post.image_url}
                alt={post.caption || "Post"}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-2xl">❤️</span>
                  <span className="font-semibold">{post.likes.length}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-2xl">💬</span>
                  <span className="font-semibold">{post.comments.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;

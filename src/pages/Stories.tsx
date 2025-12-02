import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Eye } from "lucide-react";
import Layout from "@/components/Layout";
import { StoryViewer } from "@/components/StoryViewer";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  view_count?: number;
}

const Stories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*, profiles(username, avatar_url)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch view counts for each story
      const storiesWithViews = await Promise.all(
        (data || []).map(async (story) => {
          const { count } = await supabase
            .from("story_views")
            .select("*", { count: "exact", head: true })
            .eq("story_id", story.id);
          
          return {
            ...story,
            view_count: count || 0,
          };
        })
      );
      
      return storiesWithViews as Story[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("stories").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: file.type.startsWith("video") ? "video" : "image",
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story uploaded!");
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error) => {
      toast.error("Failed to upload story");
      console.error(error);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await uploadMutation.mutateAsync(selectedFile);
    setUploading(false);
  };

  useEffect(() => {
    const channel = supabase
      .channel("stories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stories",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["stories"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Stories
          </h1>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-neon-blue">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upload Story</h2>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="story-upload"
              />
              <label htmlFor="story-upload">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => document.getElementById("story-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image or Video
                </Button>
              </label>
            </div>

            {previewUrl && (
              <div className="relative">
                {selectedFile?.type.startsWith("video") ? (
                  <video src={previewUrl} className="w-full rounded-lg" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {selectedFile && (
              <Button
                className="w-full bg-gradient-neon"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Story"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-neon-pink cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                setSelectedStoryIndex(index);
                setViewerOpen(true);
              }}
            >
              {story.media_type === "video" ? (
                <video
                  src={story.media_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={story.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={story.profiles.avatar_url || "/placeholder.svg"}
                      alt={story.profiles.username}
                      className="w-8 h-8 rounded-full ring-2 ring-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {story.profiles.username}
                    </span>
                  </div>
                  {story.user_id === user?.id && (
                    <div className="flex items-center gap-1 text-foreground/80">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-medium">{story.view_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <StoryViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          stories={stories}
          initialIndex={selectedStoryIndex}
        />
      </div>
    </Layout>
  );
};

export default Stories;

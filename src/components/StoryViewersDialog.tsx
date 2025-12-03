import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoryViewersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
}

interface StoryViewer {
  id: string;
  viewer_id: string;
  viewed_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export function StoryViewersDialog({ open, onOpenChange, storyId }: StoryViewersDialogProps) {
  const { data: viewers = [], isLoading } = useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_views")
        .select("*, profiles:viewer_id(username, avatar_url)")
        .eq("story_id", storyId)
        .order("viewed_at", { ascending: false });

      if (error) throw error;
      return data as StoryViewer[];
    },
    enabled: open && !!storyId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Story Views ({viewers.length})
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">Loading...</p>
          ) : viewers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No views yet</p>
          ) : (
            viewers.map((viewer) => (
              <div
                key={viewer.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={viewer.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-neon text-foreground">
                    {viewer.profiles?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {viewer.profiles?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(viewer.viewed_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

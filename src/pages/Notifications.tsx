import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  created_at: string;
  actor: {
    username: string;
    avatar_url: string | null;
  };
  post_id: string | null;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*, actor:profiles!notifications_actor_id_fkey(username, avatar_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications deleted");
    },
    onError: () => {
      toast.error("Failed to delete notifications");
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id);
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "unfollow":
        return "unfollowed you";
      case "story_view":
        return "viewed your story";
      case "welcome":
        return "Welcome to vibeX! Start sharing your moments 🎉";
      case "welcome_back":
        return "Welcome back! We missed you 🎉";
      default:
        return "interacted with you";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "unfollow":
        return "👋";
      case "story_view":
        return "👁️";
      case "welcome":
        return "🎉";
      case "welcome_back":
        return "👋";
      default:
        return "🔔";
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Notifications
          </h1>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAllNotificationsMutation.mutate()}
              disabled={deleteAllNotificationsMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                notification.read
                  ? "bg-card/50"
                  : "bg-card shadow-neon-blue border-l-4 border-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={notification.actor.avatar_url || "/placeholder.svg"}
                    alt={notification.actor.username}
                    className="w-12 h-12 rounded-full ring-2 ring-primary"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    {notification.type === "welcome" || notification.type === "welcome_back" ? (
                      <span>{getNotificationText(notification)}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">
                          {notification.actor.username}
                        </span>{" "}
                        <span className="text-foreground/80">{getNotificationText(notification)}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-2">🔔</p>
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

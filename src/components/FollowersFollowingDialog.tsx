import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FollowersFollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: "followers" | "following";
}

export function FollowersFollowingDialog({ 
  open, 
  onOpenChange, 
  userId, 
  type 
}: FollowersFollowingDialogProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (type === "followers") {
        const { data, error } = await supabase
          .from("follows")
          .select("follower_id, profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)")
          .eq("following_id", userId);

        if (error) throw error;
        setUsers(data?.map((item: any) => item.profiles).filter(Boolean) || []);
      } else {
        const { data, error } = await supabase
          .from("follows")
          .select("following_id, profiles!follows_following_id_fkey(id, username, full_name, avatar_url)")
          .eq("follower_id", userId);

        if (error) throw error;
        setUsers(data?.map((item: any) => item.profiles).filter(Boolean) || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type} yet
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-sunset text-white">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.username}</p>
                    {user.full_name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {user.full_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

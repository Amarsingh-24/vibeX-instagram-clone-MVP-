import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!user) return [];

      const { data: participantsData, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (participantsError) throw participantsError;

      const conversationIds = participantsData.map((p) => p.conversation_id);

      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithUsers = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: otherParticipant } = await supabase
            .from("conversation_participants")
            .select("user_id, profiles(id, username, avatar_url)")
            .eq("conversation_id", conv.id)
            .neq("user_id", user.id)
            .single();

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            other_user: otherParticipant?.profiles,
            last_message: lastMessage,
          };
        })
      );

      return conversationsWithUsers as Conversation[];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(username, avatar_url)")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !selectedConversation) throw new Error("Invalid state");

      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageText("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    await sendMessageMutation.mutateAsync(messageText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages-${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, queryClient]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <div className="md:col-span-1 bg-card rounded-xl shadow-neon-purple overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-display font-bold">Messages</h2>
            </div>
            <ScrollArea className="h-[calc(100%-5rem)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                    selectedConversation === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conv.other_user?.avatar_url || "/placeholder.svg"}
                      alt={conv.other_user?.username}
                      className="w-12 h-12 rounded-full ring-2 ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {conv.other_user?.username}
                      </p>
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="md:col-span-2 bg-card rounded-xl shadow-neon-blue overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.sender_id === user?.id ? "justify-end" : ""
                        }`}
                      >
                        {msg.sender_id !== user?.id && (
                          <img
                            src={msg.sender.avatar_url || "/placeholder.svg"}
                            alt={msg.sender.username}
                            className="w-8 h-8 rounded-full ring-2 ring-accent"
                          />
                        )}
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-gradient-neon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <MessageCircle className="h-16 w-16 mx-auto opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;

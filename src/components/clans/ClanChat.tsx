import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Flame, Trophy, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClanMessage {
  id: string;
  user_id: string | null;
  message_type: string;
  content: string;
  created_at: string;
  username?: string;
}

interface ClanChatProps {
  clanId: string;
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

const SYSTEM_MESSAGE_ICONS: Record<string, any> = {
  streak: Flame,
  achievement: Trophy,
  goal: Target,
  xp: Zap,
};

const QUICK_REACTIONS = ["🔥", "💪", "👏", "🎉", "⭐"];

export function ClanChat({ clanId, currentUserId, onSendMessage }: ClanChatProps) {
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to realtime messages
    const channel = supabase
      .channel(`clan-messages-${clanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clan_messages',
          filter: `clan_id=eq.${clanId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Fetch username for user messages
          if (newMsg.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', newMsg.user_id)
              .maybeSingle();
            newMsg.username = profile?.username || 'Unknown';
          }
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clanId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('clan_messages')
      .select('*')
      .eq('clan_id', clanId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      setIsLoading(false);
      return;
    }

    // Fetch usernames for user messages
    const userIds = [...new Set(data?.filter(m => m.user_id).map(m => m.user_id) || [])];
    
    let usernames: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      
      profiles?.forEach(p => {
        usernames[p.id] = p.username;
      });
    }

    const messagesWithUsernames = data?.map(m => ({
      ...m,
      username: m.user_id ? usernames[m.user_id] || 'Unknown' : undefined
    })) || [];

    setMessages(messagesWithUsernames);
    setIsLoading(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleQuickReaction = (emoji: string) => {
    onSendMessage(emoji);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ClanMessage[]>);

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Clan Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-80 pr-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground px-2">{date}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  <div className="space-y-2">
                    {msgs.map((message) => {
                      const isSystem = message.message_type !== 'user';
                      const isOwn = message.user_id === currentUserId;
                      const SystemIcon = isSystem 
                        ? SYSTEM_MESSAGE_ICONS[message.message_type] || Zap 
                        : null;

                      if (isSystem) {
                        return (
                          <div 
                            key={message.id}
                            className="flex items-center gap-2 justify-center py-2 text-sm text-muted-foreground"
                          >
                            {SystemIcon && <SystemIcon className="w-4 h-4 text-warning" />}
                            <span>{message.content}</span>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground rounded-br-md' 
                                : 'bg-secondary rounded-bl-md'
                            }`}
                          >
                            {!isOwn && (
                              <div className="text-xs font-medium mb-1 opacity-70">
                                {message.username}
                              </div>
                            )}
                            <div>{message.content}</div>
                            <div className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Reactions */}
        <div className="flex gap-2 justify-center">
          {QUICK_REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => handleQuickReaction(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Send encouragement..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
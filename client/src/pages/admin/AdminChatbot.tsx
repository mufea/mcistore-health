import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Bot,
  User,
  Loader2,
  Home,
  ChevronRight,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { AdminLayout } from "./AdminDashboard";

export default function AdminChatbot() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  const { data: conversations, isLoading } = trpc.chatbot.adminListConversations.useQuery();
  const { data: messages, isLoading: msgsLoading } = trpc.chatbot.adminGetConversation.useQuery(
    { id: selectedConvId! },
    { enabled: !!selectedConvId }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Access restricted.</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"><Home className="h-4 w-4" />Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout noPadding>
      <div className="flex h-full overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 border-r border-border/60 flex flex-col">
          <div className="p-5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Conversations</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{conversations?.length ?? 0} total sessions</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : !conversations?.length ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/50 transition-colors ${selectedConvId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {conv.userId ? `User #${conv.userId}` : "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  {conv.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{conv.summary}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message viewer */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Conversation #{selectedConvId}</h2>
                  <p className="text-xs text-muted-foreground">{messages?.length ?? 0} messages</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedConvId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : !messages?.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No messages in this conversation</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Calendar,
  Package,
  ChevronDown,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Streamdown } from "streamdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface BookingForm {
  slotId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

// ─── Quick action chips ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Track my order", icon: Package, message: "I want to track my order" },
  { label: "Book a meeting", icon: Calendar, message: "I'd like to book a consultation meeting" },
  { label: "Product info", icon: Sparkles, message: "Tell me about your health products" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SESSION_KEY = "mci_chat_session_id";

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  // Persist sessionId in localStorage so history survives page reloads
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const fresh = nanoid();
    localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    slotId: 0,
    customerName: user?.name ?? "",
    customerEmail: user?.email ?? "",
    customerPhone: "",
    notes: "",
  });
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMsg: Message = {
        id: nanoid(),
        role: "assistant",
        content: String(data.message),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) setHasUnread(true);
    },
    onError: (e) => {
      toast.error("Failed to send message: " + e.message);
      setMessages((prev) => prev.slice(0, -1)); // remove optimistic
    },
  });

  const { data: availableSlots } = trpc.chatbot.meeting.listAvailable.useQuery(undefined, {
    enabled: isOpen,
  });

  // Load conversation history from server on first open
  const { data: historyData } = trpc.chatbot.getHistory.useQuery(
    { sessionId },
    { enabled: isOpen && !historyLoaded }
  );

  useEffect(() => {
    if (historyData && !historyLoaded) {
      setHistoryLoaded(true);
      if (historyData.length > 0) {
        const restored: Message[] = historyData.map((m) => ({
          id: nanoid(),
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(restored);
      }
    }
  }, [historyData, historyLoaded]);

  const bookMeetingMutation = trpc.chatbot.meeting.book.useMutation({
    onSuccess: (data) => {
      toast.success("Meeting booked successfully!");
      setShowBookingForm(false);
      setSelectedSlot(null);
      const confirmMsg: Message = {
        id: nanoid(),
        role: "assistant",
        content: `✅ **Meeting Confirmed!**\n\n${data.message}${data.meetingLink ? `\n\n📎 **Meeting Link:** ${data.meetingLink}` : ""}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    },
    onError: (e) => toast.error(e.message),
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  // Welcome message only if no history was restored
  useEffect(() => {
    if (isOpen && historyLoaded && messages.length === 0) {
      const welcome: Message = {
        id: nanoid(),
        role: "assistant",
        content: `Hello${user?.name ? ` ${user.name}` : ""}! 👋 I'm your MCI Store health advisor assistant.\n\nI can help you with:\n- 📦 **Tracking your orders**\n- 📅 **Booking a consultation meeting**\n- 💊 **Product recommendations & info**\n\nHow can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, historyLoaded]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: Message = {
        id: nanoid(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      sendMessageMutation.mutate({
        sessionId,
        message: text,
        userId: user?.id,
      });
    },
    [sessionId, user, sendMessageMutation]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleBooking = () => {
    if (!selectedSlot) return;
    bookMeetingMutation.mutate({
      ...bookingForm,
      slotId: selectedSlot,
      userId: user?.id,
    });
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
        )}

        {/* Chat window */}
        {isOpen && (
          <div
            className={`bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
              isMinimized
                ? "h-12 w-[calc(100vw-2rem)] md:h-14 md:w-[440px]"
                : "w-[calc(100vw-2rem)] max-w-[340px] md:w-[440px] h-[65vh] md:h-[calc(100vh-6rem)] max-h-[75vh] md:max-h-[calc(100vh-5rem)]"
            }`}
            style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">MCI Health Advisor</p>
                  <p className="text-xs text-primary-foreground/70 mt-0.5">Online · AI-powered</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  {isMinimized ? <ChevronDown className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground [&_p]:my-0.5 [&_ul]:my-1 [&_li]:my-0">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {sendMessageMutation.isPending && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions (show only when no messages beyond welcome) */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.message)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full border border-border/60 transition-colors"
                        >
                          <Icon className="h-3 w-3 text-primary" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Meeting booking form */}
                {showBookingForm && availableSlots && availableSlots.length > 0 && (
                  <div className="mx-4 mb-3 p-3 bg-muted/50 rounded-xl border border-border/60">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Book a Consultation
                    </p>

                    {/* Slot selection */}
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs text-muted-foreground">Select a time slot:</p>
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs border transition-colors ${
                            selectedSlot === slot.id
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border/60 bg-background hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">{slot.title}</span>
                          <span className="text-muted-foreground ml-1">
                            · {slot.date} {slot.startTime}–{slot.endTime}
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <div className="space-y-1.5">
                        <Input
                          className="h-7 text-xs"
                          placeholder="Your name"
                          value={bookingForm.customerName}
                          onChange={(e) => setBookingForm((f) => ({ ...f, customerName: e.target.value }))}
                        />
                        <Input
                          className="h-7 text-xs"
                          placeholder="Email address"
                          type="email"
                          value={bookingForm.customerEmail}
                          onChange={(e) => setBookingForm((f) => ({ ...f, customerEmail: e.target.value }))}
                        />
                        <Input
                          className="h-7 text-xs"
                          placeholder="Phone (optional)"
                          value={bookingForm.customerPhone}
                          onChange={(e) => setBookingForm((f) => ({ ...f, customerPhone: e.target.value }))}
                        />
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 h-7 text-xs bg-primary text-primary-foreground"
                            onClick={handleBooking}
                            disabled={bookMeetingMutation.isPending || !bookingForm.customerName || !bookingForm.customerEmail}
                          >
                            {bookMeetingMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Confirm Booking"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setShowBookingForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Available slots shortcut */}
                {!showBookingForm && availableSlots && availableSlots.length > 0 && messages.length > 1 && (
                  <div className="px-4 pb-2">
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {availableSlots.length} meeting slot{availableSlots.length !== 1 ? "s" : ""} available
                    </button>
                  </div>
                )}

                <Separator />

                {/* Input area */}
                <form onSubmit={handleSubmit} className="p-3 flex gap-2 flex-shrink-0">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-9 text-sm rounded-xl border-border/60"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex-shrink-0"
                    disabled={!input.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

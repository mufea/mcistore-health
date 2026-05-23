import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  chatbotConversations,
  chatbotMessages,
  chatbotKnowledge,
  meetingSlots,
  meetingBookings,
  orders,
  orderItems,
} from "../../drizzle/schema";

// ─── Helper: build system prompt with knowledge base ─────────────────────────

async function buildSystemPrompt(): Promise<string> {
  const db = await getDb();
  let knowledgeContext = "";

  if (db) {
    const knowledgeItems = await db
      .select()
      .from(chatbotKnowledge)
      .where(eq(chatbotKnowledge.isActive, true))
      .limit(50);

    if (knowledgeItems.length > 0) {
      knowledgeContext = "\n\n## Product & Company Knowledge Base\n";
      for (const item of knowledgeItems) {
        knowledgeContext += `\n### ${item.title} (${item.category})\n${item.content}\n`;
      }
    }
  }

  return `You are a friendly and professional health advisor assistant for MCI Store — a trusted health and wellness e-commerce platform. You help customers with:

1. **Order Management**: Look up order status, track shipments, answer questions about orders. When a customer provides an order number, use the order lookup tool to fetch real-time data.
2. **Meeting Scheduling**: Help customers book consultation meetings with our health advisors. Show available slots and guide them through booking.
3. **Product Advice**: Answer questions about our health products including supplements, necklaces, bracelets, watches, and wellness accessories based on the knowledge base below.
4. **General Health Guidance**: Provide general wellness tips aligned with our product offerings.

Always be warm, professional, and solution-oriented. If you cannot help with something, politely redirect to our support team.

When a customer asks to:
- Check an order → ask for their order number and look it up
- Book a meeting → show available slots and guide them to book
- Learn about products → use the knowledge base to answer accurately${knowledgeContext}`;
}

// ─── Helper: get or create conversation ──────────────────────────────────────

async function getOrCreateConversation(sessionId: string, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const existing = await db
    .select()
    .from(chatbotConversations)
    .where(eq(chatbotConversations.sessionId, sessionId))
    .limit(1);

  if (existing.length > 0) return existing[0]!;

  const [result] = await db.insert(chatbotConversations).values({
    sessionId,
    userId: userId ?? null,
  });

  const created = await db
    .select()
    .from(chatbotConversations)
    .where(eq(chatbotConversations.sessionId, sessionId))
    .limit(1);

  return created[0]!;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const chatbotRouter = router({
  // Send a message and get AI response
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        message: z.string().min(1).max(2000),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get or create conversation
      const conversation = await getOrCreateConversation(input.sessionId, input.userId);

      // Save user message
      await db.insert(chatbotMessages).values({
        conversationId: conversation.id,
        role: "user",
        content: input.message,
      });

      // Load recent conversation history (last 10 messages)
      const history = await db
        .select()
        .from(chatbotMessages)
        .where(eq(chatbotMessages.conversationId, conversation.id))
        .orderBy(desc(chatbotMessages.createdAt))
        .limit(10);

      const historyOrdered = history.reverse();

      // Build system prompt with knowledge base
      const systemPrompt = await buildSystemPrompt();

      // Check if the message is about an order
      let orderContext = "";
      const orderNumberMatch = input.message.match(/\b(MCI-[A-Z0-9]+|\d{6,})\b/i);
      if (orderNumberMatch) {
        const orderNumber = orderNumberMatch[0].toUpperCase();
        const orderResult = await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, orderNumber))
          .limit(1);

        if (orderResult.length > 0) {
          const order = orderResult[0]!;
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

          orderContext = `\n\n[SYSTEM: Order found - Order #${order.orderNumber}]
Status: ${order.status}
Payment: ${order.paymentStatus}
Customer: ${order.customerName}
Total: IDR ${Number(order.total).toLocaleString()}
Items: ${items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
Shipping to: ${order.shippingCity}, ${order.shippingCountry}
Created: ${new Date(order.createdAt).toLocaleDateString()}`;
        } else {
          orderContext = `\n\n[SYSTEM: No order found with number "${orderNumber}". Please verify the order number.]`;
        }
      }

      // Check if asking about meeting slots
      const meetingKeywords = ["book", "meeting", "schedule", "appointment", "consultation", "slot", "available"];
      const isMeetingQuery = meetingKeywords.some((kw) =>
        input.message.toLowerCase().includes(kw)
      );

      let meetingContext = "";
      if (isMeetingQuery) {
        const today = new Date().toISOString().split("T")[0]!;
        const availableSlots = await db
          .select()
          .from(meetingSlots)
          .where(and(eq(meetingSlots.isActive, true)))
          .orderBy(meetingSlots.date, meetingSlots.startTime)
          .limit(10);

        const futureSlots = availableSlots.filter(
          (s) => s.date >= today && s.currentBookings < s.maxBookings
        );

        if (futureSlots.length > 0) {
          meetingContext = `\n\n[SYSTEM: Available meeting slots]\n${futureSlots
            .map(
              (s) =>
                `- Slot ID ${s.id}: ${s.title} on ${s.date} at ${s.startTime}–${s.endTime} (${s.maxBookings - s.currentBookings} spots left)`
            )
            .join("\n")}`;
        } else {
          meetingContext = `\n\n[SYSTEM: No available meeting slots at the moment. Please check back later or contact support.]`;
        }
      }

      // Build messages for LLM
      const llmMessages = [
        { role: "system" as const, content: systemPrompt + orderContext + meetingContext },
        ...historyOrdered.slice(0, -1).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: input.message },
      ];

      // Call LLM
      const response = await invokeLLM({ messages: llmMessages });
      const rawContent = response.choices?.[0]?.message?.content;
      const assistantMessage: string =
        typeof rawContent === "string"
          ? rawContent
          : "I'm sorry, I couldn't process your request. Please try again.";

      // Save assistant response
      await db.insert(chatbotMessages).values({
        conversationId: conversation.id,
        role: "assistant",
        content: assistantMessage,
      });

      return {
        message: assistantMessage,
        conversationId: conversation.id,
      };
    }),

  // Get conversation history
  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conversation = await db
        .select()
        .from(chatbotConversations)
        .where(eq(chatbotConversations.sessionId, input.sessionId))
        .limit(1);

      if (conversation.length === 0) return [];

      const messages = await db
        .select()
        .from(chatbotMessages)
        .where(eq(chatbotMessages.conversationId, conversation[0]!.id))
        .orderBy(chatbotMessages.createdAt);

      return messages;
    }),

  // ─── Knowledge Base (Admin) ────────────────────────────────────────────────

  knowledge: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(chatbotKnowledge).orderBy(desc(chatbotKnowledge.updatedAt));
    }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          category: z.string().min(1).max(128),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(chatbotKnowledge).values(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          category: z.string().min(1).max(128),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const { id, ...data } = input;
        await db.update(chatbotKnowledge).set(data).where(eq(chatbotKnowledge.id, id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(chatbotKnowledge).where(eq(chatbotKnowledge.id, input.id));
        return { success: true };
      }),
  }),

  // ─── Meeting Slots (Admin + Public) ───────────────────────────────────────

  meeting: router({
    // Public: list available slots
    listAvailable: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const today = new Date().toISOString().split("T")[0]!;
      const slots = await db
        .select()
        .from(meetingSlots)
        .where(eq(meetingSlots.isActive, true))
        .orderBy(meetingSlots.date, meetingSlots.startTime);
      return slots.filter((s) => s.date >= today && s.currentBookings < s.maxBookings);
    }),

    // Public: book a slot
    book: publicProcedure
      .input(
        z.object({
          slotId: z.number(),
          customerName: z.string().min(1).max(255),
          customerEmail: z.string().email(),
          customerPhone: z.string().optional(),
          notes: z.string().optional(),
          userId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Check slot availability
        const slot = await db
          .select()
          .from(meetingSlots)
          .where(eq(meetingSlots.id, input.slotId))
          .limit(1);

        if (slot.length === 0) throw new Error("Slot not found");
        const s = slot[0]!;
        if (!s.isActive) throw new Error("This slot is no longer available");
        if (s.currentBookings >= s.maxBookings) throw new Error("This slot is fully booked");

        // Create booking
        await db.insert(meetingBookings).values({
          slotId: input.slotId,
          userId: input.userId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone ?? null,
          notes: input.notes ?? null,
          status: "confirmed",
        });

        // Increment booking count
        await db
          .update(meetingSlots)
          .set({ currentBookings: s.currentBookings + 1 })
          .where(eq(meetingSlots.id, input.slotId));

        return {
          success: true,
          message: `Your meeting has been booked for ${s.date} at ${s.startTime}. We'll send a confirmation to ${input.customerEmail}.`,
          meetingLink: s.meetingLink,
        };
      }),

    // Admin: list all slots
    adminList: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(meetingSlots).orderBy(desc(meetingSlots.date));
    }),

    // Admin: create slot
    adminCreate: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          maxBookings: z.number().min(1).default(1),
          meetingLink: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(meetingSlots).values({
          ...input,
          description: input.description ?? null,
          meetingLink: input.meetingLink ?? null,
        });
        return { success: true };
      }),

    // Admin: update slot
    adminUpdate: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          maxBookings: z.number().min(1),
          meetingLink: z.string().optional(),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const { id, ...data } = input;
        await db.update(meetingSlots).set({
          ...data,
          description: data.description ?? null,
          meetingLink: data.meetingLink ?? null,
        }).where(eq(meetingSlots.id, id));
        return { success: true };
      }),

    // Admin: delete slot
    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(meetingSlots).where(eq(meetingSlots.id, input.id));
        return { success: true };
      }),

    // Admin: list all bookings
    adminListBookings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(meetingBookings).orderBy(desc(meetingBookings.createdAt));
    }),

    // Admin: update booking status
    adminUpdateBooking: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["confirmed", "cancelled", "completed"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .update(meetingBookings)
          .set({ status: input.status })
          .where(eq(meetingBookings.id, input.id));
        return { success: true };
      }),
  }),

  // ─── Conversations (Admin) ─────────────────────────────────────────────────

  adminListConversations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(chatbotConversations)
      .orderBy(desc(chatbotConversations.updatedAt))
      .limit(100);
  }),

  adminGetConversation: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const messages = await db
        .select()
        .from(chatbotMessages)
        .where(eq(chatbotMessages.conversationId, input.id))
        .orderBy(chatbotMessages.createdAt);
      return messages;
    }),
});

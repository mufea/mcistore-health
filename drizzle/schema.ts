import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // User segment for premium product access
  segment: mysqlEnum("segment", ["standard", "premium", "vip"]).default("standard").notNull(),
  // Profile / address fields
  phone: varchar("phone", { length: 32 }),
  streetAddress: text("streetAddress"),
  aptNumber: varchar("aptNumber", { length: 64 }),
  city: varchar("city", { length: 128 }),
  province: varchar("province", { length: 128 }),
  postalCode: varchar("postalCode", { length: 16 }),
  country: varchar("country", { length: 128 }),
  preferredLanguage: varchar("preferredLanguage", { length: 8 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Survey ───────────────────────────────────────────────────────────────────

export const surveyPages = mysqlTable("survey_pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  order: int("order").notNull().default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SurveyPage = typeof surveyPages.$inferSelect;

export const surveyQuestions = mysqlTable("survey_questions", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("pageId").notNull(),
  text: text("text").notNull(),
  type: mysqlEnum("type", ["single_choice", "multiple_choice", "text", "scale"]).notNull(),
  options: json("options").$type<string[]>(),
  order: int("order").notNull().default(0),
  isRequired: boolean("isRequired").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SurveyQuestion = typeof surveyQuestions.$inferSelect;

export const surveyResponses = mysqlTable("survey_responses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  userId: int("userId"),
  answers: json("answers").$type<Record<string, string | string[]>>().notNull(),
  recommendedSegment: mysqlEnum("recommendedSegment", ["standard", "premium", "vip"]).default("standard"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"),
  images: json("images").$type<{ url: string; key: string }[]>(),
  targetSegment: mysqlEnum("targetSegment", ["all", "standard", "premium", "vip"]).default("all").notNull(),
  stock: int("stock").default(0).notNull(),
  reservedStock: int("reservedStock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  tags: json("tags").$type<string[]>(),
  // Recommendation mapping: which survey answers trigger this product
  recommendationTags: json("recommendationTags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId"),
  // Customer info snapshot
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }).notNull(),
  // User address
  streetAddress: text("streetAddress").notNull(),
  aptNumber: varchar("aptNumber", { length: 64 }),
  city: varchar("city", { length: 128 }).notNull(),
  province: varchar("province", { length: 128 }).notNull(),
  postalCode: varchar("postalCode", { length: 16 }).notNull(),
  country: varchar("country", { length: 128 }).notNull(),
  // Shipping address (may differ from user address)
  shippingStreet: text("shippingStreet").notNull(),
  shippingApt: varchar("shippingApt", { length: 64 }),
  shippingCity: varchar("shippingCity", { length: 128 }).notNull(),
  shippingProvince: varchar("shippingProvince", { length: 128 }).notNull(),
  shippingPostal: varchar("shippingPostal", { length: 16 }).notNull(),
  shippingCountry: varchar("shippingCountry", { length: 128 }).notNull(),
  // Shipping
  shippingType: mysqlEnum("shippingType", ["national", "international"]).notNull(),
  shippingCost: decimal("shippingCost", { precision: 12, scale: 2 }).notNull(),
  // Payment
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "midtrans"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  midtransOrderId: varchar("midtransOrderId", { length: 128 }),
  midtransToken: text("midtransToken"),
  midtransRedirectUrl: text("midtransRedirectUrl"),
  midtransPaymentType: varchar("midtransPaymentType", { length: 64 }),
  // Temporary inventory hold while payment is being completed.
  reservationStatus: mysqlEnum("reservationStatus", ["active", "released", "expired", "fulfilled"]).default("active").notNull(),
  reservationExpiresAt: timestamp("reservationExpiresAt"),
  reservationExtensions: int("reservationExtensions").default(0).notNull(),
  reservationFinalizedAt: timestamp("reservationFinalizedAt"),
  // Order status
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  // Totals
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  // Survey response link
  surveyResponseId: int("surveyResponseId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productPrice: decimal("productPrice", { precision: 12, scale: 2 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export const chatbotConversations = mysqlTable("chatbot_conversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  userId: int("userId"),
  // Summary of what was discussed
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotConversation = typeof chatbotConversations.$inferSelect;

export const chatbotMessages = mysqlTable("chatbot_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatbotMessage = typeof chatbotMessages.$inferSelect;

// ─── Chatbot Knowledge Base ───────────────────────────────────────────────────

export const chatbotKnowledge = mysqlTable("chatbot_knowledge", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 128 }).default("general").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotKnowledge = typeof chatbotKnowledge.$inferSelect;

// ─── Meeting Slots & Bookings ─────────────────────────────────────────────────

export const meetingSlots = mysqlTable("meeting_slots", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD
  startTime: varchar("startTime", { length: 8 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 8 }).notNull(),
  maxBookings: int("maxBookings").default(1).notNull(),
  currentBookings: int("currentBookings").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  meetingLink: text("meetingLink"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingSlot = typeof meetingSlots.$inferSelect;

export const meetingBookings = mysqlTable("meeting_bookings", {
  id: int("id").autoincrement().primaryKey(),
  slotId: int("slotId").notNull(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["confirmed", "cancelled", "completed"]).default("confirmed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingBooking = typeof meetingBookings.$inferSelect;

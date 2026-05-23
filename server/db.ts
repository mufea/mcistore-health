import { and, desc, eq, inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertOrder,
  InsertProduct,
  InsertUser,
  Order,
  orderItems,
  orders,
  products,
  settings,
  surveyPages,
  surveyQuestions,
  surveyResponses,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  userId: number,
  data: Partial<{
    name: string;
    phone: string;
    streetAddress: string;
    aptNumber: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    segment: "standard" | "premium" | "vip";
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Survey ───────────────────────────────────────────────────────────────────

export async function getSurveyPages(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(surveyPages);
  if (activeOnly) {
    return query.where(eq(surveyPages.isActive, true)).orderBy(surveyPages.order);
  }
  return query.orderBy(surveyPages.order);
}

export async function getSurveyQuestionsForPage(pageId: number, activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db
      .select()
      .from(surveyQuestions)
      .where(and(eq(surveyQuestions.pageId, pageId), eq(surveyQuestions.isActive, true)))
      .orderBy(surveyQuestions.order);
  }
  return db
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.pageId, pageId))
    .orderBy(surveyQuestions.order);
}

export async function getAllSurveyQuestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surveyQuestions).orderBy(surveyQuestions.pageId, surveyQuestions.order);
}

export async function createSurveyPage(data: {
  title: string;
  description?: string;
  order: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(surveyPages).values({ ...data, isActive: true });
  return result;
}

export async function updateSurveyPage(
  id: number,
  data: Partial<{ title: string; description: string; order: number; isActive: boolean }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(surveyPages).set(data).where(eq(surveyPages.id, id));
}

export async function deleteSurveyPage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(surveyQuestions).where(eq(surveyQuestions.pageId, id));
  await db.delete(surveyPages).where(eq(surveyPages.id, id));
}

export async function createSurveyQuestion(data: {
  pageId: number;
  text: string;
  type: "single_choice" | "multiple_choice" | "text" | "scale";
  options?: string[];
  order: number;
  isRequired: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(surveyQuestions).values({ ...data, isActive: true });
}

export async function updateSurveyQuestion(
  id: number,
  data: Partial<{
    pageId: number;
    text: string;
    type: "single_choice" | "multiple_choice" | "text" | "scale";
    options: string[];
    order: number;
    isRequired: boolean;
    isActive: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(surveyQuestions).set(data).where(eq(surveyQuestions.id, id));
}

export async function deleteSurveyQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(surveyQuestions).where(eq(surveyQuestions.id, id));
}

export async function saveSurveyResponse(data: {
  sessionId: string;
  userId?: number;
  answers: Record<string, string | string[]>;
  recommendedSegment: "standard" | "premium" | "vip";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(surveyResponses).values(data);
  return result;
}

export async function getSurveyResponseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(surveyResponses).where(eq(surveyResponses.id, id)).limit(1);
  return result[0];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(segment?: "standard" | "premium" | "vip") {
  const db = await getDb();
  if (!db) return [];

  const allowedSegments: string[] = ["all"];
  if (segment === "standard") allowedSegments.push("standard");
  if (segment === "premium") allowedSegments.push("standard", "premium");
  if (segment === "vip") allowedSegments.push("standard", "premium", "vip");

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        inArray(products.targetSegment, allowedSegments as ("all" | "standard" | "premium" | "vip")[])
      )
    )
    .orderBy(desc(products.isFeatured), products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(
  orderData: InsertOrder,
  items: { productId: number; productName: string; productPrice: number; quantity: number; subtotal: number }[]
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  await db.insert(orders).values(orderData);

  // Get the inserted order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderData.orderNumber!))
    .limit(1);

  if (!order) throw new Error("Failed to create order");

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: String(item.productPrice),
      quantity: item.quantity,
      subtotal: String(item.subtotal),
    }))
  );

  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  data: Partial<{
    status: Order["status"];
    paymentStatus: Order["paymentStatus"];
    midtransOrderId: string;
    midtransToken: string;
    midtransRedirectUrl: string;
    midtransPaymentType: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderByMidtransId(
  midtransOrderId: string,
  data: Partial<{
    paymentStatus: Order["paymentStatus"];
    status: Order["status"];
    midtransPaymentType: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orders).set(data).where(eq(orders.midtransOrderId, midtransOrderId));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result[0]?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

export async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .insert(settings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 };

  const allOrders = await db.select().from(orders);
  const allProducts = await db.select().from(products);

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const totalProducts = allProducts.filter((p) => p.isActive).length;

  return { totalOrders, totalRevenue, pendingOrders, totalProducts };
}

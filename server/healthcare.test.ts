import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  updateUserProfile: vi.fn(),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getSurveyPages: vi.fn().mockResolvedValue([]),
  getSurveyQuestionsForPage: vi.fn().mockResolvedValue([]),
  getAllSurveyQuestions: vi.fn().mockResolvedValue([]),
  createSurveyPage: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateSurveyPage: vi.fn().mockResolvedValue(undefined),
  deleteSurveyPage: vi.fn().mockResolvedValue(undefined),
  createSurveyQuestion: vi.fn().mockResolvedValue(undefined),
  updateSurveyQuestion: vi.fn().mockResolvedValue(undefined),
  deleteSurveyQuestion: vi.fn().mockResolvedValue(undefined),
  saveSurveyResponse: vi.fn().mockResolvedValue({ insertId: 1 }),
  getSurveyResponseById: vi.fn().mockResolvedValue(undefined),
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(undefined),
  getAllProductsAdmin: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue({ id: 1, orderNumber: "VW-TEST-001" }),
  getOrderByNumber: vi.fn().mockResolvedValue(undefined),
  getOrderById: vi.fn().mockResolvedValue(undefined),
  getOrderItems: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getOrdersByUserId: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  updateOrderByMidtransId: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue(null),
  getAllSettings: vi.fn().mockResolvedValue({}),
  upsertSetting: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Context Helpers ──────────────────────────────────────────────────────────

function makeCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({
    user: {
      id: 1,
      openId: "admin-open-id",
      name: "Admin User",
      email: "admin@vitawell.com",
      loginMethod: "manus",
      role: "admin",
      segment: "vip",
      phone: null,
      streetAddress: null,
      aptNumber: null,
      city: null,
      province: null,
      postalCode: null,
      country: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

function makeUserCtx(): TrpcContext {
  return makeCtx({
    user: {
      id: 2,
      openId: "user-open-id",
      name: "Test User",
      email: "user@example.com",
      loginMethod: "manus",
      role: "user",
      segment: "standard",
      phone: null,
      streetAddress: null,
      aptNumber: null,
      city: null,
      province: null,
      postalCode: null,
      country: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("user@example.com");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect((ctx.res.clearCookie as any).mock.calls.length).toBeGreaterThan(0);
  });
});

// ─── Survey Tests ─────────────────────────────────────────────────────────────

describe("survey.getPages", () => {
  it("returns empty array when no pages exist", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.survey.getPages();
    expect(result).toEqual([]);
  });
});

describe("survey.submit", () => {
  it("computes standard segment for neutral answers", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.survey.submit({
      sessionId: "test-session-123",
      answers: { q1: "mild", q2: "sometimes" },
    });
    expect(result.segment).toBe("standard");
  });

  it("computes premium segment for high-score answers", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.survey.submit({
      sessionId: "test-session-456",
      answers: { q1: "severe", q2: "chronic", q3: "daily" },
    });
    expect(result.segment).toBe("premium");
  });

  it("computes vip segment for very high-score answers", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.survey.submit({
      sessionId: "test-session-789",
      answers: { q1: "severe chronic", q2: "vip premium", q3: "professional executive" },
    });
    expect(result.segment).toBe("vip");
  });
});

describe("survey admin procedures", () => {
  it("createPage requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.survey.createPage({ title: "Test Page", order: 0 })
    ).rejects.toThrow();
  });

  it("createPage succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.survey.createPage({ title: "Health Check", order: 1 });
    expect(result.success).toBe(true);
  });

  it("createQuestion requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.survey.createQuestion({
        pageId: 1,
        text: "How are you?",
        type: "single_choice",
        order: 0,
        isRequired: true,
      })
    ).rejects.toThrow();
  });
});

// ─── Products Tests ───────────────────────────────────────────────────────────

describe("products.list", () => {
  it("returns empty array when no products exist", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.products.list({});
    expect(result).toEqual([]);
  });
});

describe("products admin procedures", () => {
  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.products.create({
        name: "Test Supplement",
        price: "150000",
        category: "Supplement",
      })
    ).rejects.toThrow();
  });

  it("create succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.products.create({
      name: "Premium Supplement",
      price: "299000",
      category: "Supplement",
      targetSegment: "premium",
      isActive: true,
      isFeatured: false,
      stock: 100,
    });
    expect(result.success).toBe(true);
  });

  it("adminList requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.products.adminList()).rejects.toThrow();
  });
});

// ─── Settings Tests ───────────────────────────────────────────────────────────

describe("settings.getPublic", () => {
  it("returns default settings when none configured", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.settings.getPublic();
    expect(result.siteName).toBe("VitaWell Health");
    expect(result.shippingNationalCost).toBe(50000);
    expect(result.shippingInternationalCost).toBe(250000);
    expect(result.midtransIsProduction).toBe(false);
  });
});

describe("settings.bulkUpdate", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.settings.bulkUpdate({ settings: { site_name: "Test" } })
    ).rejects.toThrow();
  });

  it("succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.settings.bulkUpdate({
      settings: {
        site_name: "VitaWell Health",
        shipping_national_cost: "75000",
        shipping_international_cost: "300000",
      },
    });
    expect(result.success).toBe(true);
  });
});

// ─── Admin Tests ──────────────────────────────────────────────────────────────

describe("admin.stats", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("pendingOrders");
    expect(result).toHaveProperty("totalProducts");
  });
});

describe("admin.updateUserSegment", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.admin.updateUserSegment({ userId: 1, segment: "premium" })
    ).rejects.toThrow();
  });

  it("succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.updateUserSegment({ userId: 2, segment: "premium" });
    expect(result.success).toBe(true);
  });
});

// ─── Orders Tests ─────────────────────────────────────────────────────────────

describe("orders.myOrders", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.orders.myOrders()).rejects.toThrow();
  });

  it("returns orders for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("orders.getByNumber", () => {
  it("returns null for non-existent order", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.orders.getByNumber({ orderNumber: "VW-NONEXISTENT" });
    expect(result).toBeNull();
  });
});

describe("orders.adminList", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.orders.adminList()).rejects.toThrow();
  });

  it("returns all orders for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.adminList();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── User Profile Tests ───────────────────────────────────────────────────────

describe("userProfile.update", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.userProfile.update({ name: "New Name" })
    ).rejects.toThrow();
  });

  it("succeeds for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.userProfile.update({
      name: "Updated Name",
      phone: "+62812345678",
      city: "Jakarta",
      country: "Indonesia",
    });
    expect(result.success).toBe(true);
  });
});

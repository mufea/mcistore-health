import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createOrder, extendOrderStockReservation, finalizeStockReservation, getAllOrders, getOrderById, getOrderByNumber, getOrderItems, getOrderProductCategories, getProductById, releaseOrderStockReservation } from "./db";
import { applyPaymentReservationOutcome } from "./stockReservation";
import { availableStock, isReservationExpired } from "./reservationPolicy";
import { getProductsAfterReservationCleanup } from "./customerStockRead";
import { getProducts as getCustomerProducts } from "./productRead";

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
  getOrderProductCategories: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getOrdersByUserId: vi.fn().mockResolvedValue([]),
  expireStockReservations: vi.fn().mockResolvedValue(undefined),
  extendOrderStockReservation: vi.fn(),
  reserveStock: vi.fn().mockResolvedValue(true),
  releaseReservedStock: vi.fn().mockResolvedValue(undefined),
  reservationExpiry: vi.fn().mockReturnValue(new Date("2026-08-20T00:10:00.000Z")),
  releaseOrderStockReservation: vi.fn().mockResolvedValue(true),
  finalizeStockReservation: vi.fn().mockResolvedValue(true),
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

describe("orders.exportCsv", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.orders.exportCsv()).rejects.toThrow();
  });

  it("exports filtered orders as formula-safe UTF-8 CSV", async () => {
    vi.mocked(getAllOrders).mockResolvedValueOnce([
      {
        id: 1,
        orderNumber: "VW-CSV-001",
        createdAt: new Date("2026-08-20T00:00:00.000Z"),
        customerName: "=SUM(1,1)",
        customerEmail: "customer@example.com",
        customerPhone: "+62812345678",
        status: "shipped",
        paymentStatus: "paid",
        paymentMethod: "midtrans",
        shippingType: "national",
        subtotal: "100000",
        shippingCost: "10000",
        total: "110000",
        city: "Jakarta",
        province: "DKI Jakarta",
        country: "Indonesia",
      },
    ] as any);

    vi.mocked(getOrderProductCategories).mockResolvedValueOnce(["Supplement"]);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.exportCsv({
      status: "shipped",
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      category: "Supplement",
    });

    expect(result.filename).toMatch(/^orders-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(result.count).toBe(1);
    expect(result.content).toContain("Order Number");
    expect(result.content).toContain("VW-CSV-001");
    expect(result.content).toContain("'=SUM(1,1)");
    expect(result.content).toContain("Supplement");
  });
});

describe("payment.testMidtransConnection", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.payment.testMidtransConnection()).rejects.toThrow();
  });

  it("reports missing saved credentials without calling Midtrans", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.payment.testMidtransConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain("must be saved");
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

// ─── Stock Validation Tests ────────────────────────────────────────────────────

describe("orders.create stock validation", () => {
  const baseOrderInput = {
    customerName: "Stock Test",
    customerEmail: "stock@example.com",
    customerPhone: "+62812345678",
    userAddress: { street: "Jl. Test", city: "Jakarta", province: "DKI Jakarta", postalCode: "12345", country: "Indonesia" },
    shippingAddress: { street: "Jl. Test", city: "Jakarta", province: "DKI Jakarta", postalCode: "12345", country: "Indonesia" },
    shippingType: "national" as const,
    paymentMethod: "midtrans" as const,
    items: [{ productId: 7, productName: "Client supplied name", productPrice: 1, quantity: 2, subtotal: 2 }],
  };

  it("uses server product data for a valid in-stock order", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 7, name: "Verified Product", price: "125000", stock: 3, isActive: true,
    } as any);
    const caller = appRouter.createCaller(makeUserCtx());
    await caller.orders.create(baseOrderInput);

    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: "250000", total: "250000" }),
      [{ productId: 7, productName: "Verified Product", productPrice: 125000, quantity: 2, subtotal: 250000 }],
    );
  });

  it("rejects order creation when current stock is insufficient", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 7, name: "Verified Product", price: "125000", stock: 1, isActive: true,
    } as any);
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.orders.create(baseOrderInput)).rejects.toThrow("only has 1 item(s) available");
  });
});

describe("payment.createMidtransToken stock validation", () => {
  it("rejects payment when stock changes after Checkout", async () => {
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 88,
      orderNumber: "VW-STOCK-001",
      reservationStatus: "active",
      reservationExpiresAt: new Date(Date.now() + 10 * 60_000),
    } as any);
    vi.mocked(getOrderItems).mockResolvedValueOnce([{ productId: 7, quantity: 2 }] as any);
    vi.mocked(getProductById).mockResolvedValueOnce({ id: 7, stock: 1, isActive: true } as any);

    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.payment.createMidtransToken({ orderNumber: "VW-STOCK-001" }))
      .rejects.toThrow("Product stock has changed");
  });

  it("rejects an expired stock reservation before starting Midtrans", async () => {
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 89,
      orderNumber: "VW-EXPIRED-001",
      reservationStatus: "active",
      reservationExpiresAt: new Date(Date.now() - 60_000),
    } as any);
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.payment.createMidtransToken({ orderNumber: "VW-EXPIRED-001" }))
      .rejects.toThrow("stock reservation has expired");
  });
});

describe("manual payment stock reservation lifecycle", () => {
  it("finalizes an active bank-transfer reservation when admin confirms payment", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({ id: 51, reservationStatus: "active" } as any);
    vi.mocked(finalizeStockReservation).mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.orders.updateStatus({ id: 51, paymentStatus: "paid" });
    expect(finalizeStockReservation).toHaveBeenCalledWith(51);
  });

  it("releases an active reservation when admin marks payment as failed", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({ id: 52, reservationStatus: "active" } as any);
    vi.mocked(releaseOrderStockReservation).mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.orders.updateStatus({ id: 52, paymentStatus: "failed" });
    expect(releaseOrderStockReservation).toHaveBeenCalledWith(52);
  });

  it("releases an active reservation when admin cancels a bank-transfer order", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({ id: 53, reservationStatus: "active" } as any);
    vi.mocked(releaseOrderStockReservation).mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.orders.updateStatus({ id: 53, status: "cancelled" });
    expect(releaseOrderStockReservation).toHaveBeenCalledWith(53);
  });

  it("releases an active reservation when admin refunds a bank-transfer payment", async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce({ id: 54, reservationStatus: "active" } as any);
    vi.mocked(releaseOrderStockReservation).mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(makeAdminCtx());
    await caller.orders.updateStatus({ id: 54, paymentStatus: "refunded" });
    expect(releaseOrderStockReservation).toHaveBeenCalledWith(54);
  });
});

describe("orders.extendReservation", () => {
  it("extends a pending reservation once when the server confirms availability", async () => {
    const expiresAt = new Date("2026-08-20T08:05:00.000Z");
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 72,
      orderNumber: "VW-EXTEND-001",
      paymentStatus: "pending",
      status: "pending",
    } as any);
    vi.mocked(extendOrderStockReservation).mockResolvedValueOnce({ ok: true, expiresAt });

    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.orders.extendReservation({ orderNumber: "VW-EXTEND-001" }))
      .resolves.toEqual({ reservationExpiresAt: expiresAt });
    expect(extendOrderStockReservation).toHaveBeenCalledWith(72);
  });

  it("rejects a second extension attempt after the one-time limit", async () => {
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 73,
      orderNumber: "VW-EXTEND-LIMIT",
      paymentStatus: "pending",
      status: "pending",
    } as any);
    vi.mocked(extendOrderStockReservation).mockResolvedValueOnce({ ok: false, reason: "limit" });

    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.orders.extendReservation({ orderNumber: "VW-EXTEND-LIMIT" }))
      .rejects.toThrow("already been extended once");
  });

  it("reports unavailable extension stock when an order item is no longer available", async () => {
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 74,
      orderNumber: "VW-EXTEND-STOCK",
      reservationStatus: "active",
      reservationExtensions: 0,
    } as any);
    vi.mocked(getOrderItems).mockResolvedValueOnce([{ productId: 7, quantity: 2 }] as any);
    vi.mocked(getProductById).mockResolvedValueOnce({ id: 7, stock: 1, isActive: true } as any);

    const caller = appRouter.createCaller(makeCtx());
    const order = await caller.orders.getByNumber({ orderNumber: "VW-EXTEND-STOCK" });
    expect(order?.extensionStockAvailable).toBe(false);
  });
});

describe("lazy reservation expiry policy", () => {
  it("restores visible availability once an active hold reaches its expiry time", () => {
    const now = new Date("2026-08-20T08:00:00.000Z");
    expect(isReservationExpired("active", new Date("2026-08-20T07:50:00.000Z"), now)).toBe(true);
    expect(availableStock(5, 2)).toBe(3);
    // Once lazy cleanup releases the two held units, customer stock reads return full availability.
    expect(availableStock(5, 0)).toBe(5);
  });

  it("runs getProducts cleanup before returning restored customer stock availability", async () => {
    let reservedStock = 2;
    const releaseExpired = vi.fn(async () => { reservedStock = 0; });
    const visibleStock = await getProductsAfterReservationCleanup(
      releaseExpired,
      async () => availableStock(5, reservedStock),
    );
    expect(releaseExpired).toHaveBeenCalledOnce();
    expect(visibleStock).toBe(5);
  });

  it("uses the production getProducts path to clean holds before returning availability", async () => {
    let reservedStock = 2;
    const releaseExpired = vi.fn(async () => { reservedStock = 0; });
    const rows = await getCustomerProducts(releaseExpired, async () => [
      { id: 10, name: "Reserved Product", stock: 5, reservedStock },
    ]);
    expect(releaseExpired).toHaveBeenCalledOnce();
    expect(rows[0].stock).toBe(5);
  });
});

describe("Midtrans reservation outcomes", () => {
  it("finalizes held inventory after a successful Midtrans payment", async () => {
    vi.mocked(finalizeStockReservation).mockResolvedValueOnce(true);
    await applyPaymentReservationOutcome(61, "paid");
    expect(finalizeStockReservation).toHaveBeenCalledWith(61);
  });

  it("releases held inventory after a failed Midtrans payment", async () => {
    vi.mocked(releaseOrderStockReservation).mockResolvedValueOnce(true);
    await applyPaymentReservationOutcome(62, "failed");
    expect(releaseOrderStockReservation).toHaveBeenCalledWith(62);
  });
});

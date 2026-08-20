import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  getOrderProductCategories,
  getOrdersByUserId,
  getProductById,
  getSetting,
  expireStockReservations,
  extendOrderStockReservation,
  finalizeStockReservation,
  releaseOrderStockReservation,
  releaseReservedStock,
  reservationExpiry,
  reserveStock,
  updateOrderStatus,
} from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

const addressSchema = z.object({
  street: z.string().min(1),
  apt: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const orderItemSchema = z.object({
  productId: z.number().int(),
  productName: z.string(),
  productPrice: z.number(),
  quantity: z.number().int().min(1),
  subtotal: z.number(),
});

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  // Prevent spreadsheet formula execution when a CSV is opened in Excel/Sheets.
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export const ordersRouter = router({
  // Public: create order
  create: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(1),
        userAddress: addressSchema,
        shippingAddress: addressSchema,
        shippingType: z.enum(["national", "international"]),
        paymentMethod: z.enum(["bank_transfer", "midtrans"]),
        items: z.array(orderItemSchema).min(1),
        surveyResponseId: z.number().int().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await expireStockReservations();
      const requestedQuantities = input.items.reduce((result, item) => {
        result.set(item.productId, (result.get(item.productId) ?? 0) + item.quantity);
        return result;
      }, new Map<number, number>());

      const trustedItems = [] as typeof input.items;
      for (const [productId, quantity] of requestedQuantities) {
        const product = await getProductById(productId);
        if (!product || !product.isActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "One or more products are no longer available." });
        }
        if (product.stock < quantity) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `${product.name} only has ${product.stock} item(s) available in stock.`,
          });
        }
        const price = Number(product.price);
        trustedItems.push({
          productId,
          productName: product.name,
          productPrice: price,
          quantity,
          subtotal: price * quantity,
        });
      }

      const stockReserved = await reserveStock(trustedItems);
      if (!stockReserved) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "One or more products no longer have enough stock available. Please review your cart.",
        });
      }

      // Get shipping cost from settings
      const shippingKey =
        input.shippingType === "national"
          ? "shipping_national_cost"
          : "shipping_international_cost";
      const shippingCostStr = await getSetting(shippingKey);
      const shippingCost = parseFloat(shippingCostStr ?? "0");

      const subtotal = trustedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal + shippingCost;

      const orderNumber = `VW-${Date.now()}-${nanoid(6).toUpperCase()}`;

      let order;
      try {
        order = await createOrder(
          {
            orderNumber,
            userId: ctx.user?.id,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            streetAddress: input.userAddress.street,
            aptNumber: input.userAddress.apt,
            city: input.userAddress.city,
            province: input.userAddress.province,
            postalCode: input.userAddress.postalCode,
            country: input.userAddress.country,
            shippingStreet: input.shippingAddress.street,
            shippingApt: input.shippingAddress.apt,
            shippingCity: input.shippingAddress.city,
            shippingProvince: input.shippingAddress.province,
            shippingPostal: input.shippingAddress.postalCode,
            shippingCountry: input.shippingAddress.country,
            shippingType: input.shippingType,
            shippingCost: String(shippingCost),
            paymentMethod: input.paymentMethod,
            paymentStatus: "pending",
            status: "pending",
            subtotal: String(subtotal),
            total: String(total),
            surveyResponseId: input.surveyResponseId,
            notes: input.notes,
            reservationStatus: "active",
            reservationExpiresAt: reservationExpiry(),
          },
          trustedItems
        );
      } catch (error) {
        await releaseReservedStock(trustedItems);
        throw error;
      }

      // Notify admin
      try {
        await notifyOwner({
          title: `New Order: ${orderNumber}`,
          content: `A new order has been placed by ${input.customerName} (${input.customerEmail}) for ${trustedItems.length} item(s). Total: IDR ${total.toLocaleString()}. Payment method: ${input.paymentMethod}.`,
        });
      } catch (e) {
        console.warn("Failed to notify owner:", e);
      }

      return { orderId: order.id, orderNumber, total, shippingCost, reservationExpiresAt: order.reservationExpiresAt };
    }),

  // Public: get order by number (for status tracking)
  getByNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) return null;
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),

  // Public: extend an active reservation once during its final two minutes.
  extendReservation: publicProcedure
    .input(z.object({ orderNumber: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }
      if (order.paymentStatus !== "pending" || order.status !== "pending") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This order can no longer extend its reservation." });
      }

      const result = await extendOrderStockReservation(order.id);
      if (!result.ok) {
        const messages = {
          inactive: "This stock reservation is no longer active.",
          expired: "This stock reservation has expired. Please return to Checkout.",
          too_early: "Reservations can only be extended during the final two minutes.",
          limit: "This reservation has already been extended once.",
          unavailable: "Stock is no longer available to extend this reservation.",
        } as const;
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: messages[result.reason] });
      }
      return { reservationExpiresAt: result.expiresAt };
    }),

  // Protected: get current user's orders
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const orders = await getOrdersByUserId(ctx.user.id);
    return orders;
  }),

  // Admin: get all orders
  adminList: adminProcedure.query(async () => {
    const orders = await getAllOrders();
    return orders;
  }),

  // Admin: export the current order report as a UTF-8 CSV file.
  exportCsv: adminProcedure
    .input(z.object({
      status: z.enum(orderStatuses).optional(),
      search: z.string().trim().optional(),
      dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      category: z.string().trim().min(1).optional(),
    }).optional())
    .query(async ({ input }) => {
      const normalizedSearch = input?.search?.toLowerCase() ?? "";
      const ordersWithCategories = await Promise.all((await getAllOrders()).map(async (order) => ({
        ...order,
        categories: await getOrderProductCategories(order.id),
      })));
      const orders = ordersWithCategories.filter((order) => {
        const statusMatches = !input?.status || order.status === input.status;
        const searchMatches = !normalizedSearch || [order.orderNumber, order.customerName, order.customerEmail]
          .some((value) => value.toLowerCase().includes(normalizedSearch));
        const orderDate = order.createdAt.toISOString().slice(0, 10);
        const fromMatches = !input?.dateFrom || orderDate >= input.dateFrom;
        const toMatches = !input?.dateTo || orderDate <= input.dateTo;
        const categoryMatches = !input?.category || order.categories.includes(input.category);
        return statusMatches && searchMatches && fromMatches && toMatches && categoryMatches;
      });

      const headings = [
        "Order Number", "Created At", "Customer Name", "Customer Email", "Customer Phone",
        "Order Status", "Payment Status", "Payment Method", "Shipping Type",
        "Subtotal", "Shipping Cost", "Total", "Product Categories", "City", "Province", "Country",
      ];
      const rows = orders.map((order) => [
        order.orderNumber,
        order.createdAt.toISOString(),
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.status,
        order.paymentStatus,
        order.paymentMethod,
        order.shippingType,
        order.subtotal,
        order.shippingCost,
        order.total,
        order.categories.join("; "),
        order.city,
        order.province,
        order.country,
      ].map(escapeCsvCell).join(","));

      return {
        filename: `orders-${new Date().toISOString().slice(0, 10)}.csv`,
        content: `\ufeff${[headings.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`,
        count: orders.length,
      };
    }),

  // Admin: get order details
  adminGetById: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) return null;
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),

  // Admin: update order status
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const currentOrder = await getOrderById(id);
      if (!currentOrder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const shouldFinalize = data.paymentStatus === "paid" && currentOrder.reservationStatus === "active";
      if (shouldFinalize && !(await finalizeStockReservation(id))) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This stock reservation is no longer active. Please verify product availability before confirming payment.",
        });
      }

      const shouldRelease = data.paymentStatus === "failed" || data.paymentStatus === "refunded" || data.status === "cancelled";
      if (shouldRelease) {
        await releaseOrderStockReservation(id);
      }

      await updateOrderStatus(id, data);
      // Notify admin on important status changes
      if (data.status && ["shipped", "delivered", "cancelled"].includes(data.status)) {
        const order = await getOrderById(id);
        if (order) {
          const statusLabels: Record<string, string> = {
            shipped: "📦 Order Shipped",
            delivered: "✅ Order Delivered",
            cancelled: "❌ Order Cancelled",
          };
          try {
            await notifyOwner({
              title: `${statusLabels[data.status]}: ${order.orderNumber}`,
              content: `Order ${order.orderNumber} for ${order.customerName} (${order.customerEmail}) has been marked as ${data.status}. Total: IDR ${Number(order.total).toLocaleString()}.`,
            });
          } catch (e) {
            console.warn("Failed to notify owner on status update:", e);
          }
        }
      }
      return { success: true };
    }),
});

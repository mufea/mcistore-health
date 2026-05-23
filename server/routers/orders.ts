import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  getOrdersByUserId,
  getSetting,
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
      // Get shipping cost from settings
      const shippingKey =
        input.shippingType === "national"
          ? "shipping_national_cost"
          : "shipping_international_cost";
      const shippingCostStr = await getSetting(shippingKey);
      const shippingCost = parseFloat(shippingCostStr ?? "0");

      const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal + shippingCost;

      const orderNumber = `VW-${Date.now()}-${nanoid(6).toUpperCase()}`;

      const order = await createOrder(
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
        },
        input.items
      );

      // Notify admin
      try {
        await notifyOwner({
          title: `New Order: ${orderNumber}`,
          content: `A new order has been placed by ${input.customerName} (${input.customerEmail}) for ${input.items.length} item(s). Total: IDR ${total.toLocaleString()}. Payment method: ${input.paymentMethod}.`,
        });
      } catch (e) {
        console.warn("Failed to notify owner:", e);
      }

      return { orderId: order.id, orderNumber, total, shippingCost };
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
      await updateOrderStatus(id, data);
      return { success: true };
    }),
});

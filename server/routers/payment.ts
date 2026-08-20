import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getOrderByNumber,
  getOrderItems,
  getProductById,
  getSetting,
  updateOrderByMidtransId,
  updateOrderStatus,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

async function getMidtransConfig() {
  const serverKey = await getSetting("midtrans_server_key");
  const clientKey = await getSetting("midtrans_client_key");
  const isProduction = (await getSetting("midtrans_is_production")) === "true";

  return {
    serverKey: serverKey ?? "",
    clientKey: clientKey ?? "",
    isProduction,
    baseUrl: isProduction
      ? "https://app.midtrans.com/snap/v1"
      : "https://app.sandbox.midtrans.com/snap/v1",
    apiBaseUrl: isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2",
  };
}

export const paymentRouter = router({
  // Create Midtrans Snap token
  createMidtransToken: publicProcedure
    .input(
      z.object({
        orderNumber: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const orderItems = await getOrderItems(order.id);
      for (const item of orderItems) {
        const product = await getProductById(item.productId);
        if (!product || !product.isActive || product.stock < item.quantity) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Product stock has changed. Please return to Checkout and review your cart before payment.",
          });
        }
      }

      const config = await getMidtransConfig();
      if (!config.serverKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Midtrans is not configured. Please set up Midtrans keys in admin settings.",
        });
      }

      const auth = Buffer.from(`${config.serverKey}:`).toString("base64");

      const payload = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: Math.round(Number(order.total)),
        },
        customer_details: {
          first_name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          billing_address: {
            address: `${order.streetAddress} ${order.aptNumber ?? ""}`.trim(),
            city: order.city,
            postal_code: order.postalCode,
            country_code: order.country.substring(0, 2).toUpperCase(),
          },
          shipping_address: {
            address: `${order.shippingStreet} ${order.shippingApt ?? ""}`.trim(),
            city: order.shippingCity,
            postal_code: order.shippingPostal,
            country_code: order.shippingCountry.substring(0, 2).toUpperCase(),
          },
        },
        enabled_payments: ["credit_card", "bca_va", "bni_va", "bri_va", "mandiri_bill", "gopay", "qris"],
        callbacks: {
          finish: `${process.env.VITE_FRONTEND_FORGE_API_URL ? "" : ""}/order/${order.orderNumber}`,
        },
      };

      const response = await fetch(`${config.baseUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Midtrans error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Midtrans transaction",
        });
      }

      const data = await response.json() as { token: string; redirect_url: string };

      // Save token to order
      await updateOrderStatus(order.id, {
        midtransOrderId: order.orderNumber,
        midtransToken: data.token,
        midtransRedirectUrl: data.redirect_url,
      });

      return {
        token: data.token,
        redirectUrl: data.redirect_url,
        clientKey: config.clientKey,
        isProduction: config.isProduction,
      };
    }),

  // Get Midtrans client key (public)
  getClientKey: publicProcedure.query(async () => {
    const clientKey = await getSetting("midtrans_client_key");
    const isProduction = (await getSetting("midtrans_is_production")) === "true";
    return { clientKey: clientKey ?? "", isProduction };
  }),

  // Admin-only credential test. A read-only request for a deliberately unknown order
  // verifies that the Midtrans API is reachable without creating a transaction.
  testMidtransConnection: adminProcedure.mutation(async () => {
    const config = await getMidtransConfig();
    const merchantId = await getSetting("midtrans_merchant_id");
    const environment = config.isProduction ? "production" : "sandbox";

    if (!merchantId || !config.serverKey || !config.clientKey) {
      return {
        success: false,
        environment,
        message: "Merchant ID, Server Key, and Client Key must be saved before testing Midtrans.",
      };
    }

    const auth = Buffer.from(`${config.serverKey}:`).toString("base64");
    const probeOrderId = `MCI-CONNECTION-CHECK-${Date.now()}`;

    try {
      const response = await fetch(`${config.apiBaseUrl}/${probeOrderId}/status`, {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          environment,
          message: "Midtrans rejected the saved Server Key. Check the selected environment and credentials.",
        };
      }

      // 404 is the expected response for the deliberately unknown order ID. Other
      // non-auth client responses still demonstrate a reachable, authenticated API.
      if (response.status < 500) {
        return {
          success: true,
          environment,
          message: `Connected to the Midtrans ${environment} API successfully.`,
        };
      }

      return {
        success: false,
        environment,
        message: "Midtrans is temporarily unavailable. Please try again shortly.",
      };
    } catch {
      return {
        success: false,
        environment,
        message: "Unable to reach Midtrans. Check the network connection and try again.",
      };
    }
  }),

  // Check payment status
  checkStatus: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) return null;
      return {
        paymentStatus: order.paymentStatus,
        status: order.status,
        paymentMethod: order.paymentMethod,
        midtransPaymentType: order.midtransPaymentType,
      };
    }),
});

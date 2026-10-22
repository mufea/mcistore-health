import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "crypto";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getActiveProductsForSitemap, getOrderByNumber, getProductById, getSetting, updateOrderByMidtransId, updateOrderStatus } from "../db";
import { notifyOwner } from "./notification";
import { applyPaymentReservationOutcome } from "../stockReservation";
import { buildSitemapXml } from "../sitemap";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const products = await getActiveProductsForSitemap();
      res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(buildSitemapXml(products));
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).type("text/plain").send("Unable to generate sitemap");
    }
  });

  app.get("/products/:id(\\d+)", async (req, res, next) => {
    try {
      const product = await getProductById(Number(req.params.id));
      if (!product?.slug) {
        next();
        return;
      }
      res.redirect(301, `/products/${encodeURIComponent(product.slug)}`);
    } catch (error) {
      next(error);
    }
  });

  // ─── Midtrans Webhook ──────────────────────────────────────────────────────
  app.post("/api/midtrans/webhook", async (req, res) => {
    try {
      const notification = req.body as {
        order_id: string;
        status_code: string;
        gross_amount: string;
        signature_key: string;
        transaction_status: string;
        fraud_status?: string;
        payment_type?: string;
      };

      const serverKey = await getSetting("midtrans_server_key");
      if (!serverKey) {
        console.error("Midtrans server key not configured");
        res.status(500).json({ error: "Not configured" });
        return;
      }

      // Verify signature
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
        .digest("hex");

      if (expectedSignature !== notification.signature_key) {
        console.error("Invalid Midtrans signature");
        res.status(403).json({ error: "Invalid signature" });
        return;
      }

      const { transaction_status, fraud_status, order_id, payment_type } = notification;

      let paymentStatus: "pending" | "paid" | "failed" | "refunded" = "pending";
      let orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | undefined;

      if (transaction_status === "capture") {
        if (fraud_status === "accept") {
          paymentStatus = "paid";
          orderStatus = "processing";
        } else if (fraud_status === "challenge") {
          paymentStatus = "pending";
        }
      } else if (transaction_status === "settlement") {
        paymentStatus = "paid";
        orderStatus = "processing";
      } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
        paymentStatus = "failed";
        orderStatus = "cancelled";
      } else if (transaction_status === "refund") {
        paymentStatus = "refunded";
      }

      await updateOrderByMidtransId(order_id, {
        paymentStatus,
        ...(orderStatus ? { status: orderStatus } : {}),
        midtransPaymentType: payment_type,
      });

      const order = await getOrderByNumber(order_id);
      if (order) {
        await applyPaymentReservationOutcome(order.id, paymentStatus);
      }

      // Notify admin on successful payment
      if (paymentStatus === "paid") {
        if (order) {
          try {
            await notifyOwner({
              title: `Payment Confirmed: ${order_id}`,
              content: `Payment confirmed for order ${order_id} via ${payment_type}. Amount: IDR ${notification.gross_amount}.`,
            });
          } catch (e) {
            console.warn("Failed to notify owner:", e);
          }
        }
      }

      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Midtrans webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
 
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

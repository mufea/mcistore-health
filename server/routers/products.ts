import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductById,
  getProductBySlug,
  getProducts,
  getStockHistory,
  updateProductWithStockAudit,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { createProductSlug, PRODUCT_SLUG_PATTERN, slugify } from "@shared/slug";
import { isYouTubeUrl } from "@shared/youtube";

const youtubeUrlSchema = z.string().trim().max(500).refine(
  (value) => value === "" || isYouTubeUrl(value),
  "Video URL must be a valid YouTube link",
).optional();

export const productsRouter = router({
  // Public: list products filtered by user segment
  list: publicProcedure
    .input(
      z.object({
        segment: z.enum(["standard", "premium", "vip"]).optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const items = await getProducts(input.segment);
      if (input.category) {
        return items.filter((p) => p.category === input.category);
      }
      return items;
    }),

  // Public: get single product
  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const product = await getProductById(input.id);
      if (!product || !product.isActive) return null;

      // Enforce segment restriction
      const userSegment = ctx.user?.segment ?? "standard";
      const segmentOrder = { all: 0, standard: 1, premium: 2, vip: 3 };
      const userLevel = segmentOrder[userSegment] ?? 1;
      const productLevel = segmentOrder[product.targetSegment] ?? 0;

      if (product.targetSegment !== "all" && productLevel > userLevel) {
        return null; // Restricted
      }

      return { ...product, stock: Math.max(0, product.stock - product.reservedStock) };
    }),

  // Public: get a single product by its stable SEO slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(255) }))
    .query(async ({ input, ctx }) => {
      const product = await getProductBySlug(input.slug);
      if (!product || !product.isActive) return null;

      const userSegment = ctx.user?.segment ?? "standard";
      const segmentOrder = { all: 0, standard: 1, premium: 2, vip: 3 };
      const userLevel = segmentOrder[userSegment] ?? 1;
      const productLevel = segmentOrder[product.targetSegment] ?? 0;

      if (product.targetSegment !== "all" && productLevel > userLevel) {
        return null;
      }

      return { ...product, stock: Math.max(0, product.stock - product.reservedStock) };
    }),

  // Admin: list all products
  adminList: adminProcedure.query(async () => {
    return getAllProductsAdmin();
  }),

  checkSlug: adminProcedure
    .input(z.object({ slug: z.string().min(1).max(255), excludeId: z.number().int().positive().optional() }))
    .query(async ({ input }) => {
      const existing = await getProductBySlug(input.slug);
      return {
        available: !existing || existing.id === input.excludeId,
      };
    }),

  stockHistory: adminProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ input }) => getStockHistory(input.productId)),

  // Admin: create product
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().trim().min(1).max(255).regex(PRODUCT_SLUG_PATTERN, "Slug must use lowercase letters, numbers, and single hyphens").optional(),
        description: z.string().optional(),
        price: z.string(),
        category: z.string().min(1),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        images: z.array(z.object({ url: z.string(), key: z.string() })).optional(),
        videoUrl: youtubeUrlSchema,
        targetSegment: z.enum(["all", "standard", "premium", "vip"]).default("all"),
        stock: z.number().int().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        tags: z.array(z.string()).optional(),
        recommendationTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const slug = input.slug?.trim() || createProductSlug(input.name);
      const existing = await getProductBySlug(slug);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "A product with this slug already exists" });
      await createProduct({ ...input, slug } as any);
      return { success: true };
    }),

  // Admin: update product
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).optional(),
        slug: z.string().trim().min(1).max(255).regex(PRODUCT_SLUG_PATTERN, "Slug must use lowercase letters, numbers, and single hyphens").optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        images: z.array(z.object({ url: z.string(), key: z.string() })).optional(),
        videoUrl: youtubeUrlSchema,
        targetSegment: z.enum(["all", "standard", "premium", "vip"]).optional(),
        stock: z.number().int().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        recommendationTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, slug, ...rest } = input;
      const normalizedSlug = slug === undefined ? undefined : slugify(slug);
      if (normalizedSlug) {
        const existing = await getProductBySlug(normalizedSlug);
        if (existing && existing.id !== id) {
          throw new TRPCError({ code: "CONFLICT", message: "A product with this slug already exists" });
        }
      }
      const data = { ...rest, ...(normalizedSlug ? { slug: normalizedSlug } : {}) };
      await updateProductWithStockAudit(id, data as any, { userId: ctx.user.id, name: ctx.user.name });
      return { success: true };
    }),

  // Admin: delete product
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),

  // Admin: upload product image to S3
  uploadImage: adminProcedure
    .input(
      z.object({
        // Base64-encoded file content
        base64: z.string(),
        // Original filename for extension detection
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const ext = input.filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const key = `products/img_${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { key: savedKey, url } = await storagePut(key, buffer, input.mimeType);
      return { key: savedKey, url };
    }),
});

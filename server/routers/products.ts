import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductById,
  getProducts,
  updateProduct,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

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

      return product;
    }),

  // Admin: list all products
  adminList: adminProcedure.query(async () => {
    return getAllProductsAdmin();
  }),

  // Admin: create product
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        category: z.string().min(1),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        targetSegment: z.enum(["all", "standard", "premium", "vip"]).default("all"),
        stock: z.number().int().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        tags: z.array(z.string()).optional(),
        recommendationTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createProduct(input as any);
      return { success: true };
    }),

  // Admin: update product
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        targetSegment: z.enum(["all", "standard", "premium", "vip"]).optional(),
        stock: z.number().int().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        recommendationTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data as any);
      return { success: true };
    }),

  // Admin: delete product
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),
});

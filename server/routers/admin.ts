import { z } from "zod";
import { getAllUsers, getDashboardStats, updateUserProfile } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  // Admin: get dashboard stats
  stats: adminProcedure.query(async () => {
    return getDashboardStats();
  }),

  // Admin: list all users
  listUsers: adminProcedure.query(async () => {
    return getAllUsers();
  }),

  // Admin: update user segment
  updateUserSegment: adminProcedure
    .input(
      z.object({
        userId: z.number().int(),
        segment: z.enum(["standard", "premium", "vip"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateUserProfile(input.userId, { segment: input.segment });
      return { success: true };
    }),

  // Admin: update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number().int(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await import("../db").then((m) => m.getDb());
      if (!db) throw new Error("DB unavailable");
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),
});

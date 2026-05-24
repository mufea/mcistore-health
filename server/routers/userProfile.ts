import { z } from "zod";
import { updateUserProfile } from "../db";
import { getUserByOpenId } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const userProfileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      phone: ctx.user.phone,
      streetAddress: ctx.user.streetAddress,
      aptNumber: ctx.user.aptNumber,
      city: ctx.user.city,
      province: ctx.user.province,
      postalCode: ctx.user.postalCode,
      country: ctx.user.country,
      segment: ctx.user.segment,
      preferredLanguage: ctx.user.preferredLanguage,
      createdAt: ctx.user.createdAt,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        streetAddress: z.string().optional(),
        aptNumber: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        preferredLanguage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

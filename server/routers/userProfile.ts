import { z } from "zod";
import { updateUserProfile } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const userProfileRouter = router({
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

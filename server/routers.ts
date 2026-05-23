import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { surveyRouter } from "./routers/survey";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { settingsRouter } from "./routers/settings";
import { adminRouter } from "./routers/admin";
import { paymentRouter } from "./routers/payment";
import { userProfileRouter } from "./routers/userProfile";
import { chatbotRouter } from "./routers/chatbot";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  survey: surveyRouter,
  products: productsRouter,
  orders: ordersRouter,
  settings: settingsRouter,
  admin: adminRouter,
  payment: paymentRouter,
  userProfile: userProfileRouter,
  chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;

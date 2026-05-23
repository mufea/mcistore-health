import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createSurveyPage,
  createSurveyQuestion,
  deleteSurveyPage,
  deleteSurveyQuestion,
  getAllSurveyQuestions,
  getSurveyPages,
  getSurveyQuestionsForPage,
  saveSurveyResponse,
  updateSurveyPage,
  updateSurveyQuestion,
} from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

// Compute recommended segment from survey answers
function computeSegment(answers: Record<string, string | string[]>): "standard" | "premium" | "vip" {
  let score = 0;
  const values = Object.values(answers).flat().join(" ").toLowerCase();

  // Premium indicators
  if (values.includes("severe") || values.includes("chronic")) score += 3;
  if (values.includes("premium") || values.includes("vip")) score += 5;
  if (values.includes("multiple") || values.includes("several")) score += 2;
  if (values.includes("daily") || values.includes("always")) score += 2;
  if (values.includes("professional") || values.includes("executive")) score += 3;

  if (score >= 8) return "vip";
  if (score >= 4) return "premium";
  return "standard";
}

export const surveyRouter = router({
  // Public: get all survey pages with their questions
  getPages: publicProcedure.query(async () => {
    const pages = await getSurveyPages(true);
    const pagesWithQuestions = await Promise.all(
      pages.map(async (page) => {
        const questions = await getSurveyQuestionsForPage(page.id, true);
        return { ...page, questions };
      })
    );
    return pagesWithQuestions;
  }),

  // Public: submit survey answers and get segment recommendation
  submit: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const segment = computeSegment(input.answers);
      await saveSurveyResponse({
        sessionId: input.sessionId,
        userId: ctx.user?.id,
        answers: input.answers,
        recommendedSegment: segment,
      });
      return { segment };
    }),

  // Admin: get all pages (including inactive)
  adminGetPages: adminProcedure.query(async () => {
    const pages = await getSurveyPages(false);
    const pagesWithQuestions = await Promise.all(
      pages.map(async (page) => {
        const questions = await getSurveyQuestionsForPage(page.id, false);
        return { ...page, questions };
      })
    );
    return pagesWithQuestions;
  }),

  // Admin: create a survey page
  createPage: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        order: z.number().int().default(0),
      })
    )
    .mutation(async ({ input }) => {
      await createSurveyPage(input);
      return { success: true };
    }),

  // Admin: update a survey page
  updatePage: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        order: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSurveyPage(id, data);
      return { success: true };
    }),

  // Admin: delete a survey page (and its questions)
  deletePage: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteSurveyPage(input.id);
      return { success: true };
    }),

  // Admin: create a survey question
  createQuestion: adminProcedure
    .input(
      z.object({
        pageId: z.number().int(),
        text: z.string().min(1),
        type: z.enum(["single_choice", "multiple_choice", "text", "scale"]),
        options: z.array(z.string()).optional(),
        order: z.number().int().default(0),
        isRequired: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await createSurveyQuestion(input);
      return { success: true };
    }),

  // Admin: update a survey question
  updateQuestion: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        pageId: z.number().int().optional(),
        text: z.string().min(1).optional(),
        type: z.enum(["single_choice", "multiple_choice", "text", "scale"]).optional(),
        options: z.array(z.string()).optional(),
        order: z.number().int().optional(),
        isRequired: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSurveyQuestion(id, data);
      return { success: true };
    }),

  // Admin: delete a survey question
  deleteQuestion: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteSurveyQuestion(input.id);
      return { success: true };
    }),
});
